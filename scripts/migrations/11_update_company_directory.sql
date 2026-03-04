-- 11_update_company_directory.sql
BEGIN;

-- 1. Create ref_business_unit
CREATE TABLE IF NOT EXISTS public.ref_business_unit (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    name text NOT NULL UNIQUE,
    is_active boolean NOT NULL DEFAULT true,
    created_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT ref_business_unit_pkey PRIMARY KEY (id)
);

-- 2. Create ref_superior
CREATE TABLE IF NOT EXISTS public.ref_superior (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    name text NOT NULL UNIQUE,
    is_active boolean NOT NULL DEFAULT true,
    created_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT ref_superior_pkey PRIMARY KEY (id)
);

-- 3. Setup RLS
ALTER TABLE public.ref_business_unit ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ref_superior ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view business units"
ON public.ref_business_unit FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can view superiors"
ON public.ref_superior FOR SELECT
TO authenticated
USING (true);

-- 4. Alter company_directory
-- Rename payroll_no to control_number
ALTER TABLE public.company_directory RENAME COLUMN payroll_no TO control_number;

-- Rename immediate_superior to intermediate_supervisor to match code, and make sure position is there
ALTER TABLE public.company_directory RENAME COLUMN immediate_superior TO intermediate_supervisor;

ALTER TABLE public.company_directory ADD COLUMN IF NOT EXISTS position text;

-- Handle date_hired (might be null currently)
UPDATE public.company_directory SET date_hired = now() WHERE date_hired IS NULL;
ALTER TABLE public.company_directory ALTER COLUMN date_hired SET NOT NULL;

COMMIT;
