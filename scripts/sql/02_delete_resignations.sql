-- ═══════════════════════════════════════════════════════════
-- 02: DELETE RESIGNATIONS (Run AFTER 01_delete_responses)
-- Purges: resignations tagged with [MOCK_DATA]
-- ⚠️ Run 01_delete_responses.sql first!
-- ═══════════════════════════════════════════════════════════

DELETE FROM resignations
WHERE id IN (
    SELECT r.id FROM resignations r
    JOIN profiles p ON r.employee_id = p.id
    WHERE p.email ILIKE '%@sim.retention.com'
);

-- Verify
SELECT COUNT(*) AS remaining_mock_resignations
FROM resignations r
JOIN profiles p ON r.employee_id = p.id
WHERE p.email ILIKE '%@sim.retention.com';
