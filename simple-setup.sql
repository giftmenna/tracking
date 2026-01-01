-- Simple database setup for SwiftShip
-- Run this step by step in Supabase SQL Editor

-- Step 1: Create shipment status type
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

-- Step 2: Create service level type
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

-- Step 3: Create shipments table
CREATE TABLE IF NOT EXISTS public.shipments (
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
    package_description TEXT,
    weight DECIMAL(10, 2) NOT NULL DEFAULT 0,
    dimensions TEXT,
    declared_value DECIMAL(10, 2),
    service_level service_level NOT NULL DEFAULT 'standard',
    base_price DECIMAL(10, 2) NOT NULL DEFAULT 0,
    weight_charge DECIMAL(10, 2) NOT NULL DEFAULT 0,
    service_charge DECIMAL(10, 2) NOT NULL DEFAULT 0,
    insurance_fee DECIMAL(10, 2) NOT NULL DEFAULT 0,
    total_amount DECIMAL(10, 2) NOT NULL DEFAULT 0,
    payment_status TEXT NOT NULL DEFAULT 'unpaid',
    status shipment_status NOT NULL DEFAULT 'created',
    current_location TEXT,
    estimated_delivery TIMESTAMPTZ,
    delivered_at TIMESTAMPTZ,
    notes TEXT,
    created_by UUID,
    customer_id UUID,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Step 4: Enable RLS and create policy
ALTER TABLE public.shipments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Enable all operations for shipments" ON public.shipments;
CREATE POLICY "Enable all operations for shipments" ON public.shipments
    FOR ALL USING (true) WITH CHECK (true);

-- Step 5: Create pricing rules table
CREATE TABLE IF NOT EXISTS public.pricing_rules (
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

-- Step 6: Insert default pricing rule
INSERT INTO public.pricing_rules (name, origin_zone, destination_zone, base_price, price_per_kg, express_multiplier, same_day_multiplier)
VALUES ('Default Pricing', 'all', 'all', 1500, 200, 1.5, 2.0)
ON CONFLICT DO NOTHING;
