'use client';

import { useEffect, useState } from 'react';
import { AnalyticsFilters, AnalyticsFiltersState } from '@/components/dashboard/analytics/AnalyticsFilters';

import { getAnalyticsSummary, getDepartmentBreakdown, getTurnoverTrends, getExitQuestionStats, getTurnoverComparison, TurnoverDataPoint, QuestionStats, PrimaryDriver, ComparisonDataPoint } from '@/app/actions/analytics';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';

import { ExitReasonsChart } from '@/components/dashboard/charts/exit-reasons';
import { RecommendationRateChart } from '@/components/dashboard/charts/recommendation-rate';
import { CareerGrowthChart } from '@/components/dashboard/charts/career-growth';
import { RateOfPayChart } from '@/components/dashboard/charts/rate-of-pay';
import { VerdictCard } from '@/components/dashboard/analytics/VerdictCard';
import { HorizontalBarList } from '@/components/dashboard/analytics/charts/HorizontalBarList';
import { DonutChart } from '@/components/dashboard/analytics/charts/DonutChart';
import { RatingDistribution } from '@/components/dashboard/analytics/charts/RatingDistribution';
import { TrendComparisonChart } from '@/components/dashboard/analytics/charts/TrendComparisonChart';
import { DepartmentChart } from '@/components/dashboard/analytics/charts/DepartmentChart';

