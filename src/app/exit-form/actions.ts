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
export async function getOrCreateResignation() {
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
        .eq('status', 'pending')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

    if (fetchError) {
        return { success: false, error: fetchError.message };
    }

    if (existing) {
        return { success: true, data: existing };
    }

    // Create new resignation
    const { data: newResignation, error: insertError } = await supabase
        .from('resignations')
        .insert({ employee_id: user.id, status: 'pending' })
        .select()
        .single();

    if (insertError) {
        return { success: false, error: insertError.message };
    }

    return { success: true, data: newResignation };
}

// Get exit response for a resignation
export async function getExitResponse(resignationId: string) {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('exit_responses')
        .select('*')
        .eq('resignation_id', resignationId)
        .maybeSingle();

    if (error) {
        return { success: false, error: error.message };
    }

    // If no response exists, create one
    if (!data) {
        const { data: newResponse, error: insertError } = await supabase
            .from('exit_responses')
            .insert({ resignation_id: resignationId })
            .select()
            .single();

        if (insertError) {
            return { success: false, error: insertError.message };
        }

        return { success: true, data: newResponse };
    }

    return { success: true, data };
}

// Save exit form progress (auto-save)
export async function saveExitForm(formData: ExitFormData) {
    const supabase = await createClient();

    const responseUpdate: Record<string, unknown> = {};

    // 0. Security & Lock Check
    const { data: resignation, error: resError } = await supabase
        .from('resignations')
        .select('status, scheduled_interview_date')
        .eq('id', formData.resignation_id)
        .single();

    if (resError) {
        return { success: false, error: resError.message };
    }

    if (resignation.status === 'locked') {
        return { success: false, error: 'Form is locked for review.' };
    }

    // Dynamic 24h Lock (in case cron hasn't run yet)
    if (resignation.status === 'scheduled' && resignation.scheduled_interview_date) {
        const interviewDate = new Date(resignation.scheduled_interview_date);
        const lockThreshold = new Date(interviewDate.getTime() - (24 * 60 * 60 * 1000)); // 24h before interview

        if (new Date() >= lockThreshold) {
            return { success: false, error: 'Form is locked for review (24h Policy).' };
        }
    }

    // 1. Update flattened employee details in exit_responses
    if (formData.employee_details) {
        Object.assign(responseUpdate, {
            employee_number: formData.employee_details.employee_number,
            employee_name: formData.employee_details.employee_name,
            date_hired: formData.employee_details.date_hired || null,
            position_when_hired: formData.employee_details.position_when_hired,
            current_position: formData.employee_details.current_position,
            department_supervisor: formData.employee_details.department_supervisor,
            department: formData.employee_details.department,
            date_of_resignation: formData.employee_details.date_of_resignation || null,
            // Keep JSON for backward compatibility/migration period if needed
            employee_details: formData.employee_details
        });
    }

    if (formData.additional_comments !== undefined) {
        responseUpdate.additional_comments = formData.additional_comments;
    }
    if (formData.consent_given !== undefined) {
        responseUpdate.consent_given = formData.consent_given;
    }

    // Perform the update on exit_responses
    if (Object.keys(responseUpdate).length > 0) {
        const { error: responseError } = await supabase
            .from('exit_responses')
            .update(responseUpdate)
            .eq('resignation_id', formData.resignation_id);

        if (responseError) {
            return { success: false, error: responseError.message };
        }
    }

    // 2. Update questionnaire results (one row per question)
    if (formData.questionnaire_responses) {
        const results = Object.entries(formData.questionnaire_responses).map(([key, value]) => {
            // Handle comments separately if they follow a pattern (e.g. benefits_comment)
            const isComment = key.endsWith('_comment') || key === 'recommendation_reason' || key === 'why_more_desirable_other';

            if (isComment) return null; // We'll handle pairing comments with their questions or skip for now

            // Pair main question with its comment if exists
            let commentValue = '';
            if (key === 'benefits') commentValue = formData.questionnaire_responses?.benefits_comment || '';
            if (key === 'workload') commentValue = formData.questionnaire_responses?.workload_comment || '';
            if (key === 'recommendation') commentValue = formData.questionnaire_responses?.recommendation_reason || '';
            if (key === 'why_more_desirable') commentValue = formData.questionnaire_responses?.why_more_desirable_other || '';
            if (key === 'reason_for_leaving') commentValue = formData.questionnaire_responses?.reason_for_leaving_country || '';

            return {
                resignation_id: formData.resignation_id,
                question_key: key,
                response_value: Array.isArray(value) ? value : value, // Keep as is, JSONB handles it
                comment: commentValue || null,
                updated_at: new Date().toISOString()
            };
        }).filter(Boolean);

        if (results.length > 0) {
            const { error: resultsError } = await supabase
                .from('exit_questionnaire_results')
                .upsert(results, { onConflict: 'resignation_id,question_key' });

            if (resultsError) {
                console.error("Results upsert error:", resultsError);
                // We're not returning error here to avoid blocking if the main update succeeded
            }
        }

        // Also update the legacy JSON blob for now
        await supabase
            .from('exit_responses')
            .update({ questionnaire_responses: formData.questionnaire_responses })
            .eq('resignation_id', formData.resignation_id);
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
