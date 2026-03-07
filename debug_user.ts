import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
    const email = 'justin.jackson.4910@tdk.sim.com';
    console.log(`--- DEBUGGING FOR: ${email} ---`);

    // 1. Check Auth User
    const { data: users, error: authError } = await supabase.auth.admin.listUsers();
    if (authError) console.error('Auth Error:', authError);
    const authUser = users?.users.find(u => u.email === email);
    console.log('1. Auth User:', authUser ? `Found (ID: ${authUser.id})` : 'Not Found');

    // 2. Check Profile
    const { data: profile } = await supabase.from('profiles').select('*').eq('email', email).single();
    console.log('2. Profile:', profile ? `Found (ID: ${profile.id}, Role: ${profile.role})` : 'Not Found');

    // 3. Check Company Directory
    const { data: directory } = await supabase.from('company_directory').select('*').eq('email', email).single();
    console.log('3. Company Directory:', directory ? `Found (ID: ${directory.id}, control_number: ${directory.control_number})` : 'Not Found');

    // 4. Check Resignation
    const { data: resignations, error: resError } = await supabase.from('resignations').select('*').eq('personal_email', email);
    console.log('4. Resignations (by personal_email):', resignations?.length || 0, 'found');
    if (resignations && resignations.length > 0) {
        console.log('   Resignation details:', JSON.stringify(resignations, null, 2));
    }

    if (directory) {
        const { data: dirRes } = await supabase.from('resignations').select('*').eq('directory_id', directory.id);
        console.log('   Resignations (by directory_id):', dirRes?.length || 0, 'found');
    }

    // 5. Test the actual getResignation inner join query
    const { data: existing, error: fetchError } = await supabase
        .from('resignations')
        .select('*, company_directory!inner(*)')
        .eq('company_directory.email', email)
        .in('status', ['pending_exit_form', 'pending_interview', 'scheduled', 'locked', 'completed'])
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

    console.log('\n--- 5. ACTUAL QUERY RESULT ---');
    if (fetchError) console.error('Query Error:', fetchError);
    console.log('Result:', existing ? `Found Resignation ${existing.id}` : 'NULL');

}

main().catch(console.error);
