-- Clean database setup for SwiftShip - handles existing objects
-- Run this in Supabase SQL Editor

-- Step 1: Create types (drop if exists first)
DO $$
BEGIN
    DROP TYPE IF EXISTS public.transport_mode CASCADE;
EXCEPTION
    WHEN OTHERS THEN NULL;
END $$;

DO $$
BEGIN
    DROP TYPE IF EXISTS public.shipment_status CASCADE;
EXCEPTION
    WHEN OTHERS THEN NULL;
END $$;

DO $$
BEGIN
    DROP TYPE IF EXISTS public.service_level CASCADE;
EXCEPTION
    WHEN OTHERS THEN NULL;
END $$;

-- Step 1: Create the update_updated_at_column function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Step 2: Create transport mode enum
DO $$
BEGIN
    DROP TYPE IF EXISTS public.transport_mode CASCADE;
EXCEPTION
    WHEN OTHERS THEN NULL;
END $$;

CREATE TYPE public.transport_mode AS ENUM (
    'road',
    'sea',
    'air'
);

-- Step 3: Create service level enum
DO $$
BEGIN
    DROP TYPE IF EXISTS public.service_level CASCADE;
EXCEPTION
    WHEN OTHERS THEN NULL;
END $$;

CREATE TYPE public.service_level AS ENUM (
    'standard',
    'express',
    'same_day'
);

-- Step 4: Create shipment status enum
DO $$
BEGIN
    DROP TYPE IF EXISTS public.shipment_status CASCADE;
EXCEPTION
    WHEN OTHERS THEN NULL;
END $$;

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

-- Step 2: Create shipments table (drop if exists)
DROP TABLE IF EXISTS public.shipments CASCADE;

CREATE TABLE public.shipments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tracking_number TEXT NOT NULL UNIQUE,
    sender_name TEXT NOT NULL,
    sender_phone TEXT NOT NULL,
    sender_email TEXT,
    sender_address TEXT NOT NULL,
    sender_city TEXT NOT NULL,
    sender_state TEXT,
    receiver_name TEXT NOT NULL,
    receiver_phone TEXT NOT NULL,
    receiver_email TEXT,
    receiver_address TEXT NOT NULL,
    receiver_city TEXT NOT NULL,
    receiver_state TEXT,
    delivery_address TEXT,
    delivery_city TEXT,
    delivery_state TEXT,
    package_description TEXT,
    weight DECIMAL(10, 2) NOT NULL DEFAULT 0,
    dimensions TEXT,
    declared_value DECIMAL(10, 2),
    service_level service_level NOT NULL DEFAULT 'standard',
    transport_mode transport_mode NOT NULL DEFAULT 'road',
    origin_branch_id UUID,
    destination_branch_id UUID,
    current_branch_id UUID,
    assigned_driver_id UUID,
    base_price DECIMAL(10, 2) NOT NULL DEFAULT 0,
    weight_charge DECIMAL(10, 2) NOT NULL DEFAULT 0,
    service_charge DECIMAL(10, 2) NOT NULL DEFAULT 0,
    insurance_fee DECIMAL(10, 2) NOT NULL DEFAULT 0,
    total_amount DECIMAL(10, 2) NOT NULL DEFAULT 0,
    payment_status TEXT NOT NULL DEFAULT 'unpaid',
    amount_paid DECIMAL(10, 2),
    status shipment_status NOT NULL DEFAULT 'created',
    current_location TEXT,
    estimated_delivery TIMESTAMPTZ,
    delivered_at TIMESTAMPTZ,
    pickup_date TIMESTAMPTZ,
    notes TEXT,
    created_by UUID,
    customer_id UUID,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Step 3: Enable RLS and create policy
ALTER TABLE public.shipments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Enable all operations for shipments" ON public.shipments;
CREATE POLICY "Enable all operations for shipments" ON public.shipments
    FOR ALL USING (true) WITH CHECK (true);

-- Step 4: Create pricing rules table (drop if exists)
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

DROP POLICY IF EXISTS "Enable all operations for pricing_rules" ON public.pricing_rules;
CREATE POLICY "Enable all operations for pricing_rules" ON public.pricing_rules
    FOR ALL USING (true) WITH CHECK (true);

