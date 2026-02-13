
import InviteUserCard from '@/components/dashboard/team/InviteUserCard';
import TeamMembersTable from '@/components/dashboard/team/TeamMembersTable';
import PendingUsersTable from '@/components/dashboard/team/PendingUsersTable';
import { RecentAccountsTable } from '@/components/dashboard/team/RecentAccountsTable';
import { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { getRecentAccounts } from '@/app/actions/user-actions';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
    title: 'Recruitment | Retention Intelligence Hub',
    description: 'Manage your team of interviewers.',
};

export default async function RecruitmentPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
    }

    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

    const role = profile?.role;
    const { data: accounts } = await getRecentAccounts();

    if (role !== 'lead') {
        return (
            <div className="flex flex-col gap-6">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-white mb-2">Team Management</h1>
                    <p className="text-muted-foreground">View the team of interviewers.</p>
                </div>
                <div className="grid gap-6">
                    <TeamMembersTable />
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-8 h-full">
            <div>
                <h1 className="text-2xl font-bold tracking-tight text-white mb-2">Recruitment</h1>
                <p className="text-muted-foreground">Manage your interviewers and pending requests.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 h-full">
                {/* Left Column: Actions & Gatekeeping (40% - 2/5 cols) */}
                <div className="lg:col-span-2 flex flex-col gap-8">
                    <section>
                        <InviteUserCard />
                    </section>

                    <section className="flex-1">
                        <PendingUsersTable />
                    </section>
                </div>

                {/* Right Column: Roster (60% - 3/5 cols) */}
                <div className="lg:col-span-3 flex flex-col h-full">
                    <RecentAccountsTable accounts={accounts || []} />
                </div>
            </div>
        </div>
    );
}
