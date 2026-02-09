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

export async function seedData(monthsBack: number = 3) {
    try {
        const supabase = getAdminClient();

        // 1. Check existing employee population
        let { data: employeeProfiles } = await supabase
            .from('profiles')
            .select(`
                id, 
                role,
                employee_details!inner (
                    full_name,
                    department
                )
            `)
            .eq('role', 'employee');

        // 2. Generate mock population if insufficient (Mock Recruitment)
        const RESIGNATION_TARGET = 100 * monthsBack;
        const MIN_POPULATION = Math.max(RESIGNATION_TARGET + 50, 150); // Ensure some stay active

        if (!employeeProfiles || employeeProfiles.length < MIN_POPULATION) {
            const needed = MIN_POPULATION - (employeeProfiles?.length || 0);
            console.log(`Insufficient population (${employeeProfiles?.length || 0}). Recruiting ${needed} mock employees...`);

            const departments = ['Engineering', 'Product', 'Sales', 'Marketing', 'Customer Success', 'HR', 'Operations'];

            for (let i = 0; i < needed; i++) {
                const newId = uuidv4();
                const firstName = faker.person.firstName();
                const lastName = faker.person.lastName();
                const fullName = `${firstName} ${lastName}`;
                const email = faker.internet.email({ firstName, lastName, provider: 'mock.co' }).toLowerCase();

                // Insert Profile
                const { error: pError } = await supabase
                    .from('profiles')
                    .insert({
                        id: newId,
                        email: email,
                        role: 'employee'
                    });

                if (pError) {
                    console.error('Failed to create mock profile:', pError.message);
                    continue;
                }

                // Insert Employee Details
                const { error: dError } = await supabase
                    .from('employee_details')
                    .insert({
                        id: newId,
                        employee_number: `MOCK-${faker.string.alphanumeric(6).toUpperCase()}`,
                        full_name: fullName,
                        department: faker.helpers.arrayElement(departments),
                        current_position: faker.person.jobTitle(),
                        date_hired: faker.date.past({ years: 5 }).toISOString().split('T')[0],
                        immediate_superior: faker.person.fullName()
                    });

                if (dError) {
                    console.error('Failed to create mock employee details:', dError.message);
                }
            }

            // Refresh population list
            const { data: refreshedProfiles } = await supabase
                .from('profiles')
                .select(`
                    id, 
                    role,
                    employee_details!inner (
                        full_name,
                        department
                    )
                `)
                .eq('role', 'employee');

            employeeProfiles = refreshedProfiles;
        }

        if (!employeeProfiles || employeeProfiles.length === 0) {
            throw new Error('Failed to generate mock population.');
        }

        const allProfiles = employeeProfiles;






        // 4. Generate Resignations
        // (RESIGNATION_TARGET already defined and calculated in Recruitment phase)
        const statuses = ['pending', 'scheduled', 'verified', 'completed', 'approved', 'declined'];


        console.log(`Generating ~${RESIGNATION_TARGET} resignations over ${monthsBack} months...`);
        const resignationsToInsert = [];

        // Shuffle profiles to pick random employees
        const shuffledProfiles = [...allProfiles].sort(() => 0.5 - Math.random());
        // Allow potentially more resignations than unique profiles if monthsBack is huge? 
        // 5000 profiles, 100/month = 1200/year. So unique profiles should suffice for now.
        const selectedProfiles = shuffledProfiles.slice(0, RESIGNATION_TARGET);

        for (const profile of selectedProfiles) {
            const details = (profile as any).employee_details;
            const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
            const daysBack = monthsBack * 30;
            const randomDate = faker.date.recent({ days: daysBack });

            resignationsToInsert.push({
                employee_id: profile.id,
                status: randomStatus,
                last_working_day: new Date(randomDate.getTime() + 14 * 24 * 60 * 60 * 1000).toISOString(), // +2 weeks
                // Tagging data with specific prefix for safe deletion
                reason: `[MOCK_DATA] ${faker.lorem.sentence()}`,
                created_at: randomDate.toISOString(),
                updated_at: randomDate.toISOString()
            });
        }


        // Batch insert resignations if large
        const RESIGNATION_BATCH_SIZE = 500;
        let insertedResignations: any[] = [];

        for (let i = 0; i < resignationsToInsert.length; i += RESIGNATION_BATCH_SIZE) {
            const batch = resignationsToInsert.slice(i, i + RESIGNATION_BATCH_SIZE);
            const { data: insertedBatch, error: resError } = await supabase
                .from('resignations')
                .insert(batch)
                .select();

            if (resError) throw new Error('Failed to batch insert resignations: ' + resError.message);
            if (insertedBatch) insertedResignations = [...insertedResignations, ...insertedBatch];
        }

        // 4. Generate Exit Responses & Results for completed/verified
        if (insertedResignations.length > 0) {
            const responsesToInsert = [];
            const resultsToInsert = [];
            const { data: questions } = await supabase.from('questions').select('id, question_key');

            if (questions) {
                for (const res of insertedResignations) {
                    if (['completed', 'verified'].includes(res.status)) {
                        // Responses (Free-text/Detailed)
                        for (const q of questions) {
                            responsesToInsert.push({
                                resignation_id: res.id,
                                question_id: q.id,
                                response_text: faker.lorem.paragraph(),
                                created_at: res.created_at
                            });
                        }

                        // Exit Questionnaire Results (Categorical responses for charts)
                        const standardReasons = ['Career Growth', 'Compensation', 'Management', 'Work-Life Balance'];
                        const growthLevels = ['Poor', 'Fair', 'Satisfactory', 'Excellent'];
                        const payLevels = ['Very low', 'Uncompetitive', 'Average', 'Competitive', 'High'];
                        const benefitLevels = ['None', 'Poor', 'Average', 'Good', 'Exceptional'];
                        const workloadLevels = ['Very heavy', 'Heavy', 'Manageable', 'Moderate', 'Light'];
                        const countries = ['USA', 'Canada', 'Australia', 'UAE', 'Singapore', 'UK'];

                        const results = [
                            { key: 'reason_for_leaving', val: faker.helpers.arrayElement(standardReasons) },
                            { key: 'recommendation', val: faker.number.int({ min: 0, max: 100 }).toString() },
                            { key: 'career_growth', val: faker.helpers.arrayElement(growthLevels) },
                            { key: 'rate_of_pay', val: faker.helpers.arrayElement(payLevels) },
                            { key: 'benefits', val: faker.helpers.arrayElement(benefitLevels) },
                            { key: 'workload', val: faker.helpers.arrayElement(workloadLevels) },
                            { key: 'reason_for_leaving_country', val: faker.helpers.arrayElement(countries) }
                        ];

                        for (const r of results) {
                            resultsToInsert.push({
                                resignation_id: res.id,
                                question_key: r.key,
                                response_value: r.val,
                                created_at: res.created_at
                            });
                        }


                    }
                }
            }

            if (responsesToInsert.length > 0) {
                const RESPONSE_BATCH_SIZE = 500;
                for (let i = 0; i < responsesToInsert.length; i += RESPONSE_BATCH_SIZE) {
                    const batch = responsesToInsert.slice(i, i + RESPONSE_BATCH_SIZE);
                    const { error } = await supabase.from('exit_responses').insert(batch);
                    if (error) console.error('Failed to batch insert responses:', error.message);
                }
            }

            if (resultsToInsert.length > 0) {
                const { error } = await supabase.from('exit_questionnaire_results').insert(resultsToInsert);
                if (error) console.error('Failed to insert questionnaire results:', error.message);
            }
        }

        revalidatePath('/dashboard');
        return { success: true };
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        console.error('Seed Error:', error);
        return { success: false, error: errorMessage };
    }
}

