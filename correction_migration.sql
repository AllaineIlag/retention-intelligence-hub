-- Migration: Add correction columns to exit_responses
-- Run this in your Supabase SQL Editor

ALTER TABLE public.exit_responses 
ADD COLUMN IF NOT EXISTS original_answer TEXT,
ADD COLUMN IF NOT EXISTS corrected_answer TEXT,
ADD COLUMN IF NOT EXISTS is_corrected BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS interviewer_note TEXT;

-- Security: Ensure Lead/Interviewer can update these columns
-- (Assuming existing RLS policies cover Update if they have access to the row, 
--  but normally we might want to restrict *who* can update these specific columns. 
--  For now, relying on row-level access control.)
