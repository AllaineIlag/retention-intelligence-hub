'use server';

import { createClient } from '@/lib/supabase/server';
import { faker } from '@faker-js/faker';
import { revalidatePath } from 'next/cache';

export async function seedDatabase() {
    console.log('[Simulation] Starting seed process...');
    const supabase = await createClient();

    try {
        const SIMULATION_DOMAIN = '@sim.retention.com';
        const TOTAL_RECORDS = 1200; // 100 per month for 12 months

        const profiles = [];
        const resignations = [];

        // Generate data for the last 12 months
        // We want a curve, maybe higher in Dec/Jan?
        // For simplicity, random distribution over 365 days.

        for (let i = 0; i < TOTAL_RECORDS; i++) {
            const id = faker.string.uuid();
            const firstName = faker.person.firstName();
            const lastName = faker.person.lastName();
            const email = `${firstName}.${lastName}${i}${SIMULATION_DOMAIN}`.toLowerCase();
            const department = faker.helpers.arrayElement([
                'Engineering', 'Sales', 'Marketing', 'Product', 'Customer Support', 'HR', 'Finance'
            ]);
            const role = 'employee';

            // Generate a date within last year
            const resignationDate = faker.date.past({ years: 1 });
            const status = faker.helpers.arrayElement([
                'completed', 'completed', 'completed', // Weighted towards completed
                'verified',
                'scheduled',
                'pending'
            ]);

            // Profile
            profiles.push({
                id,
                email,
                full_name: `${firstName} ${lastName}`,
                role,
                created_at: resignationDate.toISOString(),
                updated_at: resignationDate.toISOString(),
            });

            // Resignation
            resignations.push({
                employee_id: id,
                department,
                position: faker.person.jobTitle(),
                reason: faker.helpers.arrayElement([
                    'Better Opportunity', 'Compensation', 'Management', 'Relocation', 'Career Change', 'Work-Life Balance'
                ]),
                last_working_day: faker.date.soon({ days: 30, refDate: resignationDate }).toISOString(),
                status,
                created_at: resignationDate.toISOString(),
                updated_at: resignationDate.toISOString(),
            });
        }

        console.log(`[Simulation] Generated ${profiles.length} records. Inserting...`);

        // Insert in batches of 100 to avoid packet size limits
        const BATCH_SIZE = 100;

        // 1. Insert Profiles
        for (let i = 0; i < profiles.length; i += BATCH_SIZE) {
            const batch = profiles.slice(i, i + BATCH_SIZE);
            const { error } = await supabase.from('profiles').insert(batch);
            if (error) {
                console.error('[Simulation] Error inserting profiles batch:', error);
                throw error;
            }
        }

        // 2. Insert Resignations
        for (let i = 0; i < resignations.length; i += BATCH_SIZE) {
            const batch = resignations.slice(i, i + BATCH_SIZE);
            const { error } = await supabase.from('resignations').insert(batch);
            if (error) {
                console.error('[Simulation] Error inserting resignations batch:', error);
                throw error;
            }
        }

        console.log('[Simulation] Seed complete.');
        revalidatePath('/dashboard');
        return { success: true, message: `Successfully seeded ${TOTAL_RECORDS} records.` };

    } catch (error) {
        console.error('[Simulation] Failed to seed:', error);
        return { success: false, message: 'Failed to seed database. Check server logs.' };
    }
}

export async function purgeDatabase() {
    console.log('[Simulation] Starting purge process...');
    const supabase = await createClient();

    try {
        const SIMULATION_DOMAIN = '%@sim.retention.com';

        // 1. Get IDs of profiles to delete
        const { data: profiles, error: fetchError } = await supabase
            .from('profiles')
            .select('id')
            .like('email', SIMULATION_DOMAIN);

        if (fetchError) throw fetchError;
        if (!profiles || profiles.length === 0) {
            return { success: true, message: 'No simulated records found.' };
        }

        const ids = profiles.map(p => p.id);
        console.log(`[Simulation] Found ${ids.length} profiles to purge.`);

        // 2. Delete Resignations (Cascading manually to be safe)
        const { error: resError } = await supabase
            .from('resignations')
            .delete()
            .in('employee_id', ids);

        if (resError) throw resError;

        // 3. Delete Profiles
        const { error: profError } = await supabase
            .from('profiles')
            .delete()
            .in('id', ids);

        if (profError) throw profError;

        console.log('[Simulation] Purge complete.');
        revalidatePath('/dashboard');
        return { success: true, message: `Successfully purged ${ids.length} simulated records.` };

    } catch (error) {
        console.error('[Simulation] Failed to purge:', error);
        return { success: false, message: 'Failed to purge database. Check server logs.' };
    }
}