export async function clearData() {
    try {
        const supabase = getAdminClient();

        console.log('Initiating Protocol Scouring...');

        // 1. Phase 1: Personnel Scouring
        // Target all profiles with the '@mock.co' signature.
        // This will automatically cascade to 'employee_details', 'resignations', 'exit_responses', etc.
        const { error: pError } = await supabase
            .from('profiles')
            .delete()
            .ilike('email', '%@mock.co');

        if (pError) {
            console.error('Personnel Scouring failed:', pError.message);
            throw new Error('Failed to purge mock personnel: ' + pError.message);
        }

        // 2. Phase 2: Logistical Scouring (Residual)
        // Scuttle any remaining resignations tagged with [MOCK_DATA] that might be attached 
        // to real/whitelisted profiles during testing.
        const { error: resError } = await supabase
            .from('resignations')
            .delete()
            .ilike('reason', '[MOCK_DATA]%');

        if (resError) {
            console.error('Logistical Scouring failed:', resError.message);
            throw new Error('Failed to scuttle residual mock data: ' + resError.message);
        }

        console.log('Protocol Scouring successful. Sectors cleared.');

        revalidatePath('/dashboard');
        return { success: true };


    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        console.error('Clear Error:', error);
        return { success: false, error: errorMessage };
    }
}
