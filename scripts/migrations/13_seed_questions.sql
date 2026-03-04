-- ═══════════════════════════════════════════════════════════
-- 00: SEED QUESTIONS (CRITICAL FOUNDATION)
-- ═══════════════════════════════════════════════════════════

-- Clear existing questions to avoid duplicates (optional, safe for dev)
DELETE FROM questions;

INSERT INTO questions (question_key, question_text, category, question_type, display_order, is_active, options)
VALUES 
    (
        'reason_for_leaving',
        'What is your primary reason for leaving? (Select all that apply)',
        'reason',
        'multi',
        1,
        true,
        '[
            {"value": "Another Job", "label": "Another Job", "hasFollowUp": true},
            {"value": "Business", "label": "Business"},
            {"value": "Family Reasons", "label": "Family Reasons"},
            {"value": "Health", "label": "Health"},
            {"value": "Personal Reason", "label": "Personal Reason"},
            {"value": "Continue to Study", "label": "Continue to Study"},
            {"value": "Practice Profession", "label": "Practice Profession"},
            {"value": "Dislike company procedure", "label": "Dislike company procedure"},
            {"value": "Differences/Difficulty with Superior", "label": "Differences/Difficulty with Superior"},
            {"value": "Differences/Difficulty with Co-Employees", "label": "Differences/Difficulty with Co-Employees"}
        ]'::jsonb
    ),
    (
        'reason_for_leaving_country',
        'Where is this new job located?',
        'reason_detail',
        'single',
        2,
        true,
        '[]'::jsonb -- Options are dynamically loaded from countries.ts in frontend
    ),
    (
        'why_more_desirable',
        'Why is the new position more desirable? (Select all that apply)',
        'comparison',
        'multi',
        3,
        true,
        '[
            {"value": "Higher salary", "label": "Higher salary"},
            {"value": "More convenient location", "label": "More convenient location"},
            {"value": "Job more suited to line of interest", "label": "Job more suited to line of interest"},
            {"value": "Greater opportunity for career growth", "label": "Greater opportunity for career growth"}
        ]'::jsonb
    ),
    (
        'why_more_desirable_other',
        'Other reasons why new position is more desirable',
        'comparison_detail',
        'text',
        4,
        true,
        '[]'::jsonb
    ),
    (
        'career_growth',
        'How would you describe your chances for career growth here?',
        'growth',
        'single',
        5,
        true,
        '[
            {"value": "Very good chance", "label": "Very good chance"},
            {"value": "Good chances", "label": "Good chances"},
            {"value": "Little chances", "label": "Little chances"},
            {"value": "Very little", "label": "Very little"},
            {"value": "No chances", "label": "No chances"}
        ]'::jsonb
    ),
    (
        'rate_of_pay',
        'How would you describe your rate of pay?',
        'compensation',
        'single',
        6,
        true,
        '[
            {"value": "Very compensating", "label": "Very compensating"},
            {"value": "Fair enough", "label": "Fair enough"},
            {"value": "A bit low", "label": "A bit low"},
            {"value": "Very low", "label": "Very low"}
        ]'::jsonb
    ),
    (
        'benefits',
        'How were the benefits?',
        'compensation',
        'single',
        7,
        true,
        '[
            {"value": "Very adequate", "label": "Very adequate"},
            {"value": "Adequate", "label": "Adequate"},
            {"value": "Inadequate", "label": "Inadequate"}
        ]'::jsonb
    ),
    (
        'benefits_comment',
        'Benefits Comments',
        'compensation_detail',
        'text',
        8,
        true,
        '[]'::jsonb
    ),
    (
        'workload',
        'How was your workload?',
        'workload',
        'single',
        9,
        true,
        '[
            {"value": "Too much", "label": "Too much"},
            {"value": "Just enough", "label": "Just enough"},
            {"value": "Minimal", "label": "Minimal"}
        ]'::jsonb
    ),
    (
        'workload_comment',
        'Workload Comments',
        'workload_detail',
        'text',
        10,
        true,
        '[]'::jsonb
    ),
    (
        'recommendation',
        'Would you recommend this company to your friends?',
        'culture',
        'boolean',
        11,
        true,
        '[
            {"value": "Yes", "label": "Yes"},
            {"value": "No", "label": "No"}
        ]'::jsonb
    ),
    (
        'recommendation_reason',
        'Recommendation Reason',
        'culture_detail',
        'text',
        12,
        true,
        '[]'::jsonb
    );
