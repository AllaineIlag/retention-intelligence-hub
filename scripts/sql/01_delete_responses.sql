-- ═══════════════════════════════════════════════════════════
-- 01: DELETE RESPONSES (Run FIRST when clearing)
-- Purges: exit_interview_results, exit_questionnaires_result
-- Safe: Only deletes records linked to [MOCK_DATA] resignations
-- ═══════════════════════════════════════════════════════════

-- Step 1: Delete interview results linked to mock resignations
DELETE FROM exit_interview_results
WHERE resignation_id IN (
    SELECT r.id FROM resignations r
    JOIN profiles p ON r.employee_id = p.id
    WHERE p.email ILIKE '%@sim.retention.com' OR p.email ILIKE '%@mock.co'
);

-- Step 2: Delete questionnaire responses linked to mock resignations  
DELETE FROM exit_questionnaires_result
WHERE resignation_id IN (
    SELECT r.id FROM resignations r
    JOIN profiles p ON r.employee_id = p.id
    WHERE p.email ILIKE '%@sim.retention.com' OR p.email ILIKE '%@mock.co'
);

-- Step 3: Delete notifications linked to mock resignations
DELETE FROM notifications
WHERE link ILIKE '/dashboard/resignation/%'
  AND substring(link from '/dashboard/resignation/([^/]+)') IN (
    SELECT r.id::text FROM resignations r
    JOIN profiles p ON r.employee_id = p.id
    WHERE p.email ILIKE '%@sim.retention.com' OR p.email ILIKE '%@mock.co'
);

-- Step 4: Delete audit logs linked to mock resignations
DELETE FROM audit_logs
WHERE entity_table = 'resignations'
  AND entity_id IN (
    SELECT r.id FROM resignations r
    JOIN profiles p ON r.employee_id = p.id
    WHERE p.email ILIKE '%@sim.retention.com' OR p.email ILIKE '%@mock.co'
);

-- Verify
SELECT 
    'exit_interview_results' AS table_name,
    COUNT(*) AS remaining_mock_rows
FROM exit_interview_results
WHERE resignation_id IN (
    SELECT r.id FROM resignations r
    JOIN profiles p ON r.employee_id = p.id
    WHERE p.email ILIKE '%@sim.retention.com' OR p.email ILIKE '%@mock.co'
)
UNION ALL
SELECT 
    'exit_questionnaires_result',
    COUNT(*)
FROM exit_questionnaires_result
WHERE resignation_id IN (
    SELECT r.id FROM resignations r
    JOIN profiles p ON r.employee_id = p.id
    WHERE p.email ILIKE '%@sim.retention.com' OR p.email ILIKE '%@mock.co'
);
