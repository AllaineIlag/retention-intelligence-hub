-- ═══════════════════════════════════════════════════════════
-- 02: DELETE RESIGNATIONS (Run AFTER 01_delete_responses)
-- Purges: resignations tagged with [MOCK_DATA]
-- ⚠️ Run 01_delete_responses.sql first!
-- ═══════════════════════════════════════════════════════════

-- Step 1: Delete mock System Accounts (Option B creates auth/profiles for mock resignees)
-- We target both the legacy @tdk.sim.com and the test-redirect pattern
DELETE FROM public.profiles 
WHERE email LIKE '%@tdk.sim.com' 
   OR email LIKE 'michaeljohnsford2001+mock%@gmail.com';

DELETE FROM auth.users 
WHERE email LIKE '%@tdk.sim.com' 
   OR email LIKE 'michaeljohnsford2001+mock%@gmail.com';

-- Step 2: Delete mock resignations
DELETE FROM resignations
WHERE id IN (
    SELECT r.id FROM resignations r
    JOIN company_directory cd ON r.directory_id = cd.id
    WHERE cd.email ILIKE '%@tdk.sim.com'
       OR cd.email LIKE 'michaeljohnsford2001+mock%@gmail.com'
);

-- Step 3: Revert company_directory active statuses for remaining mock profiles
UPDATE company_directory 
SET is_active = true 
WHERE email ILIKE '%@tdk.sim.com'
   OR email LIKE 'michaeljohnsford2001+mock%@gmail.com';

-- Verify
SELECT 
    (SELECT COUNT(*) FROM resignations r JOIN company_directory cd ON r.directory_id = cd.id WHERE cd.email LIKE '%@tdk.sim.com' OR cd.email LIKE 'michaeljohnsford2001+mock%@gmail.com') AS resignations_remaining,
    (SELECT COUNT(*) FROM public.profiles WHERE email LIKE '%@tdk.sim.com' OR email LIKE 'michaeljohnsford2001+mock%@gmail.com') AS profiles_remaining;
