import { SettingsPageClient } from './SettingsPageClient';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { getProfile } from '@/app/actions/settings-actions';

export default async function SettingsPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) redirect('/login');

    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

    // Only Lead and Interviewer can access settings
    if (profile?.role === 'employee') {
        redirect('/exit-form');
    }

    // Fetch profile data
    const profileResult = await getProfile();
    if (profileResult.error || !profileResult.data) {
        redirect('/dashboard');
    }

    return <SettingsPageClient profile={profileResult.data} />;
}
