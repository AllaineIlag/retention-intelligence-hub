-- ═══════════════════════════════════════════════════════════
-- 10: RENAME TABLES (SCHEMA REFACTOR)
-- ═══════════════════════════════════════════════════════════

-- Rename 'exit_responses' -> 'exit_questionnaires_result'
ALTER TABLE IF EXISTS exit_responses 
RENAME TO exit_questionnaires_result;

-- Rename 'exit_questionnaire_results' -> 'exit_interview_results'
ALTER TABLE IF EXISTS exit_questionnaire_results 
RENAME TO exit_interview_results;

-- Note: Constraint names (Foreign Keys) might still reference old names 
-- unless explicitly renamed, but functionality should persist.
-- Ideally, we rename constraints too for cleanliness, but let's stick to tables first.
