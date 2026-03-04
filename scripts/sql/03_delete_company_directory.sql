-- ══════════════════════════════════════════════════════════════════
-- 03: DELETE COMPANY DIRECTORY SEEDS
-- ══════════════════════════════════════════════════════════════════
-- PURPOSE : Removes all mock employees from company_directory.
-- SAFE    : Only targets @tdk.sim.com emails. Never touches the
--           4 real demo accounts (REAL-001 through REAL-004).
-- ORDER   : Run BEFORE 10_seed_company_directory.sql if re-seeding.
--           Run AFTER  01_delete_responses.sql and
--                      02_delete_resignations.sql (FK cascade safety).
-- ══════════════════════════════════════════════════════════════════

-- Step 1: Delete any resignations linked to mock directory entries
--         (safety net — should already be empty after running 01 and 02)
DELETE FROM public.exit_interview_results
WHERE resignation_id IN (
    SELECT r.id FROM public.resignations r
    JOIN public.company_directory cd ON cd.id = r.directory_id
    WHERE cd.email LIKE '%@tdk.sim.com'
       OR cd.email LIKE 'michaeljohnsford2001+mock%@gmail.com'
);

DELETE FROM public.exit_questionnaires_result
WHERE resignation_id IN (
    SELECT r.id FROM public.resignations r
    JOIN public.company_directory cd ON cd.id = r.directory_id
    WHERE cd.email LIKE '%@tdk.sim.com'
       OR cd.email LIKE 'michaeljohnsford2001+mock%@gmail.com'
);

DELETE FROM public.resignations
WHERE directory_id IN (
    SELECT id FROM public.company_directory
    WHERE email LIKE '%@tdk.sim.com'
       OR email LIKE 'michaeljohnsford2001+mock%@gmail.com'
);

-- Step 2: Reset is_active = true for real accounts (cleanup housekeeping)
UPDATE public.company_directory
SET is_active = true
WHERE email NOT LIKE '%@tdk.sim.com'
  AND email NOT LIKE 'michaeljohnsford2001+mock%@gmail.com';

-- Step 3: Delete mock company_directory entries
DELETE FROM public.company_directory
WHERE (email LIKE '%@tdk.sim.com' OR email LIKE 'michaeljohnsford2001+mock%@gmail.com')
  AND email NOT IN ('lead@tdk.com', 'interviewer@tdk.com', 'employee@tdk.com');

-- Verification
SELECT
    COUNT(*) FILTER (WHERE email LIKE '%@tdk.sim.com' OR email LIKE 'michaeljohnsford2001+mock%@gmail.com') AS mock_remaining,
    COUNT(*) FILTER (WHERE email NOT LIKE '%@tdk.sim.com' AND email NOT LIKE 'michaeljohnsford2001+mock%@gmail.com') AS real_accounts_intact
FROM public.company_directory;
