-- Fix RLS policies for development - make them more permissive
-- This file fixes the database connection issues

-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Staff can view all shipments" ON public.shipments;
DROP POLICY IF EXISTS "Staff can manage shipments" ON public.shipments;
DROP POLICY IF EXISTS "Customers can view their own shipments" ON public.shipments;

-- Drop existing pricing rules policies
DROP POLICY IF EXISTS "Staff can view pricing rules" ON public.pricing_rules;
DROP POLICY IF EXISTS "Admins can manage pricing rules" ON public.pricing_rules;
DROP POLICY IF EXISTS "Development admin bypass" ON public.pricing_rules;

-- Create more permissive policies for development
CREATE POLICY "Enable read access for all users" ON public.shipments
  FOR SELECT USING (true);

CREATE POLICY "Enable insert for all users" ON public.shipments
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update for all users" ON public.shipments
  FOR UPDATE USING (true);

CREATE POLICY "Enable delete for all users" ON public.shipments
  FOR DELETE USING (true);

-- Similar permissive policies for pricing rules
CREATE POLICY "Enable read access for pricing rules" ON public.pricing_rules
  FOR SELECT USING (true);

CREATE POLICY "Enable insert for pricing rules" ON public.pricing_rules
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update for pricing rules" ON public.pricing_rules
  FOR UPDATE USING (true);

CREATE POLICY "Enable delete for pricing rules" ON public.pricing_rules
  FOR DELETE USING (true);

-- Enable read access for settings
CREATE POLICY "Enable read access for settings" ON public.settings
  FOR SELECT USING (true);

CREATE POLICY "Enable insert for settings" ON public.settings
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update for settings" ON public.settings
  FOR UPDATE USING (true);

-- Enable read access for tracking events
CREATE POLICY "Enable read access for tracking events" ON public.tracking_events
  FOR SELECT USING (true);

CREATE POLICY "Enable insert for tracking events" ON public.tracking_events
  FOR INSERT WITH CHECK (true);
