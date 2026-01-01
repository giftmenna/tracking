-- Quick setup for shipments table (run this in Supabase SQL Editor)

-- Drop types if they exist (to handle re-runs)
DROP TYPE IF EXISTS public.shipment_status CASCADE;
DROP TYPE IF EXISTS public.service_level CASCADE;

-- Create types
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

CREATE TYPE public.service_level AS ENUM (
  'standard',
  'express',
  'same_day'
);

-- Create shipments table
CREATE TABLE IF NOT EXISTS public.shipments (
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
  origin_branch_id UUID,
  destination_branch_id UUID,
  current_branch_id UUID,
  assigned_driver_id UUID,
  
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
  created_by UUID,
  customer_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.shipments ENABLE ROW LEVEL SECURITY;

-- Create permissive policy
CREATE POLICY "Enable all operations for shipments" ON public.shipments
  FOR ALL USING (true) WITH CHECK (true);

-- Create other essential tables
DROP TABLE IF EXISTS public.pricing_rules CASCADE;

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

ALTER TABLE public.pricing_rules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable all operations for pricing_rules" ON public.pricing_rules
  FOR ALL USING (true) WITH CHECK (true);

-- Insert default data
INSERT INTO public.pricing_rules (name, origin_zone, destination_zone, base_price, price_per_kg, express_multiplier, same_day_multiplier)
VALUES ('Default Pricing', 'all', 'all', 1500, 200, 1.5, 2.0);

-- Create tracking number generation function
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

-- Create update timestamp function
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
DROP TRIGGER IF EXISTS update_shipments_updated_at ON public.shipments;
CREATE TRIGGER update_shipments_updated_at
  BEFORE UPDATE ON public.shipments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS update_pricing_rules_updated_at ON public.pricing_rules;
CREATE TRIGGER update_pricing_rules_updated_at
  BEFORE UPDATE ON public.pricing_rules
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
