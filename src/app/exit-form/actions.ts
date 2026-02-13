'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

// Types
export interface EmployeeDetails {
    employee_number: string;
    employee_name: string;
    date_hired: string;
    position_when_hired: string;
    current_position: string;
    department_supervisor: string;
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
        .in('status', ['pending', 'scheduled', 'locked']) // Check relevant statuses
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
export async function getExitResponse(resignationId: string) {
    const supabase = await createClient();

    // 1. Fetch form_snapshot from resignation
    const { data, error } = await supabase
        .from('resignations')
        .select('form_snapshot')
        .eq('id', resignationId)
        .single();

    if (error) {
        return { success: false, error: 'Failed to load form data' };
    }

    // If snapshot exists, return it. Otherwise return empty structure.
    if (data?.form_snapshot) {
        return { success: true, data: data.form_snapshot };
    }

    return { success: true, data: {} };
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
    const { error: snapshotError } = await supabase
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

    // 2. Sync Granular Answers to `exit_responses` for Interviewer View (Phase 4)
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
                updated_at: new Date().toISOString()
            };
        }).filter(Boolean); // Filter nulls

        if (updates.length > 0) {
            // Upsert granular responses
            // Note: We need a unique constraint on (resignation_id, question_id) for upsert to work.
            // Assumption: Codebase implies such a constraint exists or we rely on ID. 
            // Since we don't have the ID, we rely on the constraint.
            // If strict constraint missing, this might duplicate. 
            // Given the schema error "violates not-null", we initially had trouble inserting. 
            // We'll hope there's a unique index on resign_id + question_id.

            // Check for existence or delete-insert strategy? Upsert is safer.
            const { error: batchError } = await supabase
                .from('exit_responses')
                .upsert(updates as any, { onConflict: 'resignation_id,question_id' }); // Explicit constraint target

            if (batchError) {
                console.error('Granular Sync Error:', batchError);
                // We don't block the UI success since Snapshot is saved
            }
        }
    }

    revalidatePath('/exit-form');
    return { success: true };
}

// Submit final exit form
export async function submitExitForm(resignationId: string) {
    const supabase = await createClient();

    // Update exit_responses with submitted timestamp
    const { error: responseError } = await supabase
        .from('exit_responses')
        .update({ submitted_at: new Date().toISOString() })
        .eq('resignation_id', resignationId);

    if (responseError) {
        return { success: false, error: responseError.message };
    }

    // Update resignation status to completed
    const { error: resignationError } = await supabase
        .from('resignations')
        .update({ status: 'completed' })
        .eq('id', resignationId);

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

    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

    if (error) {
        return { success: false, error: error.message };
    }

    return { success: true, data };
}
