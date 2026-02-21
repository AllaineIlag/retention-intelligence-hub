'use server';

import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { revalidatePath } from 'next/cache';

// Types
export interface EmployeeDetails {
    employee_number: string;
    employee_name: string;
    date_hired: string;
    position_when_hired: string;
    current_position: string;

    intermediate_supervisor: string; // New
    business_unit: string; // New
    department: string;
    date_of_resignation: string;
}

export interface QuestionnaireResponses {
    reason_for_leaving?: string[];
    reason_for_leaving_country?: string;
    why_more_desirable?: string[];
    why_more_desirable_other?: string;
    career_growth?: string;
    rate_of_pay?: string;
    benefits?: string;
    benefits_comment?: string;
    workload?: string;
    workload_comment?: string;
    recommendation?: string;
    recommendation_reason?: string;
}

export interface ExitFormData {
    resignation_id: string;
    employee_details?: EmployeeDetails;
    questionnaire_responses?: QuestionnaireResponses;
    additional_comments?: Record<string, string>;
    consent_given?: boolean;
}

export interface Question {
    id: string;
    question_key: string;
    question_text: string;
    question_type: 'single' | 'multi' | 'text' | 'conditional';
    options: Array<{
        value: string;
        label: string;
        hasFollowUp?: boolean;
        followUpType?: string;
        followUpText?: string;
        hasTextInput?: boolean;
    }>;
    display_order: number;
    is_active: boolean;
}

// Get or create resignation for current user
export async function getResignation() {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
        return { success: false, error: 'Not authenticated' };
    }

    // Check for existing pending resignation (pick latest if multiple exist)
    const { data: existing, error: fetchError } = await supabase
        .from('resignations')
        .select('*')
        .eq('employee_id', user.id)
        .in('status', ['pending_exit_form', 'pending_interview', 'scheduled', 'locked', 'completed']) // Check relevant statuses
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

    if (fetchError) {
        return { success: false, error: fetchError.message };
    }

    if (existing) {
        return { success: true, data: existing };
    }

    return { success: false, error: 'No active resignation case found. Please contact HR.' };
}

// Get exit response (Actually returns the Form Snapshot from Resignation)
export async function getExitResponse(resignationId: string): Promise<{ success: boolean; data?: ExitFormData; error?: string }> {
    const adminClient = createAdminClient();

    // 1. Fetch form_snapshot from resignation
    const { data, error } = await adminClient
        .from('resignations')
        .select('form_snapshot, last_working_day')
        .eq('id', resignationId)
        .single();

    if (error) {
        return { success: false, error: 'Failed to load form data' };
    }

    let snapshot = data?.form_snapshot as ExitFormData || {};

    // 2. SELF-HEALING: If snapshot is empty or missing responses, reconstruct from granular results
    if (!snapshot.questionnaire_responses || Object.keys(snapshot.questionnaire_responses).length === 0) {
        const { data: results } = await adminClient
            .from('exit_questionnaires_result')
            .select(`
                response_text,
                selected_options,
                comment,
                questions (question_key)
            `)
            .eq('resignation_id', resignationId);

        if (results && results.length > 0) {
            const reconstructedResponses: QuestionnaireResponses = {};

            results.forEach((row: any) => {
                const key = row.questions?.question_key;
                if (!key) return;

                // Map to QuestionnaireResponses structure
                if (Array.isArray(row.selected_options)) {
                    reconstructedResponses[key as keyof QuestionnaireResponses] = row.selected_options as any;
                } else {
                    reconstructedResponses[key as keyof QuestionnaireResponses] = row.response_text as any;
                }

                // Restore comments/followers
                if (row.comment) {
                    if (key === 'benefits') reconstructedResponses.benefits_comment = row.comment;
                    if (key === 'workload') reconstructedResponses.workload_comment = row.comment;
                    if (key === 'recommendation') reconstructedResponses.recommendation_reason = row.comment;
                    if (key === 'why_more_desirable') reconstructedResponses.why_more_desirable_other = row.comment;
                    if (key === 'reason_for_leaving') reconstructedResponses.reason_for_leaving_country = row.comment;
                }
            });

            snapshot.questionnaire_responses = reconstructedResponses;
            // Also ensure resignation date is synced if missing from snapshot
            if (!snapshot.employee_details) snapshot.employee_details = {} as any;
            if (!snapshot.employee_details!.date_of_resignation) {
                snapshot.employee_details!.date_of_resignation = data.last_working_day || '';
            }
        }
    }

    return { success: true, data: snapshot };
}

