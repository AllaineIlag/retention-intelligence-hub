'use server';

import { createClient } from '@/lib/supabase/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';

export type NotificationType = 'info' | 'warning' | 'success' | 'error';

export type AppNotification = {
    id: string;
    user_id: string;
    title: string;
    message: string;
    type: NotificationType;
    link?: string;
    is_read: boolean;
    created_at: string;
};

// Initialize Admin Client for System Notifications (Service Role)
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

/**
 * Creates a system notification for a specific user.
 * Uses Service Role to bypass RLS (as actions are often triggered by other users).
 */
export async function createNotification({
    userId,
    title,
    message,
    type,
    link
}: {
    userId: string;
    title: string;
    message: string;
    type: NotificationType;
    link?: string;
}) {
    try {
        const { error } = await adminSupabase
            .from('notifications')
            .insert({
                user_id: userId,
                title,
                message,
                type,
                link,
                is_read: false
            });

        if (error) {
            console.error('Failed to create notification:', error);
            return { error: error.message };
        }

        return { success: true };
    } catch (err) {
        console.error('Unexpected error creating notification:', err);
        return { error: 'Internal Server Error' };
    }
}


/**
 * Broadcasts a notification to all users with the 'lead' role.
 */
export async function notifyLeads({
    title,
    message,
    type,
    link
}: {
    title: string;
    message: string;
    type: NotificationType;
    link?: string;
}) {
    try {
        // Fetch all leads
        const { data: leads, error: leadsError } = await adminSupabase
            .from('profiles')
            .select('id')
            .eq('role', 'lead');

        if (leadsError || !leads) {
            console.error('Failed to fetch leads for notification:', leadsError);
            return { error: 'Failed to fetch leads' };
        }

        if (leads.length === 0) return { success: true };

        // Prepare notifications for all leads
        const notifications = leads.map(lead => ({
            user_id: lead.id,
            title,
            message,
            type,
            link,
            is_read: false
        }));

        const { error } = await adminSupabase
            .from('notifications')
            .insert(notifications);

        if (error) {
            console.error('Failed to broadcast notification to leads:', error);
            return { error: error.message };
        }

        return { success: true };
    } catch (err) {
        console.error('Unexpected error broadcasting to leads:', err);
        return { error: 'Internal Server Error' };
    }
}

export async function getNotifications() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { error: 'Unauthorized' };

    const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

    if (error) {
        console.error('Error fetching notifications:', error);
        return { error: error.message };
    }

    return { success: true, data: data as AppNotification[] };
}

export async function markAsRead(notificationId: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { error: 'Unauthorized' };

    const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId)
        .eq('user_id', user.id);

    if (error) return { error: error.message };

    return { success: true };
}

export async function markAllAsRead() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { error: 'Unauthorized' };

    const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', user.id)
        .eq('is_read', false);

    if (error) return { error: error.message };

    return { success: true };
}
