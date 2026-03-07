import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import {
    getAnalyticsSummary,
    getTurnoverTrends,
    getDepartmentBreakdown,
    getExitQuestionStats,
    getCountryStats,
    getStrategicInsights,
    getRetentionRiskData,
    AnalyticsFilters,
} from '@/app/actions/analytics';
import { TurnoverTrendCard } from '@/components/dashboard/analytics/charts/TurnoverTrendCard';
import { DepartmentDistributionCard } from '@/components/dashboard/analytics/charts/DepartmentDistributionCard';
import { SmartDonutCard } from '@/components/dashboard/analytics/charts/SmartDonutCard';
import { DestinationExitsCard } from '@/components/dashboard/analytics/charts/DestinationExitsCard';
import { TurnoverRateCard } from '@/components/dashboard/analytics/kpi/TurnoverRateCard';
import { TopExitReasonCard } from '@/components/dashboard/analytics/kpi/TopExitReasonCard';
import { PromoterScoreCard } from '@/components/dashboard/analytics/kpi/PromoterScoreCard';
import { AvgTenureCard } from '@/components/dashboard/analytics/kpi/AvgTenureCard';
import { PrintTrigger } from '@/components/dashboard/export/PrintTrigger';
import { startOfMonth, endOfMonth, subMonths, parseISO } from 'date-fns';
import { format } from 'date-fns';

export const metadata: Metadata = {
    title: 'Export Report | Retention Intelligence Hub',
};

interface Props {
    searchParams: Promise<{ startDate?: string; endDate?: string; department?: string }>;
}