-- Step 5: Insert default data
INSERT INTO public.pricing_rules (name, origin_zone, destination_zone, base_price, price_per_kg, express_multiplier, same_day_multiplier)
VALUES ('Default Pricing', 'all', 'all', 15, 5, 1.5, 2.0);

-- Step 5.5: Create tracking events table (drop if exists)
DROP TABLE IF EXISTS public.tracking_events CASCADE;

CREATE TABLE public.tracking_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shipment_id UUID NOT NULL REFERENCES public.shipments(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL,
    status shipment_status NOT NULL,
    description TEXT,
    location TEXT,
    created_by UUID,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.tracking_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Enable all operations for tracking_events" ON public.tracking_events;
CREATE POLICY "Enable all operations for tracking_events" ON public.tracking_events
    FOR ALL USING (true) WITH CHECK (true);

-- Step 6: Create tracking number generation function
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

-- Step 7: Create update timestamp function
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Step 8: Create triggers for updated_at
DROP TRIGGER IF EXISTS update_shipments_updated_at ON public.shipments;
CREATE TRIGGER update_shipments_updated_at
  BEFORE UPDATE ON public.shipments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS update_pricing_rules_updated_at ON public.pricing_rules;
CREATE TRIGGER update_pricing_rules_updated_at
  BEFORE UPDATE ON public.pricing_rules
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS update_tracking_events_updated_at ON public.tracking_events;
CREATE TRIGGER update_tracking_events_updated_at
  BEFORE UPDATE ON public.tracking_events
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- Step 9: Verify function exists
DO $$
DECLARE
    function_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO function_count FROM pg_proc WHERE proname = 'generate_tracking_number';
    
    RAISE NOTICE 'Database setup completed successfully!';
    RAISE NOTICE 'generate_tracking_number function created: %', function_count;
    RAISE NOTICE 'Tables created: shipments, pricing_rules, tracking_events';
    RAISE NOTICE 'Policies created: Enable all operations';
    RAISE NOTICE 'Transport mode enum created: road, sea, air';
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Setup completed with some issues';
END;
$$;

-- Step 5: Create settings table (drop if exists)
DROP TABLE IF EXISTS public.settings CASCADE;

CREATE TABLE public.settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key TEXT NOT NULL UNIQUE,
    value TEXT,
    description TEXT,
    category TEXT NOT NULL DEFAULT 'general',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS and create policy for settings
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Enable all operations for settings" ON public.settings;
CREATE POLICY "Enable all operations for settings" ON public.settings
    FOR ALL USING (true) WITH CHECK (true);

-- Create trigger for settings updated_at
CREATE TRIGGER update_settings_updated_at
    BEFORE UPDATE ON public.settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Insert default settings
INSERT INTO public.settings (key, value, description, category) VALUES
    ('company_name', 'SwiftShip Logistics', 'Company name displayed throughout the application', 'general'),
    ('company_email', 'info@swiftship.com', 'Company contact email', 'general'),
    ('company_phone', '+1 (555) 123-4567', 'Company contact phone', 'general'),
    ('company_address', '123 Logistics Street, Shipping City, SC 12345', 'Company physical address', 'general'),
    ('default_currency', 'USD', 'Default currency for pricing', 'general'),
    ('tracking_url_prefix', 'SS', 'Prefix for tracking numbers', 'general'),
    ('auto_tracking_numbers', 'true', 'Automatically generate tracking numbers', 'general'),
    ('email_notifications', 'true', 'Enable email notifications for customers', 'notifications'),
    ('sms_notifications', 'false', 'Enable SMS notifications for customers', 'notifications'),
    ('default_service_level', 'standard', 'Default service level for new shipments', 'shipping'),
    ('default_transport_mode', 'road', 'Default transport mode for new shipments', 'shipping'),
    ('insurance_rate', '0.02', 'Insurance rate as decimal (0.02 = 2%)', 'pricing'),
    ('tax_rate', '0.08', 'Tax rate as decimal (0.08 = 8%)', 'pricing'),
    ('fuel_surcharge', '0.05', 'Fuel surcharge rate as decimal (0.05 = 5%)', 'pricing');

-- Verification message
SELECT 'Settings table created with default values' as status;
