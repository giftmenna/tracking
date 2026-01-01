-- Create admin role for the development admin user
-- This fixes the RLS issue for pricing rules

-- First, let's check if the admin user exists and give them admin role
-- Since we're using a mock admin user, we need to create a proper user role entry

-- Insert admin role for our development admin (using a fixed UUID for consistency)
INSERT INTO public.user_roles (user_id, role)
VALUES (
  'admin-dev-id', -- This matches our mock admin user ID
  'admin'
) ON CONFLICT (user_id, role) DO NOTHING;

-- Also create a bypass for development - allow any user with admin metadata to access admin functions
CREATE POLICY "Development admin bypass"
  ON public.pricing_rules FOR ALL
  USING (
    -- Allow if user has admin role in user_roles table
    public.has_role(auth.uid(), 'admin')
    OR
    -- Development bypass: allow if user metadata contains admin role
    (auth.jwt() ->> 'user_metadata' ->> 'role' = 'admin')
    OR
    -- Another bypass for our mock admin user
    (auth.jwt() ->> 'sub' = 'admin-dev-id')
  );

-- Similar policies for other admin tables
ALTER TABLE public.settings DROP POLICY IF EXISTS "Admins can manage settings";
CREATE POLICY "Admins can manage settings"
  ON public.settings FOR ALL
  USING (
    public.has_role(auth.uid(), 'admin')
    OR
    (auth.jwt() ->> 'user_metadata' ->> 'role' = 'admin')
    OR
    (auth.jwt() ->> 'sub' = 'admin-dev-id')
  );

ALTER TABLE public.shipments DROP POLICY IF EXISTS "Staff can manage shipments";
CREATE POLICY "Staff can manage shipments"
  ON public.shipments FOR ALL
  USING (
    public.is_admin_or_staff(auth.uid())
    OR
    (auth.jwt() ->> 'user_metadata' ->> 'role' = 'admin')
    OR
    (auth.jwt() ->> 'sub' = 'admin-dev-id')
  );

-- Create a function to check if current user is admin (including development bypass)
CREATE OR REPLACE FUNCTION public.is_current_user_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    public.has_role(auth.uid(), 'admin') 
    OR 
    (auth.jwt() ->> 'user_metadata' ->> 'role' = 'admin')
    OR
    (auth.jwt() ->> 'sub' = 'admin-dev-id')
$$;
