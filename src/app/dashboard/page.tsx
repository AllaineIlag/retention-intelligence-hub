

import { Suspense } from 'react';
import { getDashboardStats, getRecentResignations } from '@/app/actions/dashboard';
import { StatCards } from '@/components/dashboard/stat-cards';
import { MisunderstoodWidget } from '@/components/dashboard/misunderstood-widget';
import { TurnoverTrendsChart } from '@/components/dashboard/charts/turnover-trends';
import { ExitReasonsChart } from '@/components/dashboard/charts/exit-reasons';
import { RecommendationRateChart } from '@/components/dashboard/charts/recommendation-rate';
import { RecentResignationsTable } from '@/components/dashboard/recent-resignations-table';
import { Skeleton } from '@/components/ui/skeleton';

// REMOVED: export const dynamic = 'force-dynamic';
// Next.js will determine dynamic behavior based on the underlying fetch/cookies usage. 
// Since we use supabase headers in actions, it will be dynamic by default, but streamable.

export default function DashboardPage() {
    return (
        <div className="space-y-8 animate-in fade-in duration-700 p-2">

            <Suspense fallback={<StatsSkeleton />}>
                <StatsSection />
            </Suspense>

            <div className="grid gap-6 grid-cols-1 lg:grid-cols-7">
                <div className="lg:col-span-4">
                    <Suspense fallback={<ChartSkeleton />}>
                        <TurnoverSection />
                    </Suspense>
                </div>
                <div className="lg:col-span-3">
                    <Suspense fallback={<WidgetSkeleton />}>
                        <MisunderstoodSection />
                    </Suspense>
                </div>
            </div>

            <div className="grid gap-6 grid-cols-1 lg:grid-cols-7">
                <div className="lg:col-span-4">
                    <Suspense fallback={<ChartSkeleton />}>
                        <ExitReasonsSection />
                    </Suspense>
                </div>
                <div className="lg:col-span-3">
                    <Suspense fallback={<WidgetSkeleton />}>
                        <RecommendationSection />
                    </Suspense>
                </div>
            </div>

            <div className="grid gap-4 grid-cols-1">
                <Suspense fallback={<TableSkeleton />}>
                    <RecentResignationsSection />
                </Suspense>
            </div>
        </div>
    );
}

// ------------------------------------------------------------------
// STREAMING COMPONENTS (Data Fetchers)
// ------------------------------------------------------------------

async function StatsSection() {
    const statsRes = await getDashboardStats();
    const stats = statsRes.data || {
        totalEmployees: 0,
        activeResignations: 0,
        retentionRate: 100,
        misunderstoodCount: 0
    };
    return <StatCards stats={stats} />;
}

async function TurnoverSection() {
    return <TurnoverTrendsChart />;
}

async function MisunderstoodSection() {
    return <MisunderstoodWidget />;
}

async function ExitReasonsSection() {
    return <ExitReasonsChart />;
}

async function RecommendationSection() {
    return <RecommendationRateChart />;
}

async function RecentResignationsSection() {
    const recentRes = await getRecentResignations();
    const recentResignations = recentRes.data || [];
    return <RecentResignationsTable resignations={recentResignations} />;
}


// ------------------------------------------------------------------
// LOADING SKELETONS
// ------------------------------------------------------------------

function StatsSkeleton() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
            {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 rounded-xl border bg-card/50 p-6">
                    <Skeleton className="h-4 w-[100px] mb-4" />
                    <Skeleton className="h-8 w-[60px]" />
                </div>
            ))}
        </div>
    );
}

function ChartSkeleton() {
    return (
        <div className="h-[400px] rounded-xl border bg-card/50 p-6 flex flex-col space-y-4">
            <Skeleton className="h-6 w-[200px]" />
            <div className="flex-1 flex items-end space-x-4">
                <Skeleton className="h-full w-full opacity-20" />
            </div>
        </div>
    );
}

function WidgetSkeleton() {
    return (
        <div className="h-[400px] rounded-xl border bg-card/50 p-6 flex flex-col space-y-4">
            <Skeleton className="h-6 w-[150px]" />
            <Skeleton className="h-full w-full opacity-20" />
        </div>
    );
}

function TableSkeleton() {
    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <Skeleton className="h-8 w-[200px]" />
                <Skeleton className="h-8 w-[100px]" />
            </div>
            <div className="rounded-md border bg-card/50 p-4 space-y-4">
                {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <Skeleton className="h-10 w-10 rounded-full" />
                            <div className="space-y-2">
                                <Skeleton className="h-4 w-[150px]" />
                                <Skeleton className="h-3 w-[100px]" />
                            </div>
                        </div>
                        <Skeleton className="h-6 w-[100px]" />
                    </div>
                ))}
            </div>
        </div>
    );
}
