-- Fix search_path for generate_tracking_number function
CREATE OR REPLACE FUNCTION public.generate_tracking_number()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
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

-- Fix search_path for update_updated_at function
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;