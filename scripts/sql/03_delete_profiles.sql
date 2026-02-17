-- ═══════════════════════════════════════════════════════════
-- 03: DELETE PROFILES (Run LAST when clearing)
-- Purges: employee_details + profiles with sim email domains
-- ⚠️ Run 01 and 02 first!
-- ═══════════════════════════════════════════════════════════

-- Step 1: Delete employee details for simulation profiles
DELETE FROM employee_details
WHERE id IN (
    SELECT id FROM profiles 
    WHERE email ILIKE '%@sim.retention.com' 
       OR email ILIKE '%@mock.co'
);

-- Step 2: Delete the profiles themselves
DELETE FROM profiles
WHERE email ILIKE '%@sim.retention.com' 
   OR email ILIKE '%@mock.co';

-- Verify
SELECT 
    'profiles' AS table_name,
    COUNT(*) AS remaining_sim_rows 
FROM profiles 
WHERE email ILIKE '%@sim.retention.com' OR email ILIKE '%@mock.co'
UNION ALL
SELECT 
    'employee_details',
    COUNT(*)
FROM employee_details 
WHERE id IN (
    SELECT id FROM profiles 
    WHERE email ILIKE '%@sim.retention.com' OR email ILIKE '%@mock.co'
);
