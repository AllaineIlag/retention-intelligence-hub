'use server';

import { createClient } from '@/lib/supabase/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';
import { EMAIL_CONFIG } from '@/constants/enums';
import { logAudit } from './audit-actions';

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

    // Log Audit
    await logAudit({
        action: 'PERMISSION_UPDATED',
        userId: user.id,
        entityTable: 'admin_details',
        entityId: targetUserId,
        details: { field, value, target_user_id: targetUserId }
    });

    return { success: true };
}

export async function getTeamMembers() {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) return { error: 'Unauthorized' };

    // LEFT join (no !inner) so interviewers without admin_details rows are included
    const { data: profiles, error } = await supabase
        .from('profiles')
        .select(`
            *,
            admin_details (
                can_export_data
            )
        `)
        .in('role', ['lead', 'interviewer'])
        .eq('status', 'active')
        .order('created_at', { ascending: false });

    if (error) return { error: error.message };

    // Flatten — admin_details may be null for interviewers without a row
    const flattened = profiles?.map(p => ({
        ...p,
        can_export_data: (p.admin_details as any)?.can_export_data ?? false,
        admin_details: undefined,
    }));

    return { success: true, data: flattened };
}

export async function getDeclinedAccounts() {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) return { error: 'Unauthorized' };

    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

    if (profile?.role !== 'lead') return { error: 'Unauthorized' };

    const { data: accounts, error } = await supabase
        .from('profiles')
        .select('id, full_name, email, role, status, avatar_url, created_at')
        .eq('status', 'rejected')
        .eq('role', 'interviewer')
        .order('created_at', { ascending: false });

    if (error) return { error: error.message };

    return { success: true, data: accounts };
}

export async function getRecentInvites() {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) return { error: 'Unauthorized' };

    // Simplified: Now we can just query profiles directly since full_name/avatar_url are in the schema
    const { data: profiles, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('status', 'pending') // Changed from 'invited' to 'pending'
        .order('created_at', { ascending: false });

    if (error) return { error: error.message }; // Changed from `return []` to `return { error: error.message }` for consistency

    return { success: true, data: profiles }; // Changed from `return profiles` to `return { success: true, data: profiles }` for consistency
}

export async function getRecentAccounts() {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) return { error: 'Unauthorized' };

    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

    if (profile?.role !== 'lead') return { error: 'Unauthorized' };

    const { data: accounts, error } = await supabase
        .from('profiles')
        .select('id, full_name, email, role, status, avatar_url, created_at')
        .neq('status', 'pending')
        .eq('role', 'interviewer')
        .order('created_at', { ascending: false })
        .limit(5);

    if (error) return { error: error.message };

    return { success: true, data: accounts };
}

