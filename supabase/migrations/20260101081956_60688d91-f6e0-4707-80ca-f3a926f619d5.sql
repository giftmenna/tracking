-- Create app role enum for user roles
CREATE TYPE public.app_role AS ENUM ('admin', 'staff', 'driver', 'customer');

-- Create shipment status enum
CREATE TYPE public.shipment_status AS ENUM (
  'created',
  'received_at_origin',
  'in_transit',
  'arrived_at_destination',
  'out_for_delivery',
  'delivered',
  'exception',
  'returned',
  'cancelled'
);

-- Create service level enum
CREATE TYPE public.service_level AS ENUM ('standard', 'express', 'same_day');

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  phone TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create user_roles table (separate from profiles for security)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL DEFAULT 'customer',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);

-- Create branches table
CREATE TABLE public.branches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT,
  country TEXT NOT NULL DEFAULT 'Nigeria',
  phone TEXT,
  email TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create customers table
CREATE TABLE public.customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT NOT NULL,
  company TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  country TEXT NOT NULL DEFAULT 'Nigeria',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create drivers table
CREATE TABLE public.drivers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  license_number TEXT,
  vehicle_type TEXT,
  vehicle_plate TEXT,
  branch_id UUID REFERENCES public.branches(id) ON DELETE SET NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create pricing_rules table
CREATE TABLE public.pricing_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  origin_zone TEXT,
  destination_zone TEXT,
  base_price DECIMAL(10, 2) NOT NULL DEFAULT 0,
  price_per_kg DECIMAL(10, 2) NOT NULL DEFAULT 0,
  express_multiplier DECIMAL(3, 2) NOT NULL DEFAULT 1.5,
  same_day_multiplier DECIMAL(3, 2) NOT NULL DEFAULT 2.0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create shipments table
