'use server';

import { createClient } from '@/lib/supabase/server';

export async function searchDirectory(query: string) {
    if (!query || query.length < 2) return { success: true, data: [] };

    const supabase = await createClient();

    const { data, error } = await supabase
        .from('company_directory')
        .select('*')
        .or(`full_name.ilike.%${query}%,email.ilike.%${query}%`)
        .limit(5);

    if (error) {
        console.error('[Directory] Search Error:', error);
        return { success: false, error: error.message };
    }

    return { success: true, data };
}
