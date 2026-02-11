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
        .from('admin_details')
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
        .select(`
            *,
            admin_details!inner (
                full_name,
                can_export_data,
                email_notifications,
                notification_frequency
            )
        `)
        .in('role', ['lead', 'interviewer'])
        .order('created_at', { ascending: false });

    if (error) return { error: error.message };

    // Flatten for UI if needed, or keep nested. Most UI expects flat.
    const flattened = profiles?.map(p => ({
        ...p,
        ...p.admin_details
    }));

    return { success: true, data: flattened };

}

export async function getRecentInvites() {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) return { error: 'Unauthorized' };

    const { data: invites, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('status', 'invited')
        .order('created_at', { ascending: false });

    if (error) return { error: error.message };

    return { success: true, data: invites };
}

export async function getRecentAccounts() {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) return { error: 'Unauthorized' };

    // Check permissions
    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

    if (profile?.role !== 'lead') return { error: 'Unauthorized' };

    const { data: accounts, error } = await supabase
        .from('profiles')
        .select(`
            *,
            admin_details (
                full_name
            )
        `)
        .order('created_at', { ascending: false })
        .limit(5);

    if (error) return { error: error.message };

    // Flatten logic
    const flattened = accounts?.map(p => ({
        ...p,
        full_name: p.admin_details?.full_name || 'Unknown'
    }));

    return { success: true, data: flattened };
}

export async function getPendingUserCount() {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) return 0;

    const { count, error } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');

    if (error) {
        console.error('Error fetching pending count:', JSON.stringify(error, null, 2));
        return 0;
    }

    return count || 0;
}

export async function getPendingUsers() {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) return { error: 'Unauthorized' };

    // Check permissions
    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

    if (profile?.role !== 'lead') return { error: 'Unauthorized' };

    const { data: users, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

    if (error) return { error: error.message };

    return { success: true, data: users };
}

export async function approveUser(userId: string) {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) return { error: 'Unauthorized' };

    // Check permissions
    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

    if (profile?.role !== 'lead') return { error: 'Unauthorized' };

    // Update status in profiles
    const { error } = await supabase
        .from('profiles')
        .update({ status: 'active' })
        .eq('id', userId);

    if (error) return { error: error.message };

    return { success: true };
}

export async function rejectUser(userId: string) {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) return { error: 'Unauthorized' };

    // Check permissions
    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

    if (profile?.role !== 'lead') return { error: 'Unauthorized' };

    // Delete user from Auth (hard delete)
    const { error } = await adminSupabase.auth.admin.deleteUser(userId);

    if (error) return { error: error.message };

    return { success: true };
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
        .select(`
            role,
            admin_details (
                can_export_data
            )
        `)
        .eq('id', user.id)
        .single();


    if (!profile) {
        return { error: 'Profile not found' };
    }

    if (profile.role !== 'lead' && !(profile as any).admin_details?.can_export_data) {
        return { error: 'Export permission denied. Contact your administrator.' };
    }


    // Fetch Data
    const { data: resignations, error } = await supabase
        .from('resignations')
        .select(`
            *,
            employee_details:employee_id (
                full_name, 
                department,
                employee_number,
                current_position,
                date_hired,
                immediate_superior,
                resignation_date
            )
        `)
        .order('created_at', { ascending: false });


    if (error) {
        return { error: error.message };
    }

    return { success: true, data: resignations };
}
