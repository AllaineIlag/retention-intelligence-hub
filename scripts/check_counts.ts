
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function checkCounts() {
    const { count: leads } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'lead');
    const { count: interviewers } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'interviewer');
    const { count: employees } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'employee');
    const { count: adminDetails } = await supabase.from('admin_details').select('*', { count: 'exact', head: true });

    console.log(`Leads: ${leads}`);
    console.log(`Interviewers: ${interviewers}`);
    console.log(`Employees: ${employees}`);
    console.log(`Admin Details: ${adminDetails}`);
}

checkCounts();