// Save exit form progress
export async function saveExitForm(formData: ExitFormData) {
    const supabase = await createClient();

    // 0. Security & Lock Check
    const { data: resignation, error: resError } = await supabase
        .from('resignations')
        .select('status, scheduled_interview_date')
        .eq('id', formData.resignation_id)
        .single();

    if (resError || !resignation) return { success: false, error: 'Resignation not found' };
    if (resignation.status === 'locked') return { success: false, error: 'Form is locked for review.' };

    if (resignation.status === 'scheduled' && resignation.scheduled_interview_date) {
        const interviewDate = new Date(resignation.scheduled_interview_date);
        const lockThreshold = new Date(interviewDate.getTime() - (24 * 60 * 60 * 1000));
        if (new Date() >= lockThreshold) return { success: false, error: 'Form is locked (24h Policy).' };
    }

    // 1. Save Snapshot (Summary Data) to Resignation
    // This is the Source of Truth for the Form Wizard state
    // Use adminClient to bypass RLS issues on the resignation table for employees
    const adminClient = createAdminClient();
    const { error: snapshotError } = await adminClient
        .from('resignations')
        .update({
            form_snapshot: formData as any, // Cast to JSONB
            updated_at: new Date().toISOString()
        })
        .eq('id', formData.resignation_id);

    if (snapshotError) {
        console.error('Snapshot Save Error:', snapshotError);
        return { success: false, error: snapshotError.message };
    }

    // 1.5 Sync Employee Details to `employee_details` table
    // This ensures real users have their Personal Info populated (not just in form_snapshot)
    if (formData.employee_details) {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            const adminClient = createAdminClient();
            const ed = formData.employee_details;
            const { error: edError } = await adminClient
                .from('employee_details')
                .upsert({
                    id: user.id,
                    full_name: ed.employee_name || null,
                    employee_number: ed.employee_number || null,
                    department: ed.department || null,
                    current_position: ed.current_position || null,
                    position_when_hired: ed.position_when_hired || null,
                    date_hired: ed.date_hired || null,
                    immediate_superior: ed.intermediate_supervisor || null,
                    resignation_date: ed.date_of_resignation || null,
                }, { onConflict: 'id' });

            if (edError) {
                console.error('Employee Details Sync Error:', edError);
                // Non-blocking — snapshot is already saved
            }
        }
    }

    // 2. Sync Granular Answers to `exit_questionnaires_result` for Interviewer View (Phase 4)
    if (formData.questionnaire_responses) {
        // Fetch Question Map (Key -> ID)
        const { data: questions } = await supabase.from('questions').select('id, question_key');
        const questionMap = new Map(questions?.map(q => [q.question_key, q.id]));


        const updates = Object.entries(formData.questionnaire_responses).map(([key, value]) => {
            // Skip comments or non-question keys for now unless mapped
            if (key.endsWith('_comment') || key.endsWith('_reason') || key.endsWith('_other')) return null;

            const questionId = questionMap.get(key);
            if (!questionId) return null;

            // Find linked comment
            let comment = '';
            // Basic mapping logic
            if (key === 'benefits') comment = formData.questionnaire_responses?.benefits_comment || '';
            if (key === 'workload') comment = formData.questionnaire_responses?.workload_comment || '';
            if (key === 'recommendation') comment = formData.questionnaire_responses?.recommendation_reason || '';
            if (key === 'why_more_desirable') comment = formData.questionnaire_responses?.why_more_desirable_other || '';
            if (key === 'reason_for_leaving') comment = formData.questionnaire_responses?.reason_for_leaving_country || '';

            return {
                resignation_id: formData.resignation_id,
                question_id: questionId,
                response_text: Array.isArray(value) ? value.join(', ') : value,
                selected_options: Array.isArray(value) ? value : null,
                comment: comment, // Ensure comment is saved if column exists
                updated_at: new Date().toISOString()
            };
        }).filter(Boolean); // Filter nulls

        if (updates.length > 0) {
            // STRATEGY CHANGE: DELETE + INSERT (Admin Client)
            // Reason: RLS prevents standard users from reliably upserting/deleting exit_responses.
            // Admin Client bypasses RLS to ensure data persistence.
            const adminClient = createAdminClient();

            // 1. Delete existing responses for this resignation to prevent duplicates/conflicts
            const { error: deleteError } = await adminClient
                .from('exit_questionnaires_result')
                .delete()
                .eq('resignation_id', formData.resignation_id);

            if (deleteError) {
                console.error('Granular Sync (Delete) Error:', deleteError);
            }

            // 2. Insert new responses
            const { error: insertError } = await adminClient
                .from('exit_questionnaires_result')
                .insert(updates as any);

            if (insertError) {
                console.error('Granular Sync (Insert) Error:', insertError);
            }
        }
    }

    // Removed revalidatePath('/exit-form') to prevent UI loops during auto-save
    return { success: true };
}

// Submit final exit form
export async function submitExitForm(resignationId: string) {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: 'Not authenticated' };

    // Verify ownership (RLS on SELECT should work)
    const { data: existing, error: checkError } = await supabase
        .from('resignations')
        .select('id')
        .eq('id', resignationId)
        .single();

    if (checkError || !existing) return { success: false, error: 'Unauthorized' };

    // Update resignation status to pending_interview
    // NOTE: Removed the .eq('status', 'scheduled') guard — employees in 'pending_exit_form'
    // status would silently fail that check. We update regardless of current status
    // (ownership is already verified via the RLS SELECT above).
    const adminClient = createAdminClient();
    const { error: resignationError } = await adminClient
        .from('resignations')
        .update({ status: 'pending_interview' })
        .eq('id', resignationId)
        .not('status', 'in', '("locked","completed")');

    if (resignationError) {
        return { success: false, error: resignationError.message };
    }

    revalidatePath('/exit-form');
    return { success: true };
}

// Get all active questions
export async function getQuestions(): Promise<{ success: boolean; data?: Question[]; error?: string }> {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('questions')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

    if (error) {
        return { success: false, error: error.message };
    }

    return { success: true, data: data as Question[] };
}

// Get user profile for pre-filling employee info
export async function getUserProfile() {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
        return { success: false, error: 'Not authenticated' };
    }

    // Fetch Profile
    const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

    if (profileError) {
        return { success: false, error: profileError.message };
    }

    // Fetch Employee Details
    const { data: details, error: detailsError } = await supabase
        .from('employee_details')
        .select('*')
        .eq('id', user.id)
        .single();

    return {
        success: true,
        data: {
            ...profile,
            ...details
        }
    };
}
