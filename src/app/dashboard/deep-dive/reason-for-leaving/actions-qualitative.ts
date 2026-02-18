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

    // Fetch exit results linked to resignations -> profiles (name) -> employee_details (role/dept)
    const { data, error } = await supabase
        .from('exit_interview_results')
        .select(`
            id,
            question_key,
            response_value,
            comment,
            created_at,
            resignation:resignation_id (
                employee_id,
                profiles:profiles!resignations_employee_id_fkey (
                    full_name,
                    employee_details (
                        current_position,
                        department
                    )
                )
            )
        `)
        .eq('question_key', 'reason_for_leaving')
        .not('comment', 'is', null) // Only fetch if there is a comment
        .neq('comment', '')         // And it's not empty
        .order('created_at', { ascending: false })
        .limit(20); // Latest 20 comments

    if (error) {
        console.error('Error fetching qualitative comments:', error);
        return [];
    }

    return data.map((row: any) => {
        const resignation = Array.isArray(row.resignation) ? row.resignation[0] : row.resignation;
        const profile = resignation?.profiles;  // profiles is usually object object via FK
        const pObj = Array.isArray(profile) ? profile[0] : profile;

        const details = pObj?.employee_details;
        const dObj = Array.isArray(details) ? details[0] : details;

        // Clean up reason category (remove quotes/brackets)
        let reasonCat = row.response_value || "General";
        if (typeof reasonCat === 'string') {
            reasonCat = reasonCat.replace(/[\[\]"]/g, '').replace(/,/g, ', ');
        }

        return {
            id: row.id,
            employeeName: pObj?.full_name || 'Anonymous',
            role: dObj?.current_position || 'Unknown Role',
            department: dObj?.department || 'Unknown Dept',
            reasonCategory: reasonCat,
            comment: row.comment,
            date: format(new Date(row.created_at), 'MMM d, yyyy')
        };
    });
}
