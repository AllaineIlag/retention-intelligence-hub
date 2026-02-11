import PendingUsersTable from '@/components/dashboard/team/PendingUsersTable';
import { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
    title: 'Access Requests | Retention Intelligence Hub',
    description: 'Review and approve pending access requests.',
};

export default async function PendingPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) redirect('/login');

    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

    if (profile?.role !== 'lead') {
        redirect('/dashboard');
    }

    return (
        <div className="flex-1 space-y-6 p-8 pt-6 max-w-7xl mx-auto">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-white to-zinc-500 bg-clip-text text-transparent">
                    Access Requests
                </h2>
            </div>

            <div className="w-full space-y-8">
                <PendingUsersTable />
            </div>
        </div>
    );
}
