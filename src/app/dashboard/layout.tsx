import { CustomSidebarProvider, CustomSidebar, CustomSidebarTrigger } from '@/components/custom-sidebar';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

import { DashboardHeader } from '@/components/dashboard/dashboard-header';
import { CreateResignationDialog } from '@/components/dashboard/create-resignation-dialog';
import { NotificationBell } from '@/components/dashboard/notification-bell';

import { PageFilterProvider } from '@/components/dashboard/page-filter-context';
import { NavPageFilter } from '@/components/dashboard/nav-page-filter';

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
    }

    // Fetch user role from profiles table
    // Optimizing by parallelizing with user count if needed, but role is needed first for redirects.
    // Actually, can fetch both. But count is only relevant for lead.

    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

    const role = (profile?.role as 'lead' | 'interviewer' | 'employee') || 'employee';

    // Employees should not access dashboard
    if (role === 'employee') {
        redirect('/exit-form');
    }

    // Fetch pending count only for leads (Direct query for performance)
    let pendingCount = 0;
    if (role === 'lead') {
        const { count, error } = await supabase
            .from('profiles')
            .select('*', { count: 'exact', head: true })
            .eq('status', 'pending');

        if (!error) {
            pendingCount = count || 0;
        } else {
            console.error('Failed to load pending users count:', error);
        }
    }

    return (
        <CustomSidebarProvider>
            <PageFilterProvider>
                <div className="flex h-screen overflow-hidden bg-background" suppressHydrationWarning>
                    <CustomSidebar role={role} email={user.email || 'Unknown'} pendingCount={pendingCount} />
                    <div className="flex flex-1 flex-col overflow-hidden">
                        <header className="flex h-16 shrink-0 items-center justify-between border-b border-white/5 px-4 md:px-6 bg-[#0f0f11]/50 backdrop-blur-xl sticky top-0 z-10 transition-all duration-300">
                            <div className="flex items-center gap-4">
                                <CustomSidebarTrigger />
                                <DashboardHeader />
                                <NavPageFilter />
                            </div>

                            <div className="flex items-center gap-4 md:gap-6">
                                {/* Actions Group */}
                                <div className="flex items-center gap-3">
                                    <NotificationBell />
                                    <CreateResignationDialog />

                                    <span className="ml-2 rounded-full bg-indigo-500/10 px-3 py-1 text-xs font-medium uppercase tracking-wide text-indigo-400 border border-indigo-500/20">
                                        {role}
                                    </span>
                                </div>
                            </div>
                        </header>
                        <main className="flex-1 overflow-y-auto p-4 lg:p-8">{children}</main>
                    </div>
                </div>
            </PageFilterProvider>
        </CustomSidebarProvider>
    );
}

