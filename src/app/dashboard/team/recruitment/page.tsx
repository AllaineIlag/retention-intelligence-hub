import { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ProvisionInterviewerCard from '@/components/dashboard/team/ProvisionInterviewerCard';
import PendingUsersTable from '@/components/dashboard/team/PendingUsersTable';
import TeamMembersTable from '@/components/dashboard/team/TeamMembersTable';
import DeclinedTable from '@/components/dashboard/team/DeclinedTable';
import { LinkIcon, ClockIcon, ShieldCheck, Ban } from 'lucide-react';
import { getPendingUsers, getTeamMembers, getDeclinedAccounts } from '@/app/actions/user-actions';

export const metadata: Metadata = {
    title: 'Recruitment | Retention Intelligence Hub',
    description: 'Manage your team of interviewers.',
};

export default async function RecruitmentPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) redirect('/login');

    const { data: profile } = await supabase
        .from('profiles')
        .select('role, status')
        .eq('id', user.id)
        .single();

    const role = profile?.role;

    // Non-lead: read-only active team view
    if (role !== 'lead') {
        const teamResult = await getTeamMembers();
        const initialMembers = (teamResult.success && teamResult.data) ? teamResult.data : [];

        return (
            <div className="flex flex-col gap-6 p-8 max-w-7xl mx-auto">
                <TeamMembersTable initialMembers={initialMembers as any} />
            </div>
        );
    }

    // Pre-fetch all 3 datasets in parallel
    const [pendingResult, teamResult, declinedResult] = await Promise.all([
        getPendingUsers(),
        getTeamMembers(),
        getDeclinedAccounts(),
    ]);

    const initialUsers = (pendingResult.success && pendingResult.data) ? pendingResult.data : [];
    const initialMembers = (teamResult.success && teamResult.data) ? teamResult.data : [];
    const initialDeclined = (declinedResult.success && declinedResult.data) ? declinedResult.data : [];

    return (
        <div className="flex flex-col gap-6 p-8 max-w-7xl mx-auto">
            <Tabs defaultValue="team" className="w-full">
                <TabsList className="bg-muted/50 border border-border mb-6">
                    <TabsTrigger
                        value="team"
                        className="gap-2 data-[state=active]:bg-background data-[state=active]:text-foreground text-muted-foreground"
                    >
                        <ShieldCheck className="h-3.5 w-3.5" />
                        Active Team
                    </TabsTrigger>
                    <TabsTrigger
                        value="invite"
                        className="gap-2 data-[state=active]:bg-background data-[state=active]:text-foreground text-muted-foreground"
                    >
                        <LinkIcon className="h-3.5 w-3.5" />
                        Provision Access
                    </TabsTrigger>
                    <TabsTrigger
                        value="pending"
                        className="gap-2 data-[state=active]:bg-background data-[state=active]:text-foreground text-muted-foreground"
                    >
                        <ClockIcon className="h-3.5 w-3.5" />
                        Waitlist
                        {initialUsers.length > 0 && (
                            <span className="ml-1 flex h-4 w-4 items-center justify-center rounded-full bg-amber-500 text-[10px] font-bold text-black">
                                {initialUsers.length}
                            </span>
                        )}
                    </TabsTrigger>
                    <TabsTrigger
                        value="declined"
                        className="gap-2 data-[state=active]:bg-background data-[state=active]:text-foreground text-muted-foreground"
                    >
                        <Ban className="h-3.5 w-3.5" />
                        Declined
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="team" className="mt-0">
                    <TeamMembersTable initialMembers={initialMembers as any} />
                </TabsContent>

                <TabsContent value="invite" className="mt-0">
                    <div className="max-w-xl">
                        <ProvisionInterviewerCard />
                    </div>
                </TabsContent>

                <TabsContent value="pending" className="mt-0">
                    <PendingUsersTable initialUsers={initialUsers as any} />
                </TabsContent>

                <TabsContent value="declined" className="mt-0">
                    <DeclinedTable initialAccounts={initialDeclined as any} />
                </TabsContent>
            </Tabs>
        </div>
    );
}
