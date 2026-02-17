
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

// Load .env.local manually
const envPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
    const envConfig = dotenv.parse(fs.readFileSync(envPath));
    for (const k in envConfig) {
        process.env[k] = envConfig[k];
    }
}

async function main() {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
        console.error('Missing Supabase Environment Variables');
        return;
    }

    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    const questions = [
        {
            question_key: 'reason_for_leaving',
            question_text: 'What is your primary reason for leaving? (Select all that apply)',
            question_type: 'multi',
            display_order: 1,
            is_active: true,
            category: 'general'
        },
        {
            question_key: 'why_more_desirable',
            question_text: 'Why is the new position more desirable? (Select all that apply)',
            question_type: 'multi',
            display_order: 2,
            is_active: true,
            category: 'general'
        },
        {
            question_key: 'career_growth',
            question_text: 'How would you describe your chances for career growth here?',
            question_type: 'single',
            display_order: 3,
            is_active: true,
            category: 'growth'
        },
        {
            question_key: 'rate_of_pay',
            question_text: 'How would you describe your rate of pay?',
            question_type: 'single',
            display_order: 4,
            is_active: true,
            category: 'compensation'
        },
        {
            question_key: 'benefits',
            question_text: 'How were the benefits?',
            question_type: 'single',
            display_order: 5,
            is_active: true,
            category: 'compensation'
        },
        {
            question_key: 'workload',
            question_text: 'How was your workload?',
            question_type: 'single',
            display_order: 6,
            is_active: true,
            category: 'workload'
        },
        {
            question_key: 'recommendation',
            question_text: 'Would you recommend this company to your friends?',
            question_type: 'single',
            display_order: 7,
            is_active: true,
            category: 'culture'
        }
    ];

    console.log('Seeding Questions...');

    // Upsert questions based on question_key (assuming unique constraint or just check existence)
    // Supabase upsert requires a unique constraint on the conflict column. 
    // To be safe, we'll delete matching keys first or just try insertion.

    // First, let's just clear existing to be clean (safest for dev)
    // await supabase.from('questions').delete().neq('id', '00000000-0000-0000-0000-000000000000'); 

    for (const q of questions) {
        const { error } = await supabase
            .from('questions')
            .upsert(q, { onConflict: 'question_key' })
        // Note: IF there is no unique constraint on question_key, this might start adding dupes if we run multiple times.
        // But we can check if it exists first.

        if (error) {
            console.error(`Error inserting ${q.question_key}:`, error.message);
            // If unique constraint missing, try select then insert
            const { data: existing } = await supabase.from('questions').select('id').eq('question_key', q.question_key).maybeSingle();
            if (!existing) {
                const { error: insertError } = await supabase.from('questions').insert(q);
                if (insertError) console.error(`Retry insert ${q.question_key} failed:`, insertError.message);
            } else {
                console.log(`Skipped ${q.question_key} (already exists)`);
            }
        } else {
            console.log(`Inserted/Updated ${q.question_key}`);
        }
    }

    console.log('Seed Complete.');
}

main().catch(console.error);
