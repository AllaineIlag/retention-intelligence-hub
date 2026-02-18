-- ═══════════════════════════════════════════════════════════
-- 01: DELETE RESPONSES (Run FIRST when clearing)
-- Purges: exit_questionnaire_results, exit_responses
-- Safe: Only deletes records linked to [MOCK_DATA] resignations
-- ═══════════════════════════════════════════════════════════

-- Step 1: Delete questionnaire results linked to mock resignations
DELETE FROM exit_interview_results
WHERE resignation_id IN (
    SELECT r.id FROM resignations r
    JOIN profiles p ON r.employee_id = p.id
    WHERE p.email ILIKE '%@sim.retention.com'
);

-- Step 2: Delete exit responses linked to mock resignations  
DELETE FROM exit_questionnaires_result
WHERE resignation_id IN (
    SELECT r.id FROM resignations r
    JOIN profiles p ON r.employee_id = p.id
    WHERE p.email ILIKE '%@sim.retention.com'
);

-- Verify
SELECT 
    'exit_interview_results' AS table_name,
    COUNT(*) AS remaining_mock_rows
FROM exit_interview_results
WHERE resignation_id IN (
    SELECT r.id FROM resignations r
    JOIN profiles p ON r.employee_id = p.id
    WHERE p.email ILIKE '%@sim.retention.com'
)
UNION ALL
SELECT 
    'exit_questionnaires_result',
    COUNT(*)
FROM exit_questionnaires_result
WHERE resignation_id IN (
    SELECT r.id FROM resignations r
    JOIN profiles p ON r.employee_id = p.id
    WHERE p.email ILIKE '%@sim.retention.com'
);
