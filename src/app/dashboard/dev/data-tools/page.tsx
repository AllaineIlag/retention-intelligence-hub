
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import DevToolsClient from './DevToolsClient';

export default async function DevToolsPage() {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
    }

    // Check user role from profiles table (more reliable than metadata)
    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

    if (profile?.role !== 'lead') {
        redirect('/dashboard');
    }

    return <DevToolsClient />;
}
