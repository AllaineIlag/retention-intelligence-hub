
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

// Load .env.local
const envPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
    const envConfig = dotenv.parse(fs.readFileSync(envPath));
    for (const k in envConfig) {
        process.env[k] = envConfig[k];
    }
}

// Admin Client
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const QUESTIONS = [
    {
        question_key: 'reason_for_leaving',
        question_text: 'What is your primary reason for leaving? (Select all that apply)',
        category: 'reason',
        question_type: 'multi',
        display_order: 1,
        is_active: true,
        options: [
            { value: "Another Job", label: "Another Job", hasFollowUp: true },
            { value: "Business", label: "Business" },
            { value: "Family Reasons", label: "Family Reasons" },
            { value: "Health", label: "Health" },
            { value: "Personal Reason", label: "Personal Reason" },
            { value: "Continue to Study", label: "Continue to Study" },
            { value: "Practice Profession", label: "Practice Profession" },
            { value: "Dislike company procedure", label: "Dislike company procedure" },
            { value: "Differences/Difficulty with Superior", label: "Differences/Difficulty with Superior" },
            { value: "Differences/Difficulty with Co-Employees", label: "Differences/Difficulty with Co-Employees" }
        ]
    },
    {
        question_key: 'reason_for_leaving_country',
        question_text: 'Where is this new job located?',
        category: 'reason_detail',
        question_type: 'single',
        display_order: 2,
        is_active: true,
        options: []
    },
    {
        question_key: 'why_more_desirable',
        question_text: 'Why is the new position more desirable? (Select all that apply)',
        category: 'comparison',
        question_type: 'multi',
        display_order: 3,
        is_active: true,
        options: [
            { value: "Higher salary", label: "Higher salary" },
            { value: "More convenient location", label: "More convenient location" },
            { value: "Job more suited to line of interest", label: "Job more suited to line of interest" },
            { value: "Greater opportunity for career growth", label: "Greater opportunity for career growth" }
        ]
    },
    {
        question_key: 'why_more_desirable_other',
        question_text: 'Other reasons why new position is more desirable',
        category: 'comparison_detail',
        question_type: 'text',
        display_order: 4,
        is_active: true,
        options: []
    },
    {
        question_key: 'career_growth',
        question_text: 'How would you describe your chances for career growth here?',
        category: 'growth',
        question_type: 'single',
        display_order: 5,
        is_active: true,
        options: [
            { value: "Very good chance", label: "Very good chance" },
            { value: "Good chances", label: "Good chances" },
            { value: "Little chances", label: "Little chances" },
            { value: "Very little", label: "Very little" },
            { value: "No chances", label: "No chances" }
        ]
    },
    {
        question_key: 'rate_of_pay',
        question_text: 'How would you describe your rate of pay?',
        category: 'compensation',
        question_type: 'single',
        display_order: 6,
        is_active: true,
        options: [
            { value: "Very compensating", label: "Very compensating" },
            { value: "Fair enough", label: "Fair enough" },
            { value: "A bit low", label: "A bit low" },
            { value: "Very low", label: "Very low" }
        ]
    },
    {
        question_key: 'benefits',
        question_text: 'How were the benefits?',
        category: 'compensation',
        question_type: 'single',
        display_order: 7,
        is_active: true,
        options: [
            { value: "Very adequate", label: "Very adequate" },
            { value: "Adequate", label: "Adequate" },
            { value: "Inadequate", label: "Inadequate" }
        ]
    },
    {
        question_key: 'benefits_comment',
        question_text: 'Benefits Comments',
        category: 'compensation_detail',
        question_type: 'text',
        display_order: 8,
        is_active: true,
        options: []
    },
    {
        question_key: 'workload',
        question_text: 'How was your workload?',
        category: 'workload',
        question_type: 'single',
        display_order: 9,
        is_active: true,
        options: [
            { value: "Too much", label: "Too much" },
            { value: "Just enough", label: "Just enough" },
            { value: "Minimal", label: "Minimal" }
        ]
    },
    {
        question_key: 'workload_comment',
        question_text: 'Workload Comments',
        category: 'workload_detail',
        question_type: 'text',
        display_order: 10,
        is_active: true,
        options: []
    },
    {
        question_key: 'recommendation',
        question_text: 'Would you recommend this company to your friends?',
        category: 'culture',
        question_type: 'single',
        display_order: 11,
        is_active: true,
        options: [
            { value: "Yes", label: "Yes" },
            { value: "No", label: "No" }
        ]
    },
    {
        question_key: 'recommendation_reason',
        question_text: 'Recommendation Reason',
        category: 'culture_detail',
        question_type: 'text',
        display_order: 12,
        is_active: true,
        options: []
    }
];

async function seedQuestions() {
    console.log('🌱 Seeding Questions...');

    // Clear existing
    const { error: delError } = await supabase.from('questions').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    if (delError) console.error('Delete Error:', delError);

    const { error: insError } = await supabase.from('questions').insert(QUESTIONS);

    if (insError) {
        console.error('❌ Failed to seed questions:', insError);
    } else {
        console.log('✅ Questions seeded successfully!');
    }
}

seedQuestions();