export default async function ExportPrintPage({ searchParams }: Props) {
    // Auth guard — leads only
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect('/login');

    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

    if (profile?.role !== 'lead') redirect('/dashboard');

    // Resolve URL params
    const params = await searchParams;
    const today = new Date();
    const filters: AnalyticsFilters = {
        startDate: params.startDate ? parseISO(params.startDate) : startOfMonth(subMonths(today, 5)),
        endDate: params.endDate ? parseISO(params.endDate) : endOfMonth(today),
        department: params.department ? [params.department] : undefined,
    };

    // Fetch all data in parallel
    const CHART_COLORS = ['var(--chart-1)', 'var(--chart-2)', 'var(--chart-3)', 'var(--chart-4)', 'var(--chart-5)'];

    const [summaryRes, trendRes, deptRes, questionRes, countryRes, insightsRes, riskRes] = await Promise.all([
        getAnalyticsSummary(filters),
        getTurnoverTrends(filters),
        getDepartmentBreakdown(filters),
        getExitQuestionStats(filters),
        getCountryStats(filters),
        getStrategicInsights(),
        getRetentionRiskData(),
    ]);

    const summary = summaryRes.success ? summaryRes.data! : { totalExits: 0, turnoverRate: 0, avgTenureMonths: 0, primaryDriver: null };
    const monthData = trendRes.success ? trendRes.data || [] : [];
    const deptData = deptRes.success ? deptRes.data?.map((d, i) => ({ ...d, fill: CHART_COLORS[i % CHART_COLORS.length] })) || [] : [];
    const questionStats = questionRes.success ? questionRes.data || [] : [];
    const countryData = countryRes.success ? countryRes.data || [] : [];
    const insights = insightsRes.success ? insightsRes.data?.insights || [] : [];
    const riskData = riskRes.success ? riskRes.data || [] : [];

    const getChartData = (key: string) => questionStats.find(s => s.question_key === key)?.stats || [];

    // Promoter score
    const recStats = questionStats.find(s => s.question_key === 'recommendation');
    let recPercent = 0;
    if (recStats && recStats.totalResponses > 0) {
        const promoters = recStats.stats.reduce((acc, curr) => {
            const score = parseInt(curr.name, 10);
            if (!isNaN(score) && score >= 90) return acc + curr.value;
            if (curr.name === 'Yes') return acc + curr.value;
            return acc;
        }, 0);
        recPercent = Math.round((promoters / recStats.totalResponses) * 100);
    }

    const reportLabel = params.department ? params.department : 'All Departments';
    const dateLabel = `${format(filters.startDate!, 'MMM yyyy')} – ${format(filters.endDate!, 'MMM yyyy')}`;

    return (
        <div className="min-h-screen bg-background text-foreground p-8 max-w-[900px] mx-auto space-y-8">

            {/* ── PRINT TRIGGER (hidden on print) ───────────────────── */}
            <PrintTrigger />

            {/* ── REPORT HEADER ─────────────────────────────────────── */}
            <div className="border-b border-border pb-6 flex items-start justify-between">
                <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1">
                        Retention Intelligence Hub
                    </p>
                    <h1 className="text-2xl font-bold text-foreground">Exit Analytics Report</h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        {reportLabel} · {dateLabel}
                    </p>
                </div>
                <div className="text-right text-xs text-muted-foreground">
                    <p>Generated</p>
                    <p className="font-semibold text-foreground">{format(new Date(), 'PPP')}</p>
                </div>
            </div>

            {/* ── KPI SUMMARY ────────────────────────────────────────── */}
            <section className="no-break">
                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">
                    Key Performance Indicators
                </p>
                <div className="grid grid-cols-4 gap-4">
                    <TurnoverRateCard initialRate={summary.turnoverRate} />
                    <TopExitReasonCard
                        initialValue={summary.primaryDriver?.reason ?? 'No Data'}
                        initialPercent={summary.primaryDriver?.percentage ?? 0}
                    />
                    <PromoterScoreCard initialPercent={recPercent} />
                    <AvgTenureCard initialValue={summary.avgTenureMonths} />
                </div>
            </section>

            {/* ── TREND + DEPARTMENT ─────────────────────────────────── */}
            <section className="no-break">
                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">
                    Trend & Distribution
                </p>
                <div className="grid grid-cols-2 gap-6">
                    <TurnoverTrendCard data={monthData as any} />
                    <DepartmentDistributionCard data={deptData as any} />
                </div>
            </section>

            {/* ── EXIT REASON DONUTS ─────────────────────────────────── */}
            <section className="page-break no-break">
                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">
                    Exit Survey Breakdown
                </p>
                <div className="grid grid-cols-3 gap-4">
                    <SmartDonutCard title="Why Another Job" questionKey="reason_for_leaving" initialData={getChartData('reason_for_leaving')} />
                    <SmartDonutCard title="Career Growth" questionKey="career_growth" initialData={getChartData('career_growth')} />
                    <SmartDonutCard title="Pay Rate" questionKey="rate_of_pay" initialData={getChartData('rate_of_pay')} />
                    <SmartDonutCard title="Feel About Benefits" questionKey="benefits" initialData={getChartData('benefits')} />
                    <SmartDonutCard title="Amount of Work" questionKey="workload" initialData={getChartData('workload')} />
                    <DestinationExitsCard initialData={countryData} />
                </div>
            </section>

            {/* ── RISK INDEX ─────────────────────────────────────────── */}
            <section className="no-break">
                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">
                    Retention Risk Index
                </p>
                <div className="border border-border rounded-xl p-5 space-y-4 bg-card">
                    {riskData.slice(0, 8).map((dept) => (
                        <div key={dept.name} className="flex items-center gap-4">
                            <div className="w-36 shrink-0">
                                <span className="text-sm font-semibold text-foreground block truncate">{dept.name}</span>
                                <span className="text-xs text-muted-foreground">{dept.headcount} headcount</span>
                            </div>
                            <div className="flex-1">
                                <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                                    <div
                                        className="h-full rounded-full"
                                        style={{
                                            width: `${dept.riskScore}%`,
                                            backgroundColor: dept.riskScore > 70 ? 'var(--status-error)' : dept.riskScore > 40 ? 'var(--status-warning)' : 'var(--status-info)',
                                        }}
                                    />
                                </div>
                            </div>
                            <span className="text-sm font-bold w-10 text-right text-foreground">{dept.riskScore}%</span>
                            <span className="text-xs text-muted-foreground w-14 text-right">{dept.velocity}x velocity</span>
                        </div>
                    ))}
                </div>
            </section>

            {/* ── INSIGHTS ENGINE ────────────────────────────────────── */}
            {insights.length > 0 && (
                <section className="no-break">
                    <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">
                        Strategic Insights
                    </p>
                    <div className="space-y-3">
                        {insights.map((insight) => (
                            <div
                                key={insight.id}
                                className={`p-4 rounded-xl border ${insight.type === 'critical'
                                    ? 'bg-red-950/20 border-red-500/20'
                                    : insight.type === 'warning'
                                        ? 'bg-amber-950/20 border-amber-500/20'
                                        : 'bg-emerald-950/20 border-emerald-500/20'
                                    }`}
                            >
                                <p className="text-sm font-semibold text-foreground">{insight.title}</p>
                                {insight.metrics && (
                                    <p className="text-xs text-muted-foreground mt-0.5">{insight.metrics}</p>
                                )}
                                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{insight.description}</p>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* ── FOOTER ─────────────────────────────────────────────── */}
            <div className="border-t border-border pt-4 flex items-center justify-between text-xs text-muted-foreground">
                <span>Retention Intelligence Hub — Confidential</span>
                <span>{format(new Date(), 'PPPp')}</span>
            </div>
        </div>
    );
}
