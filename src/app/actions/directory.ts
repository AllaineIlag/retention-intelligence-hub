'use server';

import { createClient } from '@/lib/supabase/server';

export async function searchDirectory(query: string, department?: string) {
    if (!query || query.length < 2) return { success: true, data: [] };

    const supabase = await createClient();

    let q = supabase
        .from('company_directory')
        .select('*')
        .or(`full_name.ilike.%${query}%,email.ilike.%${query}%,control_number.ilike.%${query}%`);

    if (department) {
        q = q.eq('department', department);
    }

    const { data, error } = await q.limit(5);

    if (error) {
        console.error('[Directory] Search Error:', error);
        return { success: false, error: error.message };
    }

    return { success: true, data };
}
