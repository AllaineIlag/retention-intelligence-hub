'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export type ExitFormData = {
    // Tab 1: Employee Info
    employee_number: string;
    employee_name: string;
    date_hired: string;
    position_when_hired: string;
    current_position: string;
    department: string;
    supervisor: string;
    date_of_resignation: string;

    // Tab 2: Questionnaire
    reasons_for_leaving: string[];
    destination_country?: string;
    reason_more_desirable?: string[];
    other_reason_detail?: string;
    career_growth_rating: string;
    pay_rate_rating: string;
    benefits_rating: string;
    workload_rating: string;
    would_recommend: boolean;

    // Tab 3: Privacy
    privacy_consent: boolean;
};

// Get or create resignation for current user
export async function getOrCreateResignation() {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return { error: 'Not authenticated' };
    }

    // Check for existing pending resignation
    const { data: existing } = await supabase
        .from('resignations')
        .select('*')
        .eq('employee_id', user.id)
        .eq('status', 'pending')
        .single();

    if (existing) {
        return { data: existing };
    }

    // Create new resignation
    const { data: newResignation, error } = await supabase
        .from('resignations')
        .insert({ employee_id: user.id, status: 'pending' })
        .select()
        .single();

    if (error) {
        return { error: error.message };
    }

    return { data: newResignation };
}

// Get existing exit response for a resignation
export async function getExitResponse(resignationId: string) {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('exit_responses')
        .select('*')
        .eq('resignation_id', resignationId)
        .single();

    if (error && error.code !== 'PGRST116') {
        // PGRST116 = not found, which is ok
        return { error: error.message };
    }

    return { data };
}

// Save exit form data (create or update)
export async function saveExitForm(resignationId: string, formData: ExitFormData) {
    const supabase = await createClient();

    // Check if response exists
    const { data: existing } = await supabase
        .from('exit_responses')
        .select('id')
        .eq('resignation_id', resignationId)
        .single();

    const payload = {
        resignation_id: resignationId,
        ...formData,
        privacy_consent_at: formData.privacy_consent ? new Date().toISOString() : null,
    };

    if (existing) {
        // Update existing
        const { error } = await supabase
            .from('exit_responses')
            .update(payload)
            .eq('id', existing.id);

        if (error) {
            return { error: error.message };
        }
    } else {
        // Insert new
        const { error } = await supabase.from('exit_responses').insert(payload);

        if (error) {
            return { error: error.message };
        }
    }

    return { success: true };
}

// Submit the exit form (marks as complete)
export async function submitExitForm(
    resignationId: string,
    formData: ExitFormData
): Promise<{ error?: string; success?: boolean }> {
    const supabase = await createClient();

    // Save the final data
    const saveResult = await saveExitForm(resignationId, formData);
    if (saveResult.error) {
        return { error: saveResult.error };
    }

    // Update exit response with submitted timestamp
    const { error: updateError } = await supabase
        .from('exit_responses')
        .update({ submitted_at: new Date().toISOString() })
        .eq('resignation_id', resignationId);

    if (updateError) {
        return { error: updateError.message };
    }

    // Update resignation status
    const { error: resignationError } = await supabase
        .from('resignations')
        .update({ status: 'completed' })
        .eq('id', resignationId);

    if (resignationError) {
        return { error: resignationError.message };
    }

    revalidatePath('/exit-form');
    return { success: true };
}

// Sample data for dropdowns
export const SAMPLE_POSITIONS = [
    'Software Engineer',
    'Senior Software Engineer',
    'Product Manager',
    'UX Designer',
    'Data Analyst',
    'Marketing Specialist',
    'HR Coordinator',
    'Finance Analyst',
    'Customer Support',
    'Sales Representative',
];

export const SAMPLE_DEPARTMENTS = [
    'Engineering',
    'Product',
    'Design',
    'Marketing',
    'Human Resources',
    'Finance',
    'Customer Success',
    'Sales',
    'Operations',
];

export const SAMPLE_SUPERVISORS = [
    'John Smith',
    'Jane Doe',
    'Robert Johnson',
    'Emily Davis',
    'Michael Wilson',
];

export const REASONS_FOR_LEAVING = [
    { value: 'another_job_local', label: 'Another Job (Local)' },
    { value: 'another_job_abroad', label: 'Another Job (Abroad)' },
    { value: 'business', label: 'Business' },
    { value: 'practice_profession', label: 'Practice Profession' },
    { value: 'continue_study', label: 'Continue to Study' },
    { value: 'health', label: 'Health' },
    { value: 'personal_reason', label: 'Personal Reason' },
    { value: 'family_reasons', label: 'Family Reasons' },
    { value: 'differences_coemployees', label: 'Differences with Co-Employees' },
    { value: 'differences_superior', label: 'Differences with Superior' },
    { value: 'dislike_procedure', label: 'Dislike Company Procedure' },
    { value: 'other', label: 'Other' },
];

export const REASONS_MORE_DESIRABLE = [
    { value: 'higher_salary', label: 'Higher Salary' },
    { value: 'better_benefits', label: 'Better Benefits' },
    { value: 'career_advancement', label: 'Career Advancement' },
    { value: 'convenient_location', label: 'More Convenient Location' },
    { value: 'better_culture', label: 'Better Work Culture' },
    { value: 'work_life_balance', label: 'Better Work-Life Balance' },
    { value: 'other', label: 'Other' },
];

export const CAREER_GROWTH_OPTIONS = [
    { value: 'very_good', label: 'Very good chance' },
    { value: 'good', label: 'Good chances depending on performance' },
    { value: 'little', label: 'Little chances but still hopeful' },
    { value: 'very_little', label: 'Very little chances' },
    { value: 'none', label: 'No chances' },
];

export const PAY_RATE_OPTIONS = [
    { value: 'very_compensating', label: 'Very compensating' },
    { value: 'fair_enough', label: 'Fair enough' },
    { value: 'bit_low', label: 'A bit low although acceptable' },
    { value: 'not_commensurate', label: 'Not commensurate to job/load' },
    { value: 'very_low', label: 'Very low' },
];

export const BENEFITS_OPTIONS = [
    { value: 'very_adequate', label: 'Very adequate' },
    { value: 'adequate', label: 'Adequate' },
    { value: 'inadequate', label: 'Inadequate' },
];

export const WORKLOAD_OPTIONS = [
    { value: 'minimal', label: 'Minimal work' },
    { value: 'just_enough', label: 'Just enough load' },
    { value: 'too_much', label: 'Too much work' },
];

export const COUNTRIES = [
    'United States',
    'Canada',
    'United Kingdom',
    'Australia',
    'Singapore',
    'Japan',
    'Germany',
    'United Arab Emirates',
    'Saudi Arabia',
    'Qatar',
    'Other',
];
