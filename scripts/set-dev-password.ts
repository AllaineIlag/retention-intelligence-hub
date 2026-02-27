
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

async function setPasswords() {
    const leads = [
        { email: 'ilagallainebenedict01380@gmail.com', name: 'Allaine Benedict C. Ilag' },
        { email: 'baritmarvin03224@gmail.com', name: 'Marvin B. Barit' },
        { email: 'jonalyngandara@gmail.com', name: 'Jonalyn Quinto' }
    ];
    const password = 'Password123!';

    for (const lead of leads) {
        console.log(`Setting password for ${lead.email}...`);

        const { data: { users } } = await supabase.auth.admin.listUsers();
        const targetUser = users.find(u => u.email === lead.email);

        if (targetUser) {
            const { error: updateError } = await supabase.auth.admin.updateUserById(
                targetUser.id,
                { password: password }
            );

            if (updateError) {
                console.error(`❌ Update failed for ${lead.email}:`, updateError.message);
            } else {
                console.log(`✅ Password updated successfully for ${lead.name}!`);
            }
        } else {
            // Try create if not exists
            const { error: createError } = await supabase.auth.admin.createUser({
                email: lead.email,
                password: password,
                email_confirm: true,
                user_metadata: { full_name: lead.name }
            });
            if (createError) console.error(`❌ Creation failed for ${lead.email}:`, createError.message);
            else console.log(`✅ User ${lead.name} created successfully!`);
        }
    }
}

setPasswords();
