BEGIN;

-- Remove legacy constraints to profiles and employee_details
ALTER TABLE public.resignations
    DROP CONSTRAINT IF EXISTS fk_resignations_employee_details,
    DROP CONSTRAINT IF EXISTS resignations_employee_id_fkey;

-- Drop the legacy column and dependent RLS policies
ALTER TABLE public.resignations
    DROP COLUMN IF EXISTS employee_id CASCADE;

-- Make directory_id the definitive non-null foreign key
ALTER TABLE public.resignations
    ALTER COLUMN directory_id SET NOT NULL;

COMMIT;
