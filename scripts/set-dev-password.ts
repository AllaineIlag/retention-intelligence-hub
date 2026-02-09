
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
    console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function setPassword() {
    const email = 'benjaminbrowning2001@gmail.com'; // Change this if needed
    const password = 'Password123!';

    console.log(`Setting password for ${email}...`);

    const { data: { user }, error: userError } = await supabase.auth.admin.createUser({
        email: email,
        password: password,
        email_confirm: true
    });

    if (userError) {
        // If user already exists, update password
        console.log('User exists (or create failed), trying update...');

        // Need to find user ID first if we want to be safe, but update user by email isn't direct in admin api without ID usually, 
        // actually updateUserById requires ID. 
        // Let's get the user ID first.

        // Wait, listUsers might be slow.
        // Actually, we can just try signIn to see if it exists? No, this is admin script.

        // Let's try to get user by email directly if possible or just use listUsers filtering.
        // There isn't a direct "getUserByEmail" in admin API publicly exposed in all versions, but `listUsers` works.

        // SIMPLER WAY: Just use updateUser with the ID if we can find it.
        // But let's try just overwriting via updateUserById if we can get the ID.

        // Actually, let's just use the known ID if we have it, or fetch it.
        // Admin API mostly needs ID.

        // Alternative: Use the "MAGIC" trick of update user which requires ID.
        // Let's fetch the user first.

        const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
        const targetUser = users.find(u => u.email === email);

        if (targetUser) {
            const { error: updateError } = await supabase.auth.admin.updateUserById(
                targetUser.id,
                { password: password }
            );

            if (updateError) {
                console.error('❌ Update failed:', updateError.message);
            } else {
                console.log('✅ Password updated successfully!');
            }
        } else {
            console.error('❌ User not found and creation failed:', userError.message);
        }

    } else {
        console.log('✅ User created with password!');
    }
}

setPassword();
