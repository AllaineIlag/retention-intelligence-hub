import { Suspense } from 'react'
import { getMetricHistory } from '@/app/dashboard/analytics/deep-dive/actions-trend'
import { MetricTrendLineChart } from '@/components/analytics/deep-dive/MetricTrendLineChart'
import { DepartmentHeatmapChart } from '@/components/analytics/deep-dive/DepartmentHeatmapChart'
import { CorrelationCard } from '@/components/analytics/deep-dive/CorrelationCard'
import { CommentFeed } from '@/components/analytics/deep-dive/CommentFeed'
import { Skeleton } from '@/components/ui/skeleton'
import { notFound } from 'next/navigation'

interface PageProps {
    params: Promise<{ metric: string }>
}

const METRIC_CONFIG: Record<string, { title: string, color: string }> = {
    'pay': { title: 'Pay Rating Analysis', color: '#22c55e' }, // Green
    'growth': { title: 'Career Growth Analysis', color: '#3b82f6' }, // Blue
    'benefits': { title: 'Benefits Satisfaction', color: '#a855f7' }, // Purple
    'workload': { title: 'Workload Balance', color: '#f97316' }, // Orange
    'recommendation': { title: 'Net Promoter Score (eNPS)', color: '#ec4899' }, // Pink
}

export default async function SatisfactionMetricPage({ params }: PageProps) {
    const { metric } = await params
    const config = METRIC_CONFIG[metric]

    if (!config) return notFound()

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-white">{config.title}</h1>
                    <p className="text-gray-400">Deep dive into retention drivers and employee sentiment.</p>
                </div>
            </div>

            <Suspense fallback={<MetricSkeleton />}>
                <MetricContent metric={metric} config={config} />
            </Suspense>
        </div>
    )
}

async function MetricContent({ metric, config }: { metric: string, config: { title: string, color: string } }) {
    const data = await getMetricHistory(metric)

    return (
        <div className="space-y-6">
            {/* Row 1: Trend (2/3) + Correlation (1/3) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <MetricTrendLineChart
                    data={data.history}
                    title={`${config.title} Trend (12 Months)`}
                    color={config.color}
                />
                <DepartmentHeatmapChart
                    data={data.department}
                    title="Department Breakdown"
                />
            </div>

            {/* Row 2: Correlation (1/3) + Comments (2/3) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <CorrelationCard
                    data={data.correlation}
                    metricName={config.title}
                />
                <CommentFeed
                    comments={data.comments}
                    title={`Voice of the Employee (${data.comments.length} Recent)`}
                />
            </div>
        </div>
    )
}

function MetricSkeleton() {
    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Skeleton className="h-[300px] col-span-2 rounded-xl bg-white/5" />
                <Skeleton className="h-[300px] col-span-1 rounded-xl bg-white/5" />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Skeleton className="h-[300px] col-span-1 rounded-xl bg-white/5" />
                <Skeleton className="h-[300px] col-span-2 rounded-xl bg-white/5" />
            </div>
        </div>
    )
}
