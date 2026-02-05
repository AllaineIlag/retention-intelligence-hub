import InviteUserCard from '@/components/dashboard/team/InviteUserCard';
import TeamMembersTable from '@/components/dashboard/team/TeamMembersTable';
import { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
    title: 'Team Management | Retention Intelligence Hub',
    description: 'Manage your team of interviewers.',
};

export default async function TeamPage() {
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
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <div className="col-span-1 md:col-span-2 lg:col-span-3 space-y-4">
                    <InviteUserCard />
                </div>
                <div className="col-span-1 md:col-span-2 lg:col-span-4">
                    <TeamMembersTable />
                </div>
            </div>
        </div>
    );
}

