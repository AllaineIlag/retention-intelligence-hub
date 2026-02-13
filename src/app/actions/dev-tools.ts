'use server';

import { createClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';
import { v4 as uuidv4 } from 'uuid';
import { faker } from '@faker-js/faker';

// Helper to get admin client
function getAdminClient() {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
        throw new Error('Missing Supabase Environment Variables (NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY)');
    }
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY
    );
}

export interface SeedConfig {
    headcount: number;
    attritionRate: number; // monthly %
    volatility: number;    // ± variance
    sentimentScore: number; // 0-100
    monthsBack: number;    // Time span
    ratios: {
        completed: number;
        cancelled: number;
    };
}

export async function seedData(config: SeedConfig) {
    try {
        const supabase = getAdminClient();
        const SIMULATION_DOMAIN = '@sim.retention.com';

        // 1. Ensure minimal population (profiles + employee_details)
        const { count: currentCount } = await supabase
            .from('profiles')
            .select('*', { count: 'exact', head: true })
            .eq('role', 'employee');

        if ((currentCount || 0) < config.headcount) {
            const needed = config.headcount - (currentCount || 0);
            console.log(`[DevTools] Generating ${needed} additional mock employees...`);

            const departments = ['Engineering', 'Product', 'Sales', 'Marketing', 'Customer Success', 'HR', 'Operations'];

            for (let i = 0; i < needed; i++) {
                const newId = uuidv4();
                const firstName = faker.person.firstName();
                const lastName = faker.person.lastName();
                const email = `${firstName}.${lastName}.${i}${SIMULATION_DOMAIN}`.toLowerCase();

                await supabase.from('profiles').insert({
                    id: newId,
                    email,
                    role: 'employee'
                });

                await supabase.from('employee_details').insert({
                    id: newId,
                    employee_number: `SIM-${faker.string.alphanumeric(6).toUpperCase()}`,
                    full_name: `${firstName} ${lastName}`,
                    department: faker.helpers.arrayElement(departments),
                    current_position: faker.person.jobTitle(),
                    date_hired: faker.date.past({ years: 5 }).toISOString().split('T')[0],
                    immediate_superior: faker.person.fullName()
                });
            }
        }

        // 2. Fetch all employees for selection
        const { data: allEmployees } = await supabase
            .from('profiles')
            .select('id')
            .eq('role', 'employee');

        if (!allEmployees) throw new Error('No employees available for seeding.');

        // 3. Simulation Logic
        const { data: questionData } = await supabase.from('questions').select('id, question_key, category');

        const resignations = [];
        const allResponses: any[] = [];
        const questionnaireResults: any[] = [];

        const now = new Date();
        const startSimulation = new Date(now.getFullYear(), now.getMonth() - config.monthsBack, 1);

        const baseExits = (config.headcount * (config.attritionRate / 100));
        let employeePool = [...allEmployees].sort(() => 0.5 - Math.random());

        for (let m = 0; m < config.monthsBack; m++) {
            const monthDate = new Date(startSimulation.getFullYear(), startSimulation.getMonth() + m, 1);
            const variance = (Math.random() * 2 - 1) * config.volatility;
            const monthlyExitableCount = Math.max(1, Math.round(baseExits + (baseExits * variance)));

            for (let i = 0; i < monthlyExitableCount; i++) {
                if (employeePool.length === 0) break;
                const employee = employeePool.pop()!;

                const resignationDate = faker.date.between({
                    from: monthDate,
                    to: new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0)
                });

                const rand = Math.random() * 100;
                let status: 'pending' | 'scheduled' | 'completed' | 'cancelled' = 'completed';
                if (rand < config.ratios.completed) status = 'completed';
                else if (rand < config.ratios.completed + config.ratios.cancelled) status = 'cancelled';
                else status = Math.random() > 0.5 ? 'scheduled' : 'pending';

                const resId = uuidv4();
                resignations.push({
                    id: resId,
                    employee_id: employee.id,
                    status,
                    reason: `[MOCK_DATA] ${faker.lorem.sentence()}`,
                    created_at: resignationDate.toISOString(),
                    last_working_day: new Date(resignationDate.getTime() + 14 * 24 * 60 * 60 * 1000).toISOString(),
                });

                if (status === 'completed' || status === 'scheduled') {
                    const isPositive = (Math.random() * 100) < config.sentimentScore;

                    questionData?.forEach(q => {
                        let val: string | null = null;

                        // Categories for sentiment mapping
                        if (q.category === 'compensation' || q.category === 'growth' || q.category === 'culture' || q.category === 'workload') {
                            const level = isPositive ? faker.helpers.arrayElement(['Good', 'Excellent', 'Satisfactory']) : faker.helpers.arrayElement(['Poor', 'Fair', 'Very heavy']);
                            val = level;
                        }

                        if (q.question_key === 'recommendation') {
                            val = (isPositive ? faker.number.int({ min: 70, max: 100 }) : faker.number.int({ min: 0, max: 40 })).toString();
                        }

                        if (val) {
                            questionnaireResults.push({
                                resignation_id: resId,
                                question_key: q.question_key,
                                response_value: val,
                                created_at: resignationDate.toISOString()
                            });
                        }

                        allResponses.push({
                            resignation_id: resId,
                            question_id: q.id,
                            response_text: isPositive ? faker.lorem.sentence() : faker.lorem.paragraph(),
                            created_at: resignationDate.toISOString()
                        });
                    });
                }
            }
        }

        // 4. Batch Insert
        const BATCH_SIZE = 500;
        for (let i = 0; i < resignations.length; i += BATCH_SIZE) {
            await supabase.from('resignations').insert(resignations.slice(i, i + BATCH_SIZE));
        }

        for (let i = 0; i < allResponses.length; i += BATCH_SIZE) {
            await supabase.from('exit_responses').insert(allResponses.slice(i, i + BATCH_SIZE));
        }

        for (let i = 0; i < questionnaireResults.length; i += BATCH_SIZE) {
            await supabase.from('exit_questionnaire_results').insert(questionnaireResults.slice(i, i + BATCH_SIZE));
        }

        revalidatePath('/dashboard');
        return { success: true };
    } catch (error) {
        console.error('[DevTools] Seed Error:', error);
        return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
}


