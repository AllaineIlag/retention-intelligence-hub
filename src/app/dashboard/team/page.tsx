import { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ProvisionInterviewerCard from '@/components/dashboard/team/ProvisionInterviewerCard';
import TeamMembersTable from '@/components/dashboard/team/TeamMembersTable';
import { LinkIcon, ShieldCheck } from 'lucide-react';
import { getTeamMembers } from '@/app/actions/user-actions';

export const metadata: Metadata = {
    title: 'Team | Retention Intelligence Hub',
    description: 'Manage your team of interviewers.',
};

export default async function TeamPage() {
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

    const teamResult = await getTeamMembers();
    const initialMembers = (teamResult.success && teamResult.data) ? teamResult.data : [];

    return (
        <div className="flex flex-col gap-6 p-8 max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-2">
                <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
                    Team Management
                </h2>
            </div>

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
                        Interviewer Access
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="team" className="mt-0">
                    <TeamMembersTable initialMembers={initialMembers as any} />
                </TabsContent>

                <TabsContent value="invite" className="mt-0">
                    <div className="max-w-2xl mx-auto">
                        <ProvisionInterviewerCard />
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
