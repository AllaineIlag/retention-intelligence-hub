'use server';

import { createClient } from '@/lib/supabase/server';
import { faker } from '@faker-js/faker';
import { revalidatePath } from 'next/cache';

export interface SeedConfig {
    headcount: number;
    attritionRate: number; // monthly %
    volatility: number;    // ± variance
    sentimentScore: number; // 0-100
    ratios: {
        completed: number;
        cancelled: number;
    };
}

export async function seedDatabase(config: SeedConfig) {
    console.log('[Simulation] Starting seed process with config:', config);
    const supabase = await createClient();

    try {
        const SIMULATION_DOMAIN = '@sim.retention.com';

        // 1. Fetch Questions for seeding responses
        const { data: questionData, error: qError } = await supabase
            .from('questions')
            .select('id, question_key, category');

        if (qError) throw qError;

        const profiles = [];
        const resignations = [];
        const allResponses: any[] = [];

        const now = new Date();
        const startOfYear = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());

        // Calculate monthly base exits
        const baseExits = (config.headcount * (config.attritionRate / 100));

        // Status weights
        // pipeline = 100 - (completed + cancelled)
        const pipelineWeight = 100 - (config.ratios.completed + config.ratios.cancelled);

        for (let m = 0; m < 12; m++) {
            const monthDate = new Date(startOfYear.getFullYear(), startOfYear.getMonth() + m, 1);

            // Apply volatility
            const variance = (Math.random() * 2 - 1) * config.volatility; // -0.5 to 0.5
            const monthlyExitableCount = Math.max(1, Math.round(baseExits + (baseExits * variance)));

            for (let i = 0; i < monthlyExitableCount; i++) {
                const id = faker.string.uuid();
                const firstName = faker.person.firstName();
                const lastName = faker.person.lastName();
                const email = `${firstName}.${lastName}.${m}.${i}${SIMULATION_DOMAIN}`.toLowerCase();

                const dept = faker.helpers.arrayElement([
                    'Engineering', 'Sales', 'Marketing', 'Product', 'Customer Support', 'HR', 'Finance'
                ]);

                // Random date within that month
                const resignationDate = faker.date.between({
                    from: monthDate,
                    to: new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0)
                });

                // Status Distribution
                const rand = Math.random() * 100;
                let status: 'pending' | 'scheduled' | 'completed' | 'cancelled' = 'completed';
                if (rand < config.ratios.completed) status = 'completed';
                else if (rand < config.ratios.completed + config.ratios.cancelled) status = 'cancelled';
                else {
                    // Split the rest between pending and scheduled
                    status = Math.random() > 0.5 ? 'scheduled' : 'pending';
                }

                // Profile
                profiles.push({
                    id,
                    email,
                    full_name: `${firstName} ${lastName}`,
                    role: 'employee',
                    created_at: resignationDate.toISOString(),
                });

                // Resignation
                const resId = faker.string.uuid();
                resignations.push({
                    id: resId,
                    employee_id: id,
                    status,
                    created_at: resignationDate.toISOString(),
                    last_working_day: faker.date.soon({ days: 30, refDate: resignationDate }).toISOString(),
                });

                // Responses (only for completed/scheduled)
                if (status === 'completed' || status === 'scheduled') {
                    questionData.forEach(q => {
                        let rating: number | null = null;
                        let response_text: string | null = null;
                        let selected_options: string[] | null = null;

                        // Sentiment Bias Logic
                        const isPositive = (Math.random() * 100) < config.sentimentScore;

                        // Very basic placeholder logic for different categories
                        if (q.category === 'compensation' || q.category === 'growth' || q.category === 'culture' || q.category === 'workload') {
                            // Map sentiment to rating 1-5
                            rating = isPositive ? faker.number.int({ min: 4, max: 5 }) : faker.number.int({ min: 1, max: 2 });
                        }

                        // Special keys mapping
                        if (q.question_key === 'recommendation') {
                            rating = isPositive ? faker.number.int({ min: 70, max: 100 }) : faker.number.int({ min: 0, max: 40 });
                        }

                        // Pick response text based on key and sentiment
                        if (q.question_key === 'workload') {
                            response_text = isPositive ? 'Light' : 'Heavy';
                        } else if (q.question_key === 'rate_of_pay') {
                            response_text = isPositive ? 'Competitive' : 'Very low';
                        } else if (q.question_key === 'benefits') {
                            response_text = isPositive ? 'Excellent' : 'Poor';
                        } else if (q.question_key === 'career_growth') {
                            response_text = isPositive ? 'Excellent' : 'None';
                        }

                        allResponses.push({
                            resignation_id: resId,
                            question_id: q.id,
                            rating,
                            response_text,
                            selected_options
                        });
                    });
                }
            }
        }

        console.log(`[Simulation] Generated ${profiles.length} profiles, ${resignations.length} cases.`);

        const BATCH_SIZE = 100;

        // 1. Profiles
        for (let i = 0; i < profiles.length; i += BATCH_SIZE) {
            await supabase.from('profiles').insert(profiles.slice(i, i + BATCH_SIZE));
        }

        // 2. Resignations
        for (let i = 0; i < resignations.length; i += BATCH_SIZE) {
            await supabase.from('resignations').insert(resignations.slice(i, i + BATCH_SIZE));
        }

        // 3. Responses
        for (let i = 0; i < allResponses.length; i += BATCH_SIZE) {
            await supabase.from('exit_responses').insert(allResponses.slice(i, i + BATCH_SIZE));
        }

        revalidatePath('/dashboard');
        return { success: true, message: `Successfully seeded ${resignations.length} records across 12 months.` };

    } catch (error: any) {
        console.error('[Simulation] Failed to seed:', error);
        return { success: false, message: error.message || 'Failed to seed database.' };
    }
}

export async function purgeDatabase() {
    console.log('[Simulation] Starting purge process...');
    const supabase = await createClient();

    try {
        const SIMULATION_DOMAIN = '%@sim.retention.com';
        const { data: profiles, error: fetchError } = await supabase
            .from('profiles')
            .select('id')
            .like('email', SIMULATION_DOMAIN);

        if (fetchError) throw fetchError;
        if (!profiles?.length) return { success: true, message: 'No simulated records found.' };

        const ids = profiles.map(p => p.id);

        // Cascading deletes handled by DB ideally, but let's be explicit if not sure
        // We delete from resignations first, then profiles. exit_responses should cascade from resignations.
        const { error: resError } = await supabase.from('resignations').delete().in('employee_id', ids);
        if (resError) throw resError;

        const { error: profError } = await supabase.from('profiles').delete().in('id', ids);
        if (profError) throw profError;

        revalidatePath('/dashboard');
        return { success: true, message: `Successfully purged ${ids.length} simulated records.` };

    } catch (error: any) {
        console.error('[Simulation] Failed to purge:', error);
        return { success: false, message: error.message || 'Failed to purge database.' };
    }
}

