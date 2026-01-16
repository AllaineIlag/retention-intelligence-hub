-- =============================================================
-- RETENTION INTELLIGENCE HUB - SEED DATA
-- Author: Nasus (Database Engineer)
-- Date: 2026-01-16
-- =============================================================

-- =============================================================
-- SEED QUESTIONS
-- =============================================================

-- Q1: Root Question (Always Shown)
INSERT INTO public.questions (id, category, question_text, type, options, display_order, depends_on_question_id, condition_values, is_active)
VALUES (
    'a1b2c3d4-0001-4000-8000-000000000001',
    'Exit Questionnaires',
    'What is/are your reason for leaving?',
    'radio',
    '["Another Job", "Business", "Family Reasons", "Health", "Personal Reason", "Continue to Study", "Practice Profession", "Dislike company procedure", "Differences/Difficulty with Superior", "Differences/Difficulty with Co-Employees"]',
    1,
    NULL,
    NULL,
    true
);

-- Q2: Job Location (If Q1 = "Another Job")
INSERT INTO public.questions (id, category, question_text, type, options, display_order, depends_on_question_id, condition_values, is_active)
VALUES (
    'a1b2c3d4-0002-4000-8000-000000000002',
    'Details: Another Job',
    'Where is this new job located?',
    'radio',
    '["Local", "Abroad"]',
    2,
    'a1b2c3d4-0001-4000-8000-000000000001',
    '["Another Job"]',
    true
);

-- Q3: Country (If Q2 = "Abroad")
INSERT INTO public.questions (id, category, question_text, type, options, display_order, depends_on_question_id, condition_values, is_active)
VALUES (
    'a1b2c3d4-0003-4000-8000-000000000003',
    'Details: Another Job',
    'What country is the job located in?',
    'text',
    NULL,
    3,
    'a1b2c3d4-0002-4000-8000-000000000002',
    '["Abroad"]',
    true
);

-- Q4: Business Nature (If Q1 = "Business")
INSERT INTO public.questions (id, category, question_text, type, options, display_order, depends_on_question_id, condition_values, is_active)
VALUES (
    'a1b2c3d4-0004-4000-8000-000000000004',
    'Details: Business',
    'What nature of business will you be entering?',
    'text',
    NULL,
    4,
    'a1b2c3d4-0001-4000-8000-000000000001',
    '["Business"]',
    true
);

-- Q5: Flexibility Prevention (If Q1 = Family/Health/Personal)
INSERT INTO public.questions (id, category, question_text, type, options, display_order, depends_on_question_id, condition_values, is_active)
VALUES (
    'a1b2c3d4-0005-4000-8000-000000000005',
    'Details: Family/Health/Personal',
    'Would a flexible work arrangement or leave of absence have prevented your resignation?',
    'radio',
    '["Yes, definitely", "Maybe", "No, this is unavoidable"]',
    5,
    'a1b2c3d4-0001-4000-8000-000000000001',
    '["Family Reasons", "Health", "Personal Reason"]',
    true
);

-- Q6: Education Course (If Q1 = Study/Profession)
INSERT INTO public.questions (id, category, question_text, type, options, display_order, depends_on_question_id, condition_values, is_active)
VALUES (
    'a1b2c3d4-0006-4000-8000-000000000006',
    'Details: Education',
    'What course or degree are you pursuing?',
    'text',
    NULL,
    6,
    'a1b2c3d4-0001-4000-8000-000000000001',
    '["Continue to Study", "Practice Profession"]',
    true
);

-- Q7: Policy Issue (If Q1 = "Dislike procedure")
INSERT INTO public.questions (id, category, question_text, type, options, display_order, depends_on_question_id, condition_values, is_active)
VALUES (
    'a1b2c3d4-0007-4000-8000-000000000007',
    'Details: Company/Management',
    'Please specify the procedure or policy that contributed to your decision.',
    'text',
    NULL,
    7,
    'a1b2c3d4-0001-4000-8000-000000000001',
    '["Dislike company procedure"]',
    true
);

-- Q8: HR Mediation (If Q1 = Conflict)
INSERT INTO public.questions (id, category, question_text, type, options, display_order, depends_on_question_id, condition_values, is_active)
VALUES (
    'a1b2c3d4-0008-4000-8000-000000000008',
    'Details: Conflict',
    'Did you attempt to resolve this conflict through HR or Mediation?',
    'radio',
    '["Yes, but it was ineffective", "No, I did not report it"]',
    8,
    'a1b2c3d4-0001-4000-8000-000000000001',
    '["Differences/Difficulty with Superior", "Differences/Difficulty with Co-Employees"]',
    true
);

-- Q9: New Path Desirability (If Q1 = Another Job/Business)
INSERT INTO public.questions (id, category, question_text, type, options, display_order, depends_on_question_id, condition_values, is_active)
VALUES (
    'a1b2c3d4-0009-4000-8000-000000000009',
    'Comparison',
    'If your reason for resigning is another job or having own business, why do you consider it more desirable?',
    'checkbox',
    '["Higher salary", "More convenient location", "Job more suited to line of interest", "Greater opportunity for career growth", "Others"]',
    9,
    'a1b2c3d4-0001-4000-8000-000000000001',
    '["Another Job", "Business"]',
    true
);

-- Q10: Career Growth (Always Shown)
INSERT INTO public.questions (id, category, question_text, type, options, display_order, depends_on_question_id, condition_values, is_active)
VALUES (
    'a1b2c3d4-0010-4000-8000-000000000010',
    'General Feedback',
    'How did you feel about the opportunity for career growth in the company?',
    'scale',
    '["Very good chance", "Good chances", "Little chances", "Very little chances", "No chances"]',
    10,
    NULL,
    NULL,
    true
);

-- =============================================================
-- SEED TEST USERS (Profiles will be created via Auth trigger)
-- These are placeholders for the test accounts
-- =============================================================
-- Lead: ilagallainebenedict01380@gmail.com
-- Interviewer: sungjinwoo1515@gmail.com
-- Employee: benjaminbrowning2001@gmail.com
