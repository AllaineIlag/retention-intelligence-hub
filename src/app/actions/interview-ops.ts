'use server';

import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

export async function getInterviewDetails(resignationId: string) {
    const supabase = await createClient();

    // 1. Fetch Resignation + Employee Details
    const { data: resignation, error: resError } = await supabase
        .from('resignations')
        .select(`
            *,
            employee_details (
                full_name,
                department,
                employee_number,
                current_position,
                date_hired,
                immediate_superior,
                resignation_date
            ),
            profiles (
                email,
                role
            )
        `)
        .eq('id', resignationId)
        .single();


    if (resError) {
        console.error('Error fetching resignation:', resError);
        return { error: 'Failed to fetch interview details' };
    }

    // 2. Fetch Exit Responses + Questions
    // We left join questions to get the text
    const { data: responses, error: respError } = await supabase
        .from('exit_responses')
        .select(`
      *,
      question:questions (*)
    `)
        .eq('resignation_id', resignationId)
        .order('question_id', { ascending: true }); // Simple ordering, might need refinement if order matters

    if (respError) {
        console.error('Error fetching responses:', respError);
        return { error: 'Failed to fetch responses' };
    }

    return {
        resignation,
        responses,
    };
}

export async function saveCorrection(
    responseId: string,
    data: {
        corrected_answer: string;
        interviewer_note?: string;
    }
) {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) return { error: 'Unauthorized' };

    // Fetch role to ensure only lead/interviewer can correct
    // (Assuming RLS handles this, but good to be explicit/safe)
    // For now, relying on RLS.

    // First, get the current response to save as original if not already set?
    // Actually, the requirement says "Phase 3 (Live Correction)". 
    // If original_answer is NULL, we should probably copy response_text/selected_options to it?
    // OR, we assume 'response_text' IS the employee's answer (Original), 
    // and 'corrected_answer' is the new column.
    // The schema says: original_answer, corrected_answer.
    // Strategy: 
    // 1. Check if original_answer is empty. If so, populate it with the CURRENT response value (snapshot).
    // 2. Update corrected_answer and notes. (Actually, wait. If we update corrected_answer, do we leave response_text alone?
    //    Yes. response_text = Employee's perception. corrected_answer = Truth.
    //    Therefore, original_answer might be redundant if response_text is immutable?
    //    BUT, the task says: "Schema update for dual-storage (Truth vs. Perception)."
    //    So: 
    //      response_text -> Employee Answer
    //      corrected_answer -> Interviewer Answer
    //      original_answer -> Maybe a snapshot? Or is it just response_text? 
    //    Let's assume:
    //      response_text IS the original answer.
    //      corrected_answer IS the verified answer.
    //      If we need an explicit 'original_answer' column (as per task), maybe it's for cases where 
    //      the EMPLOYEE changes it? But employee can't change after lock.
    //    Let's stick to the prompt's request: Add `original_answer`, `corrected_answer`.
    //    Logic: On First Correction, copy response_text -> original_answer.
    //    Then save corrected_answer.

    // Let's get the current row first, and check resignation status
    const { data: current, error: fetchError } = await supabase
        .from('exit_responses')
        .select(`
            *,
            resignation:resignations (
                status
            )
        `)
        .eq('id', responseId)
        .single();

    if (fetchError || !current) return { error: 'Response not found' };

    // @ts-ignore - Supabase type inference might miss the joined property if not strictly typed in project
    if (current.resignation?.status === 'completed') {
        return { error: 'This interview is finalized and cannot be edited.' };
    }

    const updatePayload: any = {
        corrected_answer: data.corrected_answer,
        interviewer_note: data.interviewer_note,
        is_corrected: true,
    };

    // If this is the first correction, snapshot the original
    if (!current.original_answer) {
        // Determine what the "answer" was. It could be text or options.
        // For simplicity, let's snapshot both or just the primary text representation?
        // The column is TEXT.
        let snapshot = '';
        if (current.response_text) snapshot = current.response_text;
        else if (current.selected_options && current.selected_options.length > 0) {
            snapshot = current.selected_options.join(', ');
        } else if (current.rating) {
            snapshot = current.rating.toString();
        }

        updatePayload.original_answer = snapshot;
    }

    const { error } = await supabase
        .from('exit_responses')
        .update(updatePayload)
        .eq('id', responseId);

    if (error) {
        console.error('Error saving correction:', error);
        return { error: 'Failed to save correction' };
    }

    revalidatePath('/dashboard/interview');
    return { success: true };
}

export async function finalizeInterview(resignationId: string) {
    const supabase = await createClient();

    // Update resignation status to 'completed'
    // And maybe set a 'completed_at' timestamp?

    const { error } = await supabase
        .from('resignations')
        .update({
            status: 'completed',
            // exit_date might already be set, but maybe we confirm it here?
        })
        .eq('id', resignationId);

    if (error) {
        console.error('Error finalizing interview:', error);
        return { error: 'Failed to finalize interview' };
    }

    revalidatePath('/dashboard');
    return { success: true };
}

export async function getAllInterviews() {
    const supabase = await createClient();

    const { data: interviews, error } = await supabase
        .from('resignations')
        .select(`
            id,
            status,
            created_at,
            scheduled_interview_date,
            exit_date,
            employee_details (
                full_name,
                department
            ),
            employee_profile:profiles (
                id,
                email,
                role
            )
        `)
        .in('status', ['pending', 'scheduled'])
        .order('created_at', { ascending: false });


    if (error) {
        console.error('Error fetching interviews:', error);
        return { success: false, error: 'Failed to fetch interviews' };
    }

    // Transform data to ensure employee is a single object
    const formattedInterviews = interviews?.map(interview => ({
        ...interview,
        employee: {
            // @ts-ignore
            ...interview.employee_details,
            // @ts-ignore
            ...interview.employee_profile
        }
    }));


    return { success: true, data: formattedInterviews };
}
