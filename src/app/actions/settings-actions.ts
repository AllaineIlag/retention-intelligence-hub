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
        .select('full_name, email, role, email_notifications, notification_frequency')
        .eq('id', user.id)
        .single();

    if (error) {
        return { error: error.message };
    }

    return { success: true, data: profile as ProfileData };
}

export async function updateProfile(fullName: string) {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
        return { error: 'Unauthorized' };
    }

    const { error } = await supabase
        .from('profiles')
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
        .from('profiles')
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
