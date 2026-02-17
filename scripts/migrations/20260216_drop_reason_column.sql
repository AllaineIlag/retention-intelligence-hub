-- Drop the legacy 'reason' column from resignations table
ALTER TABLE resignations DROP COLUMN IF EXISTS reason;