CREATE TABLE public.shipments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tracking_number TEXT NOT NULL UNIQUE,
  
  -- Sender info
  sender_name TEXT NOT NULL,
  sender_phone TEXT NOT NULL,
  sender_email TEXT,
  sender_address TEXT NOT NULL,
  sender_city TEXT NOT NULL,
  sender_state TEXT,
  
  -- Receiver info
  receiver_name TEXT NOT NULL,
  receiver_phone TEXT NOT NULL,
  receiver_email TEXT,
  receiver_address TEXT NOT NULL,
  receiver_city TEXT NOT NULL,
  receiver_state TEXT,
  
  -- Package info
  package_description TEXT,
  weight DECIMAL(10, 2) NOT NULL DEFAULT 0,
  dimensions TEXT,
  declared_value DECIMAL(10, 2),
  
  -- Service info
  service_level service_level NOT NULL DEFAULT 'standard',
  origin_branch_id UUID REFERENCES public.branches(id),
  destination_branch_id UUID REFERENCES public.branches(id),
  current_branch_id UUID REFERENCES public.branches(id),
  assigned_driver_id UUID REFERENCES public.drivers(id),
  
  -- Pricing
  base_price DECIMAL(10, 2) NOT NULL DEFAULT 0,
  weight_charge DECIMAL(10, 2) NOT NULL DEFAULT 0,
  service_charge DECIMAL(10, 2) NOT NULL DEFAULT 0,
  insurance_fee DECIMAL(10, 2) NOT NULL DEFAULT 0,
  total_amount DECIMAL(10, 2) NOT NULL DEFAULT 0,
  payment_status TEXT NOT NULL DEFAULT 'unpaid',
  
  -- Status
  status shipment_status NOT NULL DEFAULT 'created',
  current_location TEXT,
  estimated_delivery TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  
  -- POD
  pod_signature TEXT,
  pod_photo_url TEXT,
  pod_receiver_name TEXT,
  
  -- Metadata
  notes TEXT,
  created_by UUID REFERENCES auth.users(id),
  customer_id UUID REFERENCES public.customers(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create tracking_events table
CREATE TABLE public.tracking_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shipment_id UUID NOT NULL REFERENCES public.shipments(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  status shipment_status NOT NULL,
  location TEXT,
  branch_id UUID REFERENCES public.branches(id),
  description TEXT,
  notes TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create settings table for admin configurations
CREATE TABLE public.settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT NOT NULL UNIQUE,
  value JSONB NOT NULL DEFAULT '{}',
  description TEXT,
  updated_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.drivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pricing_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shipments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tracking_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

-- Create security definer function for role checking
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Create function to check if user is admin or staff
CREATE OR REPLACE FUNCTION public.is_admin_or_staff(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role IN ('admin', 'staff')
  )
$$;

-- Profiles policies
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT
  USING (public.is_admin_or_staff(auth.uid()));

-- User roles policies (only admins can manage)
CREATE POLICY "Admins can view all roles"
  ON public.user_roles FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert roles"
  ON public.user_roles FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete roles"
  ON public.user_roles FOR DELETE
  USING (public.has_role(auth.uid(), 'admin'));

-- Branches policies (public read, admin write)
CREATE POLICY "Anyone can view active branches"
  ON public.branches FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage branches"
  ON public.branches FOR ALL
  USING (public.is_admin_or_staff(auth.uid()));

-- Customers policies
CREATE POLICY "Staff can view all customers"
  ON public.customers FOR SELECT
  USING (public.is_admin_or_staff(auth.uid()));

CREATE POLICY "Staff can manage customers"
  ON public.customers FOR ALL
  USING (public.is_admin_or_staff(auth.uid()));

-- Drivers policies
CREATE POLICY "Staff can view all drivers"
  ON public.drivers FOR SELECT
  USING (public.is_admin_or_staff(auth.uid()));

CREATE POLICY "Admins can manage drivers"
  ON public.drivers FOR ALL
  USING (public.is_admin_or_staff(auth.uid()));

-- Pricing rules policies
CREATE POLICY "Staff can view pricing rules"
  ON public.pricing_rules FOR SELECT
  USING (public.is_admin_or_staff(auth.uid()));

CREATE POLICY "Admins can manage pricing rules"
  ON public.pricing_rules FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- Shipments policies
CREATE POLICY "Staff can view all shipments"
  ON public.shipments FOR SELECT
  USING (public.is_admin_or_staff(auth.uid()));

CREATE POLICY "Staff can manage shipments"
  ON public.shipments FOR ALL
  USING (public.is_admin_or_staff(auth.uid()));

CREATE POLICY "Customers can view their own shipments"
  ON public.shipments FOR SELECT
  USING (created_by = auth.uid() OR customer_id IN (
    SELECT id FROM public.customers WHERE user_id = auth.uid()
  ));

-- Tracking events policies
CREATE POLICY "Anyone can view tracking events"
  ON public.tracking_events FOR SELECT
  USING (true);

CREATE POLICY "Staff can create tracking events"
  ON public.tracking_events FOR INSERT
  WITH CHECK (public.is_admin_or_staff(auth.uid()));

-- Settings policies
CREATE POLICY "Staff can view settings"
  ON public.settings FOR SELECT
  USING (public.is_admin_or_staff(auth.uid()));

CREATE POLICY "Admins can manage settings"
  ON public.settings FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (NEW.id, NEW.raw_user_meta_data ->> 'full_name');
  RETURN NEW;
END;
$$;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Create function to generate tracking number
CREATE OR REPLACE FUNCTION public.generate_tracking_number()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  prefix TEXT := 'SS';
  timestamp_part TEXT;
  random_part TEXT;
  result TEXT;
BEGIN
  timestamp_part := to_char(now(), 'YYMMDDHH24');
  random_part := upper(substring(md5(random()::text) from 1 for 6));
  result := prefix || timestamp_part || random_part;
  RETURN result;
END;
$$;

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_branches_updated_at
  BEFORE UPDATE ON public.branches
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_customers_updated_at
  BEFORE UPDATE ON public.customers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_drivers_updated_at
  BEFORE UPDATE ON public.drivers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_pricing_rules_updated_at
  BEFORE UPDATE ON public.pricing_rules
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_shipments_updated_at
  BEFORE UPDATE ON public.shipments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_settings_updated_at
  BEFORE UPDATE ON public.settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- Insert default pricing rule
INSERT INTO public.pricing_rules (name, origin_zone, destination_zone, base_price, price_per_kg, express_multiplier, same_day_multiplier)
VALUES ('Default Pricing', 'all', 'all', 1500, 200, 1.5, 2.0);

-- Insert default settings
INSERT INTO public.settings (key, value, description)
VALUES 
  ('company', '{"name": "SwiftShip", "phone": "+234 800 123 4567", "email": "support@swiftship.com", "address": "123 Shipping Lane, Lagos, Nigeria"}', 'Company information'),
  ('pricing', '{"currency": "NGN", "tax_rate": 7.5, "insurance_rate": 2}', 'Pricing configuration');

-- Enable realtime for shipments and tracking_events
ALTER PUBLICATION supabase_realtime ADD TABLE public.shipments;
ALTER PUBLICATION supabase_realtime ADD TABLE public.tracking_events;