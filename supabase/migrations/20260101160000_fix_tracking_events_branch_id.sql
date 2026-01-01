-- Fix missing branch_id column in tracking_events table
-- This migration ensures the branch_id column exists and has proper constraints

-- Check if branch_id column exists, if not add it
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'tracking_events' 
        AND column_name = 'branch_id'
    ) THEN
        ALTER TABLE public.tracking_events 
        ADD COLUMN branch_id UUID REFERENCES public.branches(id);
        
        RAISE NOTICE 'Added branch_id column to tracking_events table';
    ELSE
        RAISE NOTICE 'branch_id column already exists in tracking_events table';
    END IF;
END $$;

-- Update RLS policies to ensure proper access
DROP POLICY IF EXISTS "Enable read access for tracking events" ON public.tracking_events;
DROP POLICY IF EXISTS "Enable insert for tracking events" ON public.tracking_events;

-- Recreate policies with proper column access
CREATE POLICY "Enable read access for tracking events" ON public.tracking_events
  FOR SELECT USING (true);

CREATE POLICY "Enable insert for tracking events" ON public.tracking_events
  FOR INSERT WITH CHECK (true);
