-- Create ref_departments table
CREATE TABLE IF NOT EXISTS public.ref_departments (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    name text NOT NULL UNIQUE,
    is_active boolean NOT NULL DEFAULT true,
    created_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT ref_departments_pkey PRIMARY KEY (id)
);

-- Create ref_positions table
CREATE TABLE IF NOT EXISTS public.ref_positions (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    name text NOT NULL UNIQUE,
    is_active boolean NOT NULL DEFAULT true,
    created_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT ref_positions_pkey PRIMARY KEY (id)
);

-- Enable RLS
ALTER TABLE public.ref_departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ref_positions ENABLE ROW LEVEL SECURITY;

-- RLS Policies (Read: Authenticated, Write: Leads/Admins Only)
-- For simplicity in this phase, we allow authenticated to read.
CREATE POLICY "Authenticated users can view departments"
ON public.ref_departments FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can view positions"
ON public.ref_positions FOR SELECT
TO authenticated
USING (true);

-- Write policies (using explicit role check or simple auth for now, enforcing logic in actions)
-- Assuming 'lead' role check via session in actions, but good to have DB level too if possible.
-- For now, we'll open it to authenticated for simplicity in MVP, or strictly restrict to leads if we had a helper.
-- Let's stick to simple "Authenticated can read", "Service Role (Actions) can write" for now to match pattern.

-- Seed Departments
INSERT INTO public.ref_departments (name)
VALUES 
    ('Engineering'),
    ('Product Management'),
    ('Design'),
    ('Sales'),
    ('Marketing'),
    ('Customer Success'),
    ('Human Resources'),
    ('Finance'),
    ('Legal'),
    ('Operations'),
    ('IT'),
    ('Data Science')
ON CONFLICT (name) DO NOTHING;

-- Seed Positions
INSERT INTO public.ref_positions (name)
VALUES 
    ('Software Engineer'),
    ('Senior Software Engineer'),
    ('Tech Lead'),
    ('Product Manager'),
    ('UI/UX Designer'),
    ('QA Engineer'),
    ('Marketing Manager'),
    ('HR Representative'),
    ('Operations Specialist')
ON CONFLICT (name) DO NOTHING;
