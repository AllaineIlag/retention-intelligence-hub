import { CustomSidebarProvider, CustomSidebar, CustomSidebarTrigger } from '@/components/custom-sidebar';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

import { DashboardHeader } from '@/components/dashboard/dashboard-header';
import { GlobalFilters } from '@/components/dashboard/global-filters';

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

    return (
        <CustomSidebarProvider>
            <div className="flex h-screen overflow-hidden bg-background">
                <CustomSidebar role={role} email={user.email || 'Unknown'} />
                <div className="flex flex-1 flex-col overflow-hidden">
                    <header className="flex h-16 shrink-0 items-center justify-between border-b border-white/5 px-4 md:px-6">
                        <div className="flex flex-1 items-center gap-4">
                            <CustomSidebarTrigger />
                            <DashboardHeader />
                        </div>

                        <div className="mx-8">
                            <GlobalFilters />
                        </div>

                        <span className="rounded-full bg-indigo-600/10 px-3 py-1 text-xs font-medium uppercase tracking-wide text-indigo-400">
                            {role}
                        </span>
                    </header>
                    <main className="flex-1 overflow-y-auto p-4 lg:p-8">{children}</main>
                </div>
            </div>
        </CustomSidebarProvider>
    );
}

