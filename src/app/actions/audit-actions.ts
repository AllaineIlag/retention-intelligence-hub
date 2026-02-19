'use server';

import { createClient } from '@/lib/supabase/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';
import { isWithinInterval, parseISO } from 'date-fns';

// Initialize Admin Client for Audit Logging (Service Role)
const adminSupabase = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    }
);

export type AuditFilters = {
    action?: string;
    userId?: string;
    startDate?: Date;
    endDate?: Date;
};

export type AuditLog = {
    id: string;
    created_at: string;
    user_id: string | null;
    action: string;
    entity_table: string;
    entity_id: string;
    details: Record<string, unknown> | null;
    ip_address: string | null;
    user_email?: string;
};

export type CorrectionLog = {
    id: string;
    resignation_id: string;
    question_id: string;
    original_answer: string;
    corrected_answer: string;
    interviewer_note: string | null;
    created_at: string;
    employee_name: string;
    question_text: string;
    resignation_status?: string;
};


export async function logAudit({
    action,
    userId,
    entityTable,
    entityId,
    details,
    ipAddress
}: {
    action: string;
    userId: string | null; // Nullable for system actions or unauthenticated (though rare)
    entityTable: string;
    entityId: string;
    details?: Record<string, any>;
    ipAddress?: string;
}) {
    try {
        const { error } = await adminSupabase
            .from('audit_logs')
            .insert({
                action,
                user_id: userId,
                entity_table: entityTable,
                entity_id: entityId,
                details: details || {},
                ip_address: ipAddress || null,
                created_at: new Date().toISOString()
            });

        if (error) {
            console.error('Failed to log audit entry:', error);
            // We usually don't throw here to avoid blocking the main action,
            // but we log the error.
            return { error: error.message };
        }

        return { success: true };
    } catch (err) {
        console.error('Unexpected error logging audit:', err);
        return { error: 'Internal Server Error' };
    }
}

export async function getAuditLogs(filters: AuditFilters) {
    const supabase = await createClient();

    // Build query
    let query = supabase
        .from('audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

    // Apply filters
    if (filters.action && filters.action !== 'all') {
        query = query.eq('action', filters.action);
    }
    if (filters.userId && filters.userId !== 'all') {
        query = query.eq('user_id', filters.userId);
    }

    const { data: logs, error } = await query;

    if (error) {
        console.error('Error fetching audit logs:', error);
        return { error: error.message };
    }

    // Client-side date filtering (if needed)
    let filtered = logs || [];
    if (filters.startDate && filters.endDate) {
        filtered = filtered.filter(log => {
            const date = parseISO(log.created_at);
            return isWithinInterval(date, {
                start: filters.startDate!,
                end: filters.endDate!
            });
        });
    }

    // Enrich with user emails
    const userIds = [...new Set(filtered.map(l => l.user_id).filter(Boolean))];
    if (userIds.length > 0) {
        const { data: profiles } = await supabase
            .from('profiles')
            .select('id, email')
            .in('id', userIds as string[]);

        const emailMap = new Map(profiles?.map(p => [p.id, p.email]) || []);

        filtered = filtered.map(log => ({
            ...log,
            user_email: log.user_id ? emailMap.get(log.user_id) : 'System'
        }));
    }

    return { success: true, data: filtered as AuditLog[] };
}

export async function getCorrectionHistory() {
    const supabase = await createClient();

    const { data: corrections, error } = await supabase
        .from('exit_questionnaires_result')
        .select(`
            id,
            resignation_id,
            question_id,
            original_answer,
            corrected_answer,
            interviewer_note,
            created_at,
            resignations!resignation_id (
                status,
                profiles!employee_id (
                    full_name
                )
            ),
            questions!question_id (
                *
            )
        `)
        .eq('is_corrected', true)
        .order('created_at', { ascending: false })
        .limit(50);

    if (error) {
        console.error('Error fetching corrections:', error);
        return { error: error.message };
    }

    // Transform to flat structure
    const transformed = corrections?.map(c => ({
        id: c.id,
        resignation_id: c.resignation_id,
        question_id: c.question_id,
        original_answer: c.original_answer || '',
        corrected_answer: c.corrected_answer || '',
        interviewer_note: c.interviewer_note,
        created_at: c.created_at,
        // @ts-ignore - Supabase nested join types
        employee_name: c.resignations?.profiles?.full_name || 'Unknown',
        // @ts-ignore
        question_text: c.questions?.text || c.questions?.question_text || 'Unknown Question',
        // @ts-ignore
        resignation_status: c.resignations?.status || 'unknown'
    })) || [];

    return { success: true, data: transformed as CorrectionLog[] };
}