export async function getAllAccounts() {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) return { error: 'Unauthorized' };

    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

    if (profile?.role !== 'lead') return { error: 'Unauthorized' };

    // Return ALL non-pending interviewers (active AND rejected)
    const { data: accounts, error } = await supabase
        .from('profiles')
        .select('id, full_name, email, role, status, avatar_url, created_at')
        .neq('status', 'pending')
        .eq('role', 'interviewer')
        .order('created_at', { ascending: false });

    if (error) return { error: error.message };

    return { success: true, data: accounts };
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
        .select('id, email, role, status, created_at')
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

    if (error) return { error: error.message };

    // Enrich with auth.users metadata for display names/avatars
    const enrichedUsers = await Promise.all(
        (users || []).map(async (p) => {
            const { data: { user: authUser } } = await adminSupabase.auth.admin.getUserById(p.id);
            return {
                ...p,
                full_name: authUser?.user_metadata?.full_name || p.email?.split('@')[0] || 'Unknown',
                avatar_url: authUser?.user_metadata?.avatar_url || null,
            };
        })
    );

    return { success: true, data: enrichedUsers };
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

    // Get the target user's info from auth (not profiles, which lacks full_name)
    // Get the target user's info directly from profiles
    const { data: targetUser } = await supabase
        .from('profiles')
        .select('email, full_name')
        .eq('id', userId)
        .single();

    const targetEmail = targetUser?.email;
    const targetName = targetUser?.full_name;

    // Update status in profiles
    const { error } = await supabase
        .from('profiles')
        .update({ status: 'active' })
        .eq('id', userId);

    if (error) return { error: error.message };

    // Log Audit
    await logAudit({
        action: 'USER_APPROVED',
        userId: user.id,
        entityTable: 'profiles',
        entityId: userId,
        details: { target_email: targetEmail, approved_by: user.email }
    });

    // Send approval email via Resend
    if (targetEmail) {
        try {
            const { Resend } = await import('resend');
            const resend = new Resend(process.env.RESEND_API_KEY);

            const siteUrl = process.env.DOMAIN_SITE_URL || process.env.NEXT_PUBLIC_SITE_URL || 'https://www.retentionhub.cloud';

            await resend.emails.send({
                from: process.env.RESEND_FROM_EMAIL || EMAIL_CONFIG.FROM,
                to: targetEmail,
                subject: 'Access Approved — Retention Intelligence Hub',
                html: `
                    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 20px;">
                        <div style="background: #0f0f11; border-radius: 16px; padding: 40px; border: 1px solid rgba(255,255,255,0.1);">
                            <div style="text-align: center; margin-bottom: 24px;">
                                <div style="display: inline-block; background: linear-gradient(135deg, rgba(99,102,241,0.2), rgba(168,85,247,0.2)); border-radius: 12px; padding: 12px; border: 1px solid rgba(255,255,255,0.1);">
                                    <span style="font-size: 24px;">✅</span>
                                </div>
                            </div>
                            <h1 style="color: #ffffff; font-size: 22px; font-weight: 700; text-align: center; margin: 0 0 12px 0;">
                                Access Approved
                            </h1>
                            <p style="color: #a1a1aa; font-size: 14px; text-align: center; line-height: 1.6; margin: 0 0 32px 0;">
                                Hi ${targetName || 'there'},<br/>
                                Your access to the Retention Intelligence Hub has been approved. You can now sign in and access the dashboard.
                            </p>
                            <div style="text-align: center;">
                                <a href="${siteUrl}/dashboard" style="display: inline-block; background: #6366f1; color: #ffffff; text-decoration: none; padding: 12px 32px; border-radius: 8px; font-weight: 600; font-size: 14px;">
                                    Sign In Now
                                </a>
                            </div>
                            <p style="color: #52525b; font-size: 12px; text-align: center; margin-top: 32px;">
                                Retention Intelligence Hub
                            </p>
                        </div>
                    </div>
                `,
            });
            console.log('[Gatekeeper] Approval email sent to:', targetEmail);
        } catch (emailErr) {
            // Don't fail the approval if email fails — log and continue
            console.error('[Gatekeeper] Failed to send approval email:', emailErr);
        }
    }

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

    // Get target user's info for audit log and email
    const { data: targetUser } = await supabase
        .from('profiles')
        .select('email, full_name')
        .eq('id', userId)
        .single();

    // SOFT REJECT: Brand as 'rejected' — DO NOT delete the auth account.
    // This prevents the user from re-registering and cycling back into pending.
    const { error: updateError } = await supabase
        .from('profiles')
        .update({ status: 'rejected' })
        .eq('id', userId);

    if (updateError) return { error: updateError.message };

    // Log Audit
    await logAudit({
        action: 'USER_REJECTED',
        userId: user.id,
        entityTable: 'profiles',
        entityId: userId,
        details: { target_email: targetUser?.email, rejected_by: user.email }
    });

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
            company_directory (
                full_name, 
                department,
                position,
                date_hired,
                intermediate_supervisor,
                business_unit
            ),
            profiles ( email )
        `)
        .order('created_at', { ascending: false });


    if (error) {
        return { error: error.message };
    }

    return { success: true, data: resignations };
}
