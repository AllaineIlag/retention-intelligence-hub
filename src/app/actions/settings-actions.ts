'use server';

import { createClient } from '@/lib/supabase/server';

export type ProfileData = {
    full_name: string | null;
    email: string;
    role: string;
    email_notifications: boolean | null;
    notification_frequency: string | null;
};

export async function getProfile() {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
        return { error: 'Unauthorized' };
    }

    const { data: profile, error } = await supabase
        .from('profiles')
        .select(`
            email, 
            role,
            admin_details (
                full_name,
                email_notifications,
                notification_frequency
            )
        `)
        .eq('id', user.id)
        .single();

    if (error) {
        return { error: error.message };
    }

    const flattened: ProfileData = {
        email: profile.email,
        role: profile.role,
        full_name: (profile as any).admin_details?.full_name || null,
        email_notifications: (profile as any).admin_details?.email_notifications || false,
        notification_frequency: (profile as any).admin_details?.notification_frequency || 'daily'
    };

    return { success: true, data: flattened };
}


export async function updateProfile(fullName: string) {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
        return { error: 'Unauthorized' };
    }

    const { error } = await supabase
        .from('admin_details')
        .update({
            full_name: fullName,
            updated_at: new Date().toISOString()
        })
        .eq('id', user.id);


    if (error) {
        return { error: error.message };
    }

    return { success: true };
}

export async function updateNotificationPreferences(
    emailNotifications: boolean,
    frequency: 'instant' | 'daily' | 'weekly'
) {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
        return { error: 'Unauthorized' };
    }

    const { error } = await supabase
        .from('admin_details')
        .update({
            email_notifications: emailNotifications,
            notification_frequency: frequency,
            updated_at: new Date().toISOString()
        })
        .eq('id', user.id);


    if (error) {
        return { error: error.message };
    }

    return { success: true };
}
