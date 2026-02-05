import { Suspense } from 'react';

import { getDashboardStats, getRecentResignations } from '@/app/actions/dashboard';
import {
    getAnalyticsSummary,
    getTurnoverTrends,
    getDepartmentBreakdown,
    getCountryStats,
    getExitQuestionStats
} from '@/app/actions/analytics';
import { StatCards } from '@/components/dashboard/stat-cards';
import { RecentResignationsTable } from '@/components/dashboard/recent-resignations-table';
import { HeroTurnoverChart } from '@/components/dashboard/analytics/charts/HeroTurnoverChart';
import { QuickWinsCharts } from '@/components/dashboard/analytics/charts/QuickWinsCharts';
import { RingMetricCard } from '@/components/dashboard/analytics/charts/RingMetricCard';
import { CountryPieChart } from '@/components/dashboard/analytics/charts/CountryPieChart';
import { Skeleton } from '@/components/ui/skeleton';

import { parseISO } from 'date-fns';
import { AnalyticsFilters } from '@/app/actions/analytics';

export default async function DashboardPage({
    searchParams
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
    const params = await searchParams;

    // Extract Filters
    const filters: AnalyticsFilters = {
        startDate: params.from ? parseISO(params.from as string) : undefined,
        endDate: params.to ? parseISO(params.to as string) : undefined,
        department: params.dept ? [params.dept as string] : undefined,
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
        const promoters = recStats.stats.find(s => s.name === 'Yes')?.value || 0;
        recPercent = Math.round((promoters / recStats.totalResponses) * 100);
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
            <RingMetricCard
                title="Turnover Rate"
                value={`${summary.turnoverRate.toFixed(1)}%`}
                subtext="Monthly Rate"
                progress={Math.min((summary.turnoverRate / 3) * 100, 100)}
                color={summary.turnoverRate > 2.2 ? '#f43f5e' : '#10b981'}
            />

            <RingMetricCard
                title="Top Exit Reason"
                value={summary.primaryDriver ? `${summary.primaryDriver.percentage}%` : '0%'}
                subtext={summary.primaryDriver ? summary.primaryDriver.reason : 'No Data'}
                progress={summary.primaryDriver ? summary.primaryDriver.percentage : 0}
                color="#f59e0b"
            />

            <RingMetricCard
                title="Would Recommend"
                value={`${recPercent}%`}
                subtext="Promoter Score"
                progress={recPercent}
                color={recPercent >= 50 ? '#10b981' : '#f43f5e'}
            />

            <RingMetricCard
                title="Avg. Tenure"
                value={`${summary.avgTenureMonths} mo`}
                subtext="Length of Service"
                progress={Math.min((summary.avgTenureMonths / 36) * 100, 100)}
                color="#6366f1"
            />
        </div>
    );
}

async function HeroSection({ filters }: { filters: AnalyticsFilters }) {
    const [deptRes, trendRes] = await Promise.all([
        getDepartmentBreakdown(filters),
        getTurnoverTrends(filters)
    ]);

    const deptData = deptRes.success ? deptRes.data?.map((d, i) => ({
        ...d,
        fill: ['#6366f1', '#8b5cf6', '#14b8a6', '#10b981', '#f59e0b'][i % 5]
    })) : [];

    const monthData = trendRes.success ? trendRes.data || [] : [];

    return (
        <HeroTurnoverChart
            deptData={deptData as any}
            monthData={monthData as any}
        />
    );
}

async function QuickWinsSection({ filters }: { filters: AnalyticsFilters }) {
    const statsRes = await getExitQuestionStats(filters);
    const stats = statsRes.success ? statsRes.data || [] : [];

    const getChartData = (key: string) => stats.find(s => s.question_key === key)?.stats || [];

    return (
        <QuickWinsCharts
            pullFactors={getChartData('reason_for_leaving')}
            careerGrowth={getChartData('career_growth')}
            payPerception={getChartData('rate_of_pay')}
            benefits={getChartData('benefits')}
            workload={getChartData('workload')}
        />
    );
}

async function RecentResignationsSection({ filters }: { filters: AnalyticsFilters }) {
    const res = await getRecentResignations(filters);
    const data = res.success ? res.data || [] : [];
    return <RecentResignationsTable resignations={data as any} />;
}

async function CountrySection({ filters }: { filters: AnalyticsFilters }) {
    const res = await getCountryStats(filters);
    const data = res.success ? res.data?.map((d, i) => ({
        ...d,
        fill: ['#6366f1', '#8b5cf6', '#14b8a6', '#10b981', '#64748b'][i % 5]
    })) : [];

    return <CountryPieChart data={data as any} />;
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
