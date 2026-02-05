-- Migration: Add User Management columns to profiles

-- Add can_export_data column
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS can_export_data BOOLEAN DEFAULT false;

-- Add status column
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS status TEXT CHECK (status IN ('active', 'invited', 'suspended')) DEFAULT 'active';

-- Update handle_new_user function to respect metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, role, status)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'role', 'employee'),
    COALESCE(NEW.raw_user_meta_data->>'status', 'active')
  );
  RETURN NEW;
END;
$$;
