import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { format, isToday, isFuture, parseISO } from 'date-fns';
import { getInterviewerDashboard } from '@/app/actions/interview-ops';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Calendar, Clock, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { DashboardTabs } from './dashboard-tabs';

export default async function InterviewerWorkspace() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) redirect('/login');

    // Fetch Dashboard Data
    const { success, data: cases, error } = await getInterviewerDashboard();

    if (!success || !cases) {
        return (
            <div className="p-8 text-center">
                <h2 className="text-xl font-bold text-red-500">System Error</h2>
                <p className="text-muted-foreground">{error}</p>
            </div>
        );
    }

    // Categorize — ONLY show pending_interview cases in the Live Workspace
    const today = new Date();

    // ON DECK: Cases ready for interview TODAY
    const onDeck = cases.filter(c =>
        c.status === 'pending_interview' &&
        c.scheduled_interview_date &&
        isToday(parseISO(c.scheduled_interview_date))
    );

    // UPCOMING: Cases ready for interview in the FUTURE (not today)
    const upcoming = cases.filter(c =>
        c.status === 'pending_interview' &&
        c.scheduled_interview_date &&
        isFuture(parseISO(c.scheduled_interview_date)) &&
        !isToday(parseISO(c.scheduled_interview_date))
    );

    // AWAITING FORM: Accepted cases where the employee hasn't submitted the form yet
    // These appear as informational — no action needed from the interviewer
    const awaitingForm = cases.filter(c =>
        c.status === 'pending_interview' &&
        !c.scheduled_interview_date
    );

    return (
        <div className="container max-w-7xl py-8 space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
                        Interview Command Center
                    </h1>
                    <p className="text-muted-foreground mt-1 text-lg">
                        Manage your daily schedule and verification tasks.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Card className="bg-indigo-500/10 border-indigo-500/20 px-4 py-2 flex flex-col items-center justify-center">
                        <span className="text-2xl font-bold text-indigo-400 leading-none">{onDeck.length}</span>
                        <span className="text-[10px] uppercase font-bold text-indigo-300/60 tracking-wider">Interviews Today</span>
                    </Card>
                    <Card className="bg-cyan-500/10 border-cyan-500/20 px-4 py-2 flex flex-col items-center justify-center">
                        <span className="text-2xl font-bold text-cyan-400 leading-none">{upcoming.length}</span>
                        <span className="text-[10px] uppercase font-bold text-cyan-300/60 tracking-wider">Upcoming</span>
                    </Card>
                </div>
            </div>

            {/* ON DECK (Priority) */}
            <div className="space-y-4">
                <div className="flex items-center gap-2 text-indigo-400 font-bold uppercase text-xs tracking-widest">
                    <Clock className="w-4 h-4" />
                    <span>On Deck (Today)</span>
                </div>

                {onDeck.length === 0 ? (
                    <div className="p-8 rounded-2xl border border-dashed border-white/10 bg-white/[0.02] flex flex-col items-center justify-center text-muted-foreground">
                        <Calendar className="w-8 h-8 mb-3 opacity-20" />
                        <p>No interviews scheduled for today.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {onDeck.map((c) => (
                            <InterviewCard key={c.id} resignation={c} priority />
                        ))}
                    </div>
                )}
            </div>

            {/* CLIENT-SIDE TABS */}
            <DashboardTabs upcoming={upcoming} pendingReview={awaitingForm} />
        </div>
    );
}

// --- Components (Only Server-Side Compatible or Shared) ---

function InterviewCard({ resignation, priority = false }: { resignation: any, priority?: boolean }) {
    // @ts-ignore
    const employee = resignation.employee_details || {};

    return (
        <Card className={cn(
            "group overflow-hidden transition-all hover:border-indigo-500/50 hover:shadow-lg hover:shadow-indigo-500/10",
            priority ? "border-indigo-500/30 bg-indigo-500/[0.03]" : "bg-white/[0.02] border-white/5"
        )}>
            <CardHeader className="flex flex-row items-center gap-4 pb-3">
                <Avatar className="h-12 w-12 border-2 border-white/10">
                    <AvatarFallback className="bg-indigo-500/20 text-indigo-300 font-bold">
                        {employee.full_name?.charAt(0) || 'E'}</AvatarFallback>
                </Avatar>
                <div>
                    <CardTitle className="text-base font-bold text-white group-hover:text-indigo-300 transition-colors">
                        {employee.full_name || 'Employee'}
                    </CardTitle>
                    <CardDescription className="text-xs">
                        {employee.current_position} • {employee.department}
                    </CardDescription>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <div className="flex items-center text-sm font-medium text-white/80">
                        <Clock className="w-4 h-4 mr-2 text-indigo-400" />
                        {resignation.scheduled_interview_date ? format(parseISO(resignation.scheduled_interview_date), 'h:mm a') : 'Time TBD'}
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                        <Calendar className="w-4 h-4 mr-2 opacity-50" />
                        {resignation.scheduled_interview_date ? format(parseISO(resignation.scheduled_interview_date), 'MMMM do, yyyy') : 'Date TBD'}
                    </div>
                </div>

                <div className="pt-2">
                    <Button className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold shadow-md shadow-indigo-500/20" asChild>
                        <Link href={`/dashboard/interview/${resignation.id}`}>
                            Launch Protocol <ArrowRight className="w-4 h-4 ml-2" />
                        </Link>
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
