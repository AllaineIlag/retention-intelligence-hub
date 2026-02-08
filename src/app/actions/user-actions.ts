'use server';

import { createClient } from '@/lib/supabase/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';

// Initialize Admin Client for User Management (Service Role)
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

export async function inviteInterviewer(email: string, fullName: string) {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
        return { error: 'Unauthorized' };
    }

    // Check if requester is Lead
    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

    if (profile?.role !== 'lead') {
        return { error: 'Insufficient permissions' };
    }

    // Use Admin Client to Invite User
    const { data, error } = await adminSupabase.auth.admin.inviteUserByEmail(email, {
        data: {
            role: 'interviewer',
            status: 'invited',
            full_name: fullName
        }
    });

    if (error) {
        console.error('Invite Error:', error);
        return { error: error.message };
    }

    return { success: true, user: data.user };
}

export async function toggleUserPermission(targetUserId: string, field: 'can_export_data', value: boolean) {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
        return { error: 'Unauthorized' };
    }

    // Check if requester is Lead
    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

    if (profile?.role !== 'lead') {
        return { error: 'Insufficient permissions' };
    }

    // Update Permission
    const { error } = await supabase
        .from('profiles')
        .update({ [field]: value })
        .eq('id', targetUserId);

    if (error) {
        return { error: error.message };
    }

    return { success: true };
}

export async function getTeamMembers() {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) return { error: 'Unauthorized' };

    const { data: profiles, error } = await supabase
        .from('profiles')
        .select('*')
        .in('role', ['lead', 'interviewer'])
        .order('created_at', { ascending: false });

    if (error) return { error: error.message };

    return { success: true, data: profiles };
}

export async function exportResignations() {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
        return { error: 'Unauthorized' };
    }

    // Check permissions
    const { data: profile } = await supabase
        .from('profiles')
        .select('can_export_data, role')
        .eq('id', user.id)
        .single();

    if (!profile) {
        return { error: 'Profile not found' };
    }

    if (profile.role !== 'lead' && !profile.can_export_data) {
        return { error: 'Export permission denied. Contact your administrator.' };
    }

    // Fetch Data
    const { data: resignations, error } = await supabase
        .from('resignations')
        .select(`
            *,
            profiles:employee_id (full_name, department, role)
        `)
        .order('created_at', { ascending: false });

    if (error) {
        return { error: error.message };
    }

    return { success: true, data: resignations };
}
