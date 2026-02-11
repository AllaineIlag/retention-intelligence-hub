'use client'

import { useEffect, useState } from 'react'
import { getRetentionMetrics, type RetentionMetrics } from './actions'
import { MetricCard } from '@/components/analytics/trends/MetricCard'
import { RetentionCurveChart } from '@/components/analytics/trends/RetentionCurveChart'
import { FlightRiskTable } from '@/components/analytics/trends/FlightRiskTable'
import { Skeleton } from '@/components/ui/skeleton'

export function TrendsContent() {
    const [metrics, setMetrics] = useState<RetentionMetrics | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        getRetentionMetrics()
            .then(setMetrics)
            .finally(() => setLoading(false))
    }, [])

    if (loading || !metrics) return <TrendsSkeleton />

    return (
        <div className="space-y-6">
            {/* Row 1: KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
                <MetricCard
                    title="New Hire Dropout"
                    value={metrics.newHireDropout.count}
                    subtext={`${metrics.newHireDropout.rate}% of exits < 6 months`}
                    progress={metrics.newHireDropout.rate}
                    color={metrics.newHireDropout.rate > 15 ? '#f43f5e' : '#10b981'}
                />
                <MetricCard
                    title="Stagnation Rate"
                    value={`${metrics.stagnation.rate}%`}
                    subtext={`${metrics.stagnation.count} left without promotion`}
                    progress={metrics.stagnation.rate}
                    color={metrics.stagnation.rate > 30 ? '#f59e0b' : '#6366f1'}
                />
                <MetricCard
                    title="Manager Loss"
                    value={metrics.managerLoss.count}
                    subtext="Key leadership exits"
                    progress={Math.min(metrics.managerLoss.count * 10, 100)}
                    color="#8b5cf6"
                />
            </div>

            {/* Row 2: Charts & Table */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <RetentionCurveChart data={metrics.retentionCurve} />
                <FlightRiskTable data={metrics.flightRisk} />
            </div>
        </div>
    )
}

function TrendsSkeleton() {
    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
                {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-32 rounded-3xl border border-white/5 bg-white/[0.02] p-6">
                        <Skeleton className="h-4 w-[100px] mb-4" />
                        <Skeleton className="h-8 w-[60px]" />
                    </div>
                ))}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="h-[400px] rounded-3xl border border-white/5 bg-white/[0.02] p-6 flex flex-col space-y-4">
                    <Skeleton className="h-6 w-[200px]" />
                    <Skeleton className="h-full w-full opacity-20" />
                </div>
                <div className="h-[400px] rounded-3xl border border-white/5 bg-white/[0.02] p-6 flex flex-col space-y-4">
                    <Skeleton className="h-6 w-[200px]" />
                    <Skeleton className="h-full w-full opacity-20" />
                </div>
            </div>
        </div>
    )
}
