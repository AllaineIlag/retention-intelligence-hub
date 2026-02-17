
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

// Load .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

async function checkUser(email: string) {
    console.log(`Checking for user: ${email}`);

    // 1. Check Auth
    const { data: { users }, error: authError } = await supabase.auth.admin.listUsers();

    if (authError) {
        console.error('Error listing users:', authError.message);
        return;
    }

    const authUser = users.find(u => u.email === email);
    if (authUser) {
        console.log('✅ User found in Supabase Auth:');
        console.log(`   ID: ${authUser.id}`);
        console.log(`   Created At: ${authUser.created_at}`);
    } else {
        console.log('❌ User NOT found in Supabase Auth.');
    }

    // 2. Check Profiles
    const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', email)
        .single();

    if (profileError) {
        if (profileError.code === 'PGRST116') {
            console.log('❌ User NOT found in public.profiles table.');
        } else {
            console.error('Error checking profiles:', profileError.message);
        }
    } else {
        console.log('✅ User found in public.profiles table:');
        console.dir(profile);
    }

    // 3. Check Resignations
    const { data: resignation, error: resError } = await supabase
        .from('resignations')
        .select('*, profiles(email)')
        .match({ employee_id: authUser?.id })
        .maybeSingle();

    if (resignation) {
        console.log('✅ Resignation record found:');
        console.dir(resignation);
    } else {
        console.log('❌ No resignation record found for this user ID.');
    }
}

const emailToCheck = process.argv[2] || 'michaeljohnsford2001@gmail.com';
checkUser(emailToCheck);
