-- ═══════════════════════════════════════════════════════════
-- 03: DELETE PROFILES (Run LAST when clearing)
-- Purges: employee_details + profiles with sim email domains
-- ⚠️ Run 01 and 02 first!
-- ═══════════════════════════════════════════════════════════

-- Step 0: Clear notifications and audit logs linked to mock profiles (if any remain)
DELETE FROM notifications
WHERE user_id IN (
    SELECT id FROM profiles 
    WHERE email ILIKE '%@sim.retention.com' OR email ILIKE '%@mock.co'
);

DELETE FROM audit_logs
WHERE user_id IN (
    SELECT id FROM profiles 
    WHERE email ILIKE '%@sim.retention.com' OR email ILIKE '%@mock.co'
) OR (
    entity_table = 'profiles' AND entity_id IN (
        SELECT id FROM profiles 
        WHERE email ILIKE '%@sim.retention.com' OR email ILIKE '%@mock.co'
    )
);

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
    COUNT(*) AS remaining_rows 
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