export async function clearData() {
    try {
        const supabase = getAdminClient();

        console.log('Initiating Protocol Scouring...');

        // 1. Identify Targets
        // We target both the new simulation domain and any legacy mock data
        // Using separate queries to ensure robustness against OR filter syntax edge cases
        const { data: simProfiles, error: simError } = await supabase
            .from('profiles')
            .select('id')
            .ilike('email', '%@sim.retention.com');

        if (simError) throw new Error('Simulation target fetch failed: ' + simError.message);

        const { data: mockProfiles, error: mockError } = await supabase
            .from('profiles')
            .select('id')
            .ilike('email', '%@mock.co');

        if (mockError) throw new Error('Legacy target fetch failed: ' + mockError.message);

        const profiles = [...(simProfiles || []), ...(mockProfiles || [])];

        if (!profiles || profiles.length === 0) {
            return { success: true, message: 'No simulated targets found.' };
        }

        // Deduplicate IDs just in case
        const profileIds = Array.from(new Set(profiles.map(p => p.id)));
        console.log(`[Scour] Identified ${profileIds.length} personnel targets.`);

        // 2. Identify Linked Resignations (for cascade)
        // We need resignation IDs to clear responses
        const { data: resignations, error: resFetchError } = await supabase
            .from('resignations')
            .select('id')
            .in('employee_id', profileIds);

        const resignationIds = resignations?.map(r => r.id) || [];
        console.log(`[Scour] Identified ${resignationIds.length} resignation records.`);

        // Helper for batched deletion
        const batchDelete = async (table: string, column: string, ids: string[]) => {
            if (ids.length === 0) return;
            const BATCH_SIZE = 50; // Reduced from 1000 to prevent 400 Bad Request (URL/Payload limit)
            for (let i = 0; i < ids.length; i += BATCH_SIZE) {
                const batch = ids.slice(i, i + BATCH_SIZE);
                const { error } = await supabase.from(table).delete().in(column, batch);
                if (error) throw new Error(`Failed to purge ${table}: ${error.code} - ${error.message}`);
            }
        };

        // 3. Execution Phase (Manual Cascade)
        // Order: Intelligence -> State -> Identity

        // A. Intelligence (Responses)
        if (resignationIds.length > 0) {
            await batchDelete('exit_questionnaire_results', 'resignation_id', resignationIds);
            await batchDelete('exit_responses', 'resignation_id', resignationIds);
            console.log('[Scour] Intelligence sectors cleared.');
        }

        // B. State (Resignations & Details)
        if (profileIds.length > 0) {
            await batchDelete('resignations', 'employee_id', profileIds); // Delete resignations first
            await batchDelete('employee_details', 'id', profileIds);      // Then details (FK is id)
            console.log('[Scour] State records cleared.');
        }

        // C. Identity (Profiles)
        if (profileIds.length > 0) {
            await batchDelete('profiles', 'id', profileIds);
            console.log('[Scour] Identity records neutralized.');
        }

        // 4. Cleanup Residuals (Legacy)
        await supabase.from('resignations').delete().ilike('reason', '[MOCK_DATA]%');

        revalidatePath('/dashboard');
        return { success: true, count: profileIds.length };

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        console.error('Clear Error:', error);
        return { success: false, error: errorMessage };
    }
}
