'use server'

import { createClient } from '@/lib/supabase/server'
// import { Database } from '@/lib/database.types'
// import { headers } from 'next/headers'

export async function getOrCreateResignation() {
    const supabase = await createClient()

    // Authenticate user
    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        throw new Error('User not authenticated')
    }

    // Check for existing pending resignation
    const { data: existingResignation, error: fetchError } = await supabase
        .from('resignations')
        .select('*')
        .eq('employee_id', user.id)
        .eq('status', 'pending')
        .single()

    if (fetchError && fetchError.code !== 'PGRST116') {
        // PGRST116 is code for "The result contains 0 rows"
        throw new Error(`Failed to fetch resignation: ${fetchError.message}`)
    }

    if (existingResignation) {
        return existingResignation
    }

    // Create new resignation if none exists
    const { data: newResignation, error: insertError } = await supabase
        .from('resignations')
        .insert({
            employee_id: user.id,
            status: 'pending',
        })
        .select()
        .single()

    if (insertError) {
        throw new Error(`Failed to create resignation: ${insertError.message}`)
    }

    return newResignation
}

export async function getExitResponse(resignationId: string) {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('exit_responses')
        .select('*')
        .eq('resignation_id', resignationId)

    if (error) {
        throw new Error(`Failed to fetch exit responses: ${error.message}`)
    }

    return data
}

export async function getReferenceData() {
    // TODO: In a real app, these would come from database tables
    return {
        positions: [
            'Software Engineer',
            'Product Manager',
            'Designer',
            'Data Scientist',
            'Sales Representative',
            'Customer Support Specialist',
            'HR Specialist',
            'Marketing Specialist',
        ],
        departments: [
            'Engineering',
            'Product',
            'Design',
            'Data',
            'Sales',
            'Customer Support',
            'Human Resources',
            'Marketing',
        ],
        supervisors: [
            'Caitlyn Kiramman',
            'Jayce Talis',
            'Viktor',
            'Mel Medarda',
            'Ambessa Medarda',
        ],
    }
}

export async function getQuestions() {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('questions')
        .select('*')
        .eq('is_active', true)
        .order('category', { ascending: true })

    if (error) {
        throw new Error(`Failed to fetch questions: ${error.message}`)
    }

    return data
}

export async function getResignationReasons() {
    return [
        'Found a better opportunity',
        'Salary/Benefits',
        'Work-Life Balance',
        'Management/Leadership',
        'Company Culture',
        'Career Growth/Development',
        'Relocation',
        'Health/Personal Reasons',
        'Retirement',
        'Other',
    ]
}

type SaveExitFormPayload = {
    resignationId: string
    exitDate?: string
    reason?: string
    responses: {
        questionId: string
        responseText?: string
        rating?: number
        selectedOptions?: string[]
    }[]
}

export async function saveExitForm(payload: SaveExitFormPayload) {
    const supabase = await createClient()

    // Authenticate user
    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        throw new Error('User not authenticated')
    }

    // 1. Update resignation details
    const { error: resignationError } = await supabase
        .from('resignations')
        .update({
            exit_date: payload.exitDate,
            reason: payload.reason,
        })
        .eq('id', payload.resignationId)
        .eq('employee_id', user.id) // Security check: ensure user owns resignation

    if (resignationError) {
        throw new Error(`Failed to update resignation: ${resignationError.message}`)
    }

    // 2. Upsert responses (Delete then Insert strategy)
    for (const response of payload.responses) {
        // Delete existing response for this question to avoid duplicates
        // (since we don't have a unique constraint on resignation_id + question_id yet)
        // Note: In a real prod app, adding a unique constraint and using upsert() is better.
        // However, clean delete-insert is robust for this phase.
        const { error: _deleteError } = await supabase
            .from('exit_responses')
            .delete()
            .eq('resignation_id', payload.resignationId)
            .eq('question_id', response.questionId)

        // We don't strictly check deleteError because if it doesn't exist, that's fine.
        // But if it's a permission error, the insert below will likely fail too.

        const { error: insertError } = await supabase
            .from('exit_responses')
            .insert({
                resignation_id: payload.resignationId,
                question_id: response.questionId,
                response_text: response.responseText,
                rating: response.rating,
                selected_options: response.selectedOptions,
            })

        if (insertError) {
            throw new Error(`Failed to save response for question ${response.questionId}: ${insertError.message}`)
        }
    }

    return { success: true }
}

export async function submitExitForm(resignationId: string) {
    const supabase = await createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        throw new Error('User not authenticated')
    }

    // Verify existence and ownership
    const { data: resignation, error: fetchError } = await supabase
        .from('resignations')
        .select('id')
        .eq('id', resignationId)
        .eq('employee_id', user.id)
        .single()

    if (fetchError || !resignation) {
        throw new Error('Resignation not found or access denied')
    }

    // For now, submitting just means we are done editing.
    // The status remains 'pending' until an interviewer schedules/approves it.
    // We could update a 'submitted_at' timestamp here if we had one.

    return { success: true }
}
