'use server';

import { createClient } from '@/lib/supabase/server';
import { format } from 'date-fns';

export interface QualitativeComment {
    id: string;
    employeeName: string;
    role: string;
    department: string;
    reasonCategory: string; // The selected drop-down reason
    comment: string;        // The text explanation
    date: string;
}

export async function getQualitativeComments(): Promise<QualitativeComment[]> {
    const supabase = await createClient();

    // Fetch comments joined via resignations -> company_directory for role/dept
    const { data, error } = await supabase
        .from('exit_interview_results')
        .select(`
            id,
            question_key,
            response_value,
            comment,
            created_at,
            resignation:resignation_id (
                directory_id,
                company_directory (
                    full_name,
                    position,
                    department
                )
            )
        `)
        .eq('question_key', 'reason_for_leaving')
        .not('comment', 'is', null)
        .neq('comment', '')
        .order('created_at', { ascending: false })
        .limit(20);

    if (error) {
        console.error('Error fetching qualitative comments:', error);
        return [];
    }

    return data.map((row: any) => {
        const resignation = Array.isArray(row.resignation) ? row.resignation[0] : row.resignation;
        const dir = Array.isArray(resignation?.company_directory)
            ? resignation.company_directory[0]
            : resignation?.company_directory;

        // Clean up reason category (remove quotes/brackets)
        let reasonCat = row.response_value || "General";
        if (typeof reasonCat === 'string') {
            reasonCat = reasonCat.replace(/[\[\]"]/g, '').replace(/,/g, ', ');
        }

        return {
            id: row.id,
            employeeName: dir?.full_name || 'Anonymous',
            role: dir?.position || 'Unknown Role',
            department: dir?.department || 'Unknown Dept',
            reasonCategory: reasonCat,
            comment: row.comment,
            date: format(new Date(row.created_at), 'MMM d, yyyy')
        };
    });
}
