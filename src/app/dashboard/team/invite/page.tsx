import UniversalLinkCard from '@/components/dashboard/team/UniversalLinkCard';
import { RecentAccountsTable } from '@/components/dashboard/team/RecentAccountsTable';
import { getRecentAccounts } from '@/app/actions/user-actions';
import { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export const metadata: Metadata = {
    title: 'Recruitment Sector | Retention Intelligence Hub',
    description: 'Invite and track new interviewers.',
};

export default async function InvitePage() {
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
                    Recruitment Sector
                </h2>
            </div>

            <div className="flex flex-col gap-6 max-w-4xl mx-auto">
                <div className="w-full">
                    <UniversalLinkCard />
                </div>
                <div className="w-full">
                    <Suspense fallback={<TableSkeleton />}>
                        <AccountsList />
                    </Suspense>
                </div>
            </div>
        </div>
    );
}

async function AccountsList() {
    const { data: accounts } = await getRecentAccounts();
    return <RecentAccountsTable accounts={accounts || []} />;
}

function TableSkeleton() {
    return (
        <div className="space-y-3">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-64 w-full rounded-xl" />
        </div>
    );
}
