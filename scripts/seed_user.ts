import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

// Load env vars
const envPath = path.resolve(process.cwd(), '.env.local');
console.log('Loading env from:', envPath);
dotenv.config({ path: envPath });

if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error('Missing Supabase Environment Variables');
    process.exit(1);
}

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function run() {
    console.log('--- STARTING USER SEED DEBUG ---');

    const targetEmail = 'sungjinwoo1515@gmail.com';

    // 1. Try to list users
    const { data, error } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1000 });

    if (error) {
        console.error('FATAL: Failed to list users:', error.message);
        fs.writeFileSync('debug_error.json', JSON.stringify(error, null, 2));
        return;
    }

    console.log(`Successfully listed ${data.users.length} users.`);
    fs.writeFileSync('debug_users.json', JSON.stringify(data.users, null, 2));

    // 2. Find target
    const user = data.users.find(u => u.email === targetEmail);

    if (user) {
        console.log(`FOUND TARGET USER! ID: ${user.id}`);

        // 3. Upsert Profile
        console.log('Upserting profile...');
        const { error: profileError } = await supabase
            .from('profiles')
            .upsert({
                id: user.id,
                email: targetEmail,
                full_name: 'Sung Jinwoo',
                role: 'employee',
                updated_at: new Date().toISOString()
            });

        if (profileError) {
            console.error('Profile Upsert Failed:', profileError.message);
        } else {
            console.log('SUCCESS: Profile created/updated.');
        }

    } else {
        console.log(`User [${targetEmail}] NOT found in list.`);
        console.log('Attempting to create user...');

        const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
            email: targetEmail,
            email_confirm: true,
            user_metadata: { full_name: 'Sung Jinwoo' }
        });

        if (createError) {
            console.error('Create User Failed:', createError.message);
        } else if (newUser.user) {
            console.log('User created. ID:', newUser.user.id);
            // Recursively run to upsert profile? Or just do it here.
            const { error: pError } = await supabase.from('profiles').upsert({
                id: newUser.user.id,
                email: targetEmail,
                full_name: 'Sung Jinwoo',
                role: 'employee',
                updated_at: new Date().toISOString()
            });
            if (pError) console.error('Profile Upsert Failed:', pError.message);
            else console.log('SUCCESS: Profile created.');
        }
    }
}

run();
