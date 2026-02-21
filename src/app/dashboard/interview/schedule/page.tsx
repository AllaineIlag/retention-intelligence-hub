
import { Suspense } from 'react';
import { getAllInterviews, getInterviewerDashboard } from '@/app/actions/interview-ops';
import { InterviewsTable } from '@/components/dashboard/interviews-table';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, ArrowRight } from 'lucide-react';
import { format, isToday, isFuture, parseISO } from 'date-fns';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export default function InterviewsPage() {
    return (
        <div className="space-y-8 animate-in fade-in duration-700 max-w-7xl mx-auto">
            {/* Today's Interviews Banner */}
            <Suspense fallback={<BannerSkeleton />}>
                <TodaysBanner />
            </Suspense>

            {/* Full Interviews Table */}
            <Suspense fallback={<TableSkeleton />}>
                <InterviewsList />
            </Suspense>
        </div>
    );
}

// --------------- Today's Interviews Banner ---------------

async function TodaysBanner() {
    const { success, data: cases } = await getInterviewerDashboard();

    if (!success || !cases) return null;

    const todayCases = cases.filter(
        (c: any) =>
            c.status === 'pending_interview' &&
            c.scheduled_interview_date &&
            isToday(parseISO(c.scheduled_interview_date))
    );

    const upcomingCount = cases.filter(
        (c: any) =>
            c.status === 'pending_interview' &&
            c.scheduled_interview_date &&
            isFuture(parseISO(c.scheduled_interview_date)) &&
            !isToday(parseISO(c.scheduled_interview_date))
    ).length;

    if (todayCases.length === 0 && upcomingCount === 0) return null;

    return (
        <div className="space-y-4">
            {/* Stats Row */}
            <div className="flex items-center gap-3">
                <Card className="bg-blue-500/10 border-blue-500/20 px-4 py-2 flex flex-col items-center justify-center">
                    <span className="text-2xl font-bold text-blue-400 leading-none">{todayCases.length}</span>
                    <span className="text-[10px] uppercase font-bold text-blue-300/60 tracking-wider">Today</span>
                </Card>
                <Card className="bg-cyan-500/10 border-cyan-500/20 px-4 py-2 flex flex-col items-center justify-center">
                    <span className="text-2xl font-bold text-cyan-400 leading-none">{upcomingCount}</span>
                    <span className="text-[10px] uppercase font-bold text-cyan-300/60 tracking-wider">Upcoming</span>
                </Card>
            </div>

            {/* Today's Interview Cards */}
            {todayCases.length > 0 && (
                <div>
                    <div className="flex items-center gap-2 text-blue-400 font-bold uppercase text-xs tracking-widest mb-3">
                        <Clock className="w-4 h-4" />
                        <span>On Deck (Today)</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {todayCases.map((c: any) => {
                            const employee = c.employee_details || {};
                            return (
                                <Card
                                    key={c.id}
                                    className="group overflow-hidden transition-all hover:border-blue-500/50 hover:shadow-lg hover:shadow-blue-500/10 border-blue-500/30 bg-blue-500/[0.03]"
                                >
                                    <CardHeader className="flex flex-row items-center gap-4 pb-3">
                                        <Avatar className="h-10 w-10 border-2 border-white/10">
                                            <AvatarFallback className="bg-blue-500/20 text-blue-300 font-bold text-sm">
                                                {employee.full_name?.charAt(0) || 'E'}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="min-w-0">
                                            <CardTitle className="text-sm font-bold text-white group-hover:text-blue-300 transition-colors truncate">
                                                {employee.full_name || 'Employee'}
                                            </CardTitle>
                                            <CardDescription className="text-xs truncate">
                                                {employee.current_position} • {employee.department}
                                            </CardDescription>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-3 pt-0">
                                        <div className="flex items-center text-sm font-medium text-white/80">
                                            <Clock className="w-3.5 h-3.5 mr-2 text-blue-400" />
                                            {c.scheduled_interview_date
                                                ? format(parseISO(c.scheduled_interview_date), 'h:mm a')
                                                : 'Time TBD'}
                                        </div>
                                        <Button
                                            className="bg-brand-primary hover:bg-brand-primary/90 text-white font-bold shadow-md shadow-blue-500/20 h-9 text-xs"
                                            asChild
                                        >
                                            <Link href={`/dashboard/interview/${c.id}`}>
                                                Launch Interview <ArrowRight className="w-3.5 h-3.5 ml-2" />
                                            </Link>
                                        </Button>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}

// --------------- Interviews Table ---------------

async function InterviewsList() {
    const { success, data } = await getAllInterviews();
    const interviews = success && data ? data : [];
    return <InterviewsTable data={interviews as any} />;
}

// --------------- Skeletons ---------------

function BannerSkeleton() {
    return (
        <div className="space-y-4">
            <div className="flex gap-3">
                <Skeleton className="h-16 w-24 rounded-xl" />
                <Skeleton className="h-16 w-24 rounded-xl" />
            </div>
        </div>
    );
}

function TableSkeleton() {
    return (
        <div className="space-y-4">
            <div className="flex justify-between">
                <Skeleton className="h-10 w-72" />
                <div className="flex gap-2">
                    <Skeleton className="h-9 w-16" />
                    <Skeleton className="h-9 w-24" />
                    <Skeleton className="h-9 w-20" />
                </div>
            </div>
            <div className="rounded-xl border border-white/10 bg-[#0a0a0a]/50 p-6 space-y-6">
                {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Skeleton className="h-10 w-10 rounded-full" />
                            <div className="space-y-2">
                                <Skeleton className="h-4 w-40" />
                                <Skeleton className="h-3 w-24" />
                            </div>
                        </div>
                        <Skeleton className="h-6 w-20" />
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-9 w-28" />
                    </div>
                ))}
            </div>
        </div>
    );
}
