import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

async function checkRLS() {
    const { data, error } = await supabase.from('resignations').select('*').limit(1);
    const { data: policies, error: polError } = await supabase.rpc('execute_sql', {
        query: "SELECT * FROM pg_policies WHERE tablename = 'resignations';"
    });
    console.log(policies || polError);
}

checkRLS();
