import { Suspense } from 'react';

import { getDashboardStats, getRecentResignations } from '@/app/actions/dashboard';
import {
    getAnalyticsSummary,
    getTurnoverTrends,
    getDepartmentBreakdown,
    getCountryStats,
    getExitQuestionStats,
    AnalyticsFilters // Ensure this is imported
} from '@/app/actions/analytics';
import { StatCards } from '@/components/dashboard/stat-cards';
import { RecentResignationsTable } from '@/components/dashboard/recent-resignations-table';
import { Skeleton } from '@/components/ui/skeleton';
import { TurnoverTrendCard } from '@/components/dashboard/analytics/charts/TurnoverTrendCard';
import { DepartmentDistributionCard } from '@/components/dashboard/analytics/charts/DepartmentDistributionCard';
import { TurnoverRateCard } from '@/components/dashboard/analytics/kpi/TurnoverRateCard';
import { TopExitReasonCard } from '@/components/dashboard/analytics/kpi/TopExitReasonCard';
import { PromoterScoreCard } from '@/components/dashboard/analytics/kpi/PromoterScoreCard';
import { AvgTenureCard } from '@/components/dashboard/analytics/kpi/AvgTenureCard';
import { SmartDonutCard } from '@/components/dashboard/analytics/charts/SmartDonutCard';
import { DestinationExitsCard } from '@/components/dashboard/analytics/charts/DestinationExitsCard';



import { parseISO, startOfMonth, endOfMonth, subMonths } from 'date-fns';




// Default Filters: Current Month
// We no longer read from URL params as filtering is decentralized.
export default async function DashboardPage() {
    const today = new Date();
    const filters: AnalyticsFilters = {
        startDate: startOfMonth(today),
        endDate: endOfMonth(today),
        department: undefined,
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-700 p-2">


            {/* MAIN GRID */}
            <div className="grid gap-6 grid-cols-1 lg:grid-cols-4">
                <div className="lg:col-span-3 space-y-6">


                    <div className="w-full">
                        <Suspense fallback={<StatsSkeleton />}>
                            <KPISection filters={filters} />
                        </Suspense>
                    </div>

                    <div className="w-full">
                        <Suspense fallback={<ChartSkeleton />}>
                            <HeroSection filters={filters} />
                        </Suspense>
                    </div>

                    <div className="grid gap-6 grid-cols-1 lg:grid-cols-10">
                        <div className="lg:col-span-7">
                            <Suspense fallback={<TableSkeleton />}>
                                <RecentResignationsSection filters={filters} />
                            </Suspense>
                        </div>
                        <div className="lg:col-span-3">
                            <Suspense fallback={<WidgetSkeleton />}>
                                <CountrySection filters={filters} />
                            </Suspense>
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-1 h-full">
                    <Suspense fallback={<WidgetSkeleton />}>
                        <QuickWinsSection filters={filters} />
                    </Suspense>
                </div>
            </div>
        </div>
    );
}

async function KPISection({ filters }: { filters: AnalyticsFilters }) {
    const summaryRes = await getAnalyticsSummary(filters);
    const summary = summaryRes.success ? summaryRes.data! : {
        totalExits: 0,
        turnoverRate: 0,
        avgTenureMonths: 0,
        primaryDriver: null
    };

    // For RecommendationScore, we fetch question stats
    const questionStatsRes = await getExitQuestionStats(filters);
    const recStats = questionStatsRes.success ? questionStatsRes.data?.find(s => s.question_key === 'recommendation') : null;

    let recPercent = 0;
    if (recStats && recStats.totalResponses > 0) {
        const promoters = recStats.stats.reduce((acc, curr) => {
            const score = parseInt(curr.name, 10);
            if (!isNaN(score) && score >= 90) return acc + curr.value;
            // Fallback for legacy binary data
            if (curr.name === 'Yes') return acc + curr.value;
            return acc;
        }, 0);
        recPercent = Math.round((promoters / recStats.totalResponses) * 100);
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
            <TurnoverRateCard
                initialRate={summary.turnoverRate}
            />

            <TopExitReasonCard
                initialValue={summary.primaryDriver ? summary.primaryDriver.reason : 'No Data'}
                initialPercent={summary.primaryDriver ? summary.primaryDriver.percentage : 0}
            />

            <PromoterScoreCard
                initialPercent={recPercent}
            />

            <AvgTenureCard
                initialValue={summary.avgTenureMonths}
            />
        </div>
    );
}


async function HeroSection({ filters }: { filters: AnalyticsFilters }) {
    // For Trend Card, we want to show a 6-month history by default, regardless of the global filter
    const trendFilters = {
        ...filters,
        startDate: subMonths(filters.startDate || new Date(), 5), // 5 months back + current month = 6 months
    };

    const [deptRes, trendRes] = await Promise.all([
        getDepartmentBreakdown(filters),
        getTurnoverTrends(trendFilters)
    ]);

    const deptData = deptRes.success ? deptRes.data?.map((d, i) => ({
        ...d,
        fill: ['#6366f1', '#8b5cf6', '#14b8a6', '#10b981', '#f59e0b'][i % 5]
    })) : [];

    const monthData = trendRes.success ? trendRes.data || [] : [];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <TurnoverTrendCard data={monthData as any} />
            <DepartmentDistributionCard data={deptData as any} />
        </div>
    );
}

async function QuickWinsSection({ filters }: { filters: AnalyticsFilters }) {
    const statsRes = await getExitQuestionStats(filters);
    const stats = statsRes.success ? statsRes.data || [] : [];

    const getChartData = (key: string) => stats.find(s => s.question_key === key)?.stats || [];

    return (
        <div className="flex flex-col gap-4 h-full min-h-0">
            <SmartDonutCard
                title="Key Pull Factors"
                questionKey="reason_for_leaving"
                initialData={getChartData('reason_for_leaving')}
                className="flex-1"
            />
            <SmartDonutCard
                title="Career Growth"
                questionKey="career_growth"
                initialData={getChartData('career_growth')}
                className="flex-1"
            />
            <SmartDonutCard
                title="Pay Perception"
                questionKey="rate_of_pay"
                initialData={getChartData('rate_of_pay')}
                className="flex-1"
            />
            <SmartDonutCard
                title="Feel About Benefits"
                questionKey="benefits"
                initialData={getChartData('benefits')}
                className="flex-1"
            />
            <SmartDonutCard
                title="Amount of Work"
                questionKey="workload"
                initialData={getChartData('workload')}
                className="flex-1"
            />
        </div>
    );
}

async function RecentResignationsSection({ filters }: { filters: AnalyticsFilters }) {
    const res = await getRecentResignations(filters);
    const data = res.success ? res.data || [] : [];

    return <RecentResignationsTable resignations={data as any} />;
}

async function CountrySection({ filters }: { filters: AnalyticsFilters }) {
    const res = await getCountryStats(filters);
    const data = res.success ? res.data || [] : [];

    return <DestinationExitsCard initialData={data} />;
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
            <Skeleton className="h-full w-full opacity-20" />
        </div>
    );
}

function WidgetSkeleton() {
    return (
        <div className="h-[200px] rounded-xl border bg-card/50 p-6 flex flex-col space-y-4">
            <Skeleton className="h-6 w-[150px]" />
            <Skeleton className="h-full w-full opacity-20" />
        </div>
    );
}

function TableSkeleton() {
    return (
        <div className="space-y-4">
            <div className="rounded-md border bg-card/50 p-4 space-y-4">
                {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex items-center justify-between">
                        <Skeleton className="h-10 w-full" />
                    </div>
                ))}
            </div>
        </div>
    );
}
