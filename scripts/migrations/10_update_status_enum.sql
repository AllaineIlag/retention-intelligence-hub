-- 1. Create new ENUM type with temporary name
CREATE TYPE resignation_status_new AS ENUM (
    'pending_exit_form',
    'pending_interview',
    'scheduled',
    'completed',
    'cancelled',
    'locked'
);

-- 2. Update the table to use the new ENUM
-- We need to cast existing data to text first, then to the new ENUM
-- Logic:
-- if status was 'pending' -> map to 'pending_exit_form' (safest default)
-- other statuses map directly if they exist in both, or need handling.
-- 'scheduled', 'completed', 'cancelled', 'locked' exist in both.

ALTER TABLE resignations 
ALTER COLUMN status TYPE resignation_status_new 
USING (
    CASE status::text
        WHEN 'pending' THEN 'pending_exit_form'::resignation_status_new
        ELSE status::text::resignation_status_new
    END
);

-- 3. Drop old ENUM
DROP TYPE resignation_status;

-- 4. Rename new ENUM to old name
ALTER TYPE resignation_status_new RENAME TO resignation_status;

-- 5. Data Cleanup: Check for cases that should be 'pending_interview'
-- If a resignation is 'pending_exit_form' BUT has a non-empty form_snapshot, promote it to 'pending_interview'
UPDATE resignations
SET status = 'pending_interview'
WHERE status = 'pending_exit_form'
AND form_snapshot IS NOT NULL
AND form_snapshot::text != '{}';
