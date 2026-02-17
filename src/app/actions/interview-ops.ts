'use server';

import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { resend } from '@/lib/email';
import { EMAIL_CONFIG } from '@/constants/enums';
import ResignationScheduledEmail from '@/emails/ResignationScheduledEmail';

// Schedule Interview (Step 3)
export async function scheduleInterview(resignationId: string, scheduleDate: Date) {
    const supabase = await createClient();
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

    // 1. Update Resignation
    const { data: resignation, error: updateError } = await supabase
        .from('resignations')
        .update({
            status: 'scheduled',
            scheduled_interview_date: scheduleDate.toISOString(),
        })
        .eq('id', resignationId)
        .select(`
            *,
             employee_details (
                full_name
            ),
            profiles (
                email
            )
        `)
        .single();

    if (updateError) {
        return { success: false, error: updateError.message };
    }

    // 2. Send Invitation Email (Email 2)
    if (resignation?.profiles?.email) {
        try {
            await resend.emails.send({
                from: process.env.RESEND_FROM_EMAIL || EMAIL_CONFIG.FROM,
                to: [(resignation as any).profiles.email],
                subject: 'Exit Interview Scheduled & Action Required',
                react: ResignationScheduledEmail({
                    employeeName: (resignation as any).employee_details?.full_name || 'Employee',
                    interviewDate: scheduleDate.toISOString(),
                    actionUrl: `${siteUrl}/login`
                }),
            });
        } catch (emailError) {
            console.error('Email Error:', emailError);
        }
    }

    revalidatePath('/dashboard/interview');
    return { success: true };
}

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
        .from('exit_questionnaires_result')
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

    // 3. Fetch Verified Results (Analytics Data)
    // This is the "Truth" that the interviewer edits.
    const { data: verifiedResults, error: verError } = await supabase
        .from('exit_interview_results')
        .select('*')
        .eq('resignation_id', resignationId);

    if (verError) {
        console.error('Error fetching verified results:', verError);
        // We don't block the UI, just return empty array
    }

    return {
        resignation,
        responses, // Raw (Left Side)
        verifiedResults: verifiedResults || [] // Verified (Right Side)
    };
}

export async function saveVerifiedAnswer(
    resignationId: string,
    questionKey: string,
    value: any // JSONB
) {
    const supabase = await createClient();

    // Guard: Block edits after finalization
    const { data: resignation, error: checkError } = await supabase
        .from('resignations')
        .select('status')
        .eq('id', resignationId)
        .single();

    if (checkError || !resignation) {
        return { success: false, error: 'Resignation not found' };
    }

    if (resignation.status === 'completed') {
        return { success: false, error: 'This interview is finalized and cannot be edited.' };
    }

    // Upsert the verified answer
    const { error } = await supabase
        .from('exit_interview_results')
        .upsert({
            resignation_id: resignationId,
            question_key: questionKey,
            response_value: value,
            updated_at: new Date().toISOString()
        }, {
            onConflict: 'resignation_id,question_key'
        });

    if (error) {
        console.error('Error saving verified answer:', error);
        return { success: false, error: 'Failed to save verified answer' };
    }

    revalidatePath(`/dashboard/interview/${resignationId}`);
    return { success: true };
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
        .from('exit_questionnaires_result')
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
        .from('exit_questionnaires_result')
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
            last_working_day,
            employee_details (
                full_name,
                department
            ),
            profiles (
                id,
                email,
                role
            )
        `)
        // Fetch ALL statuses so we can segment them on the client (Active vs History)
        // .in('status', ['pending', 'scheduled']) <-- REMOVED LIMITATION
        .order('created_at', { ascending: false });


    if (error) {
        console.error('Error fetching interviews detailed:', JSON.stringify(error, null, 2));
        console.error('Error fetching interviews raw:', error);
        return { success: false, error: 'Failed to fetch interviews' };
    }

    // Transform data to ensure employee is a single object
    const formattedInterviews = interviews?.map(interview => ({
        ...interview,
        employee: {
            // @ts-ignore
            ...interview.employee_details,
            // @ts-ignore
            ...interview.profiles
        }
    }));


    return { success: true, data: formattedInterviews };
}

export async function getInterviewerDashboard() {
    const supabase = await createClient();

    // Fetch ALL relevant cases for the interviewer
    // They need to see:
    // 1. Scheduled (Today/Upcoming) -> 'scheduled' or 'approved' (depending on nomenclature, but usually 'scheduled')
    // 2. Pending Verification -> 'pending' (HR Verification)
    // 3. Ready for Scheduling -> 'verified'

    const { data: allCases, error } = await supabase
        .from('resignations')
        .select(`
            *,
            employee_details ( full_name, current_position, department, employee_number ),
            profiles ( email )
        `)
        .in('status', ['pending_interview'])
        .order('scheduled_interview_date', { ascending: true, nullsFirst: false }); // Put scheduled ones first-ish? No, sort by date for scheduled.

    if (error) {
        console.error('Error fetching interviewer dashboard:', error);
        return { success: false, error: 'Failed to fetch dashboard data' };
    }

    return { success: true, data: allCases };
}