export default function AnalyticsPage() {
    const [loading, setLoading] = useState(true);
    const [trendData, setTrendData] = useState<TurnoverDataPoint[]>([]);
    const [deptData, setDeptData] = useState<TurnoverDataPoint[]>([]);
    const [comparisonData, setComparisonData] = useState<ComparisonDataPoint[]>([]);
    const [comparisonMeta, setComparisonMeta] = useState<{ currentLabel: string; previousLabel: string } | undefined>(undefined);
    const [questionStats, setQuestionStats] = useState<QuestionStats[]>([]);
    const [summary, setSummary] = useState<{
        totalExits: number;
        avgTenureMonths: number;
        primaryDriver: PrimaryDriver | null;
    }>({
        totalExits: 0,
        avgTenureMonths: 0,
        primaryDriver: null
    });

    const handleFilterChange = async (filters: AnalyticsFiltersState) => {
        setLoading(true);
        try {
            const apiFilters = {
                startDate: filters.dateRange?.from,
                endDate: filters.dateRange?.to,
                department: filters.department === 'all' ? undefined : [filters.department]
            };

            const [summaryRes, trendRes, deptRes, questionsRes, comparisonRes] = await Promise.all([
                getAnalyticsSummary(apiFilters),
                getTurnoverTrends(apiFilters),
                getDepartmentBreakdown(apiFilters),
                getExitQuestionStats(apiFilters),
                getTurnoverComparison(apiFilters)
            ]);

            if (summaryRes.success && summaryRes.data) {
                setSummary(summaryRes.data);
            }
            if (trendRes.success && trendRes.data) {
                setTrendData(trendRes.data);
            }
            if (deptRes.success && deptRes.data) {
                setDeptData(deptRes.data);
            }
            if (questionsRes.success && questionsRes.data) {
                setQuestionStats(questionsRes.data);
            }
            if (comparisonRes.success && comparisonRes.data) {
                setComparisonData(comparisonRes.data);
                setComparisonMeta(comparisonRes.meta);
            }


        } catch (error) {
            console.error(error);
            toast.error('Failed to load analytics data');
        } finally {
            setLoading(false);
        }
    };

    // Helper to find specific question data
    const getStats = (key: string) => questionStats.find(q => q.question_key === key);

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">

            <AnalyticsFilters onFilterChange={handleFilterChange} />

            {loading && (
                <div className="flex items-center justify-center p-10">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            )}

            {!loading && (
                <div className="space-y-4">
                    {/* Summary Cards */}
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <Card className="relative overflow-hidden border-white/5 bg-white/[0.02] backdrop-blur-sm transition-all hover:bg-white/[0.04] hover:border-white/10 group">
                            <div className="absolute inset-0 -z-10 bg-gradient-to-br from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Total Exits</CardTitle>
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className="h-4 w-4 text-muted-foreground transition-colors group-hover:text-indigo-400"
                                >
                                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                                    <polyline points="16 17 21 12 16 7" />
                                    <line x1="21" x2="9" y1="12" y2="12" />
                                </svg>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold tracking-tight">{summary.totalExits}</div>
                                <p className="text-[10px] text-muted-foreground/60 mt-1 uppercase tracking-tight">
                                    in selected period
                                </p>
                            </CardContent>
                        </Card>
                        <Card className="relative overflow-hidden border-white/5 bg-white/[0.02] backdrop-blur-sm transition-all hover:bg-white/[0.04] hover:border-white/10 group">
                            <div className="absolute inset-0 -z-10 bg-gradient-to-br from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Avg Tenure</CardTitle>
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className="h-4 w-4 text-muted-foreground transition-colors group-hover:text-indigo-400"
                                >
                                    <circle cx="12" cy="12" r="10" />
                                    <polyline points="12 6 12 12 16 14" />
                                </svg>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold tracking-tight">{summary.avgTenureMonths} <span className="text-sm font-normal text-muted-foreground">mos</span></div>
                                <p className="text-[10px] text-muted-foreground/60 mt-1 uppercase tracking-tight">
                                    average employment duration
                                </p>
                            </CardContent>
                        </Card>

                        <VerdictCard
                            data={getStats('recommendation')?.stats || []}
                            totalResponses={getStats('recommendation')?.totalResponses}
                            className="col-span-1"
                        />

                        {/* Card 4: Primary Driver (The Why) */}
                        <Card className="relative overflow-hidden border-white/5 bg-white/[0.02] backdrop-blur-sm transition-all hover:bg-white/[0.04] hover:border-white/10 group">
                            <div className="absolute inset-0 -z-10 bg-gradient-to-br from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Top Exit Factor</CardTitle>
                                <TrendingUp className="h-4 w-4 text-muted-foreground transition-colors group-hover:text-indigo-400" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold tracking-tight truncate" title={summary.primaryDriver?.reason || 'N/A'}>
                                    {summary.primaryDriver?.reason || 'N/A'}
                                </div>
                                <p className="text-[10px] text-muted-foreground/60 mt-1 uppercase tracking-tight">
                                    {summary.primaryDriver ? `${summary.primaryDriver.percentage}% of responses` : 'No data yet'}
                                </p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Charts: Trend Comparison & Department Breakdown */}
                    <div className="grid gap-4 md:grid-cols-2">
                        <TrendComparisonChart
                            title="Turnover Trends"
                            description="Comparison with previous period"
                            data={comparisonData}
                            meta={comparisonMeta}
                        />
                        <DepartmentChart data={deptData} />
                    </div>

                    {/* Detailed Analysis - The Storyteller */}
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
                        {/* Q1: Reason for Leaving - Horizontal List */}
                        <HorizontalBarList
                            title="Primary Reason for Leaving"
                            description="Top factors cited by departing employees"
                            data={getStats('reason_for_leaving')?.stats || []}
                            totalResponses={getStats('reason_for_leaving')?.totalResponses}
                            className="md:col-span-1"
                        />

                        {/* Q2: Why Desirable - Horizontal List */}
                        <HorizontalBarList
                            title="Why New Job is More Desirable"
                            description="Key attractors of the new opportunity"
                            data={getStats('why_more_desirable')?.stats || []}
                            totalResponses={getStats('why_more_desirable')?.totalResponses}
                            colorClass="bg-teal-500"
                        />

                        {/* Q3: Career Growth - Rating */}
                        <CareerGrowthChart />
                        <RatingDistribution
                            title="Career Growth Opportunities"
                            description="Perception of internal growth potential"
                            data={getStats('career_growth')?.stats || []}
                            totalResponses={getStats('career_growth')?.totalResponses}
                        />

                        {/* Q4: Rate of Pay - Rating */}
                        <RateOfPayChart />
                        <RatingDistribution
                            title="Perception of Pay"
                            description="Feedback on compensation competitiveness"
                            data={getStats('rate_of_pay')?.stats || []}
                            totalResponses={getStats('rate_of_pay')?.totalResponses}
                        />

                        {/* Q5: Benefits - Rating */}
                        <RatingDistribution
                            title="Satisfaction with Benefits"
                            description="Evaluation of benefits package"
                            data={getStats('benefits')?.stats || []}
                            totalResponses={getStats('benefits')?.totalResponses}
                        />

                        {/* Q6: Workload - Rating */}
                        <RatingDistribution
                            title="Workload Assessment"
                            description="Perception of work volume and balance"
                            data={getStats('workload')?.stats || []}
                            totalResponses={getStats('workload')?.totalResponses}
                        />
                    </div>

                    {/* Q7: Recommendation - Donut Chart (Full Width or separate section) */}
                    <div className="grid gap-4 md:grid-cols-1">
                        <DonutChart
                            title="Company Recommendation"
                            description="Overall sentiment: Would you recommend us?"
                            data={getStats('recommendation')?.stats || []}
                            totalResponses={getStats('recommendation')?.totalResponses}
                            colors={['#10b981', '#ef4444', '#f59e0b']}
                        />
                    </div>
                </div>
            )}
        </div>
    )
}
