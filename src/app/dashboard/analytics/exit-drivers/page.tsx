import { Suspense } from "react";
import { getExitDriverMetrics } from "./actions";
import { MetricCard } from "@/components/analytics/trends/MetricCard";
import { ButterflyChart } from "@/components/analytics/exit-drivers/ButterflyChart";
import { DestinationDonut } from "@/components/analytics/exit-drivers/DestinationDonut";
import { MoneyVsCultureBar } from "@/components/analytics/exit-drivers/MoneyVsCultureBar";
import { Skeleton } from "@/components/ui/skeleton";

export default async function ExitDriversPage() {
    return (
        <div className="space-y-6 animate-in fade-in duration-700 p-2">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Exit Drivers</h2>
                    <p className="text-muted-foreground">Identify the maximum-impact factors contributing to attrition.</p>
                </div>
            </div>

            <Suspense fallback={<ExitDriversSkeleton />}>
                <ExitDriversContent />
            </Suspense>
        </div>
    );
}

async function ExitDriversContent() {
    const metrics = await getExitDriverMetrics();

    return (
        <div className="space-y-6">
            {/* Row 1: KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
                <MetricCard
                    title="Top Competitor Draw"
                    value={metrics.topCompetitorDraw.reason}
                    subtext={`${metrics.topCompetitorDraw.count} out of ${metrics.topCompetitorDraw.total} cited`}
                    progress={metrics.topCompetitorDraw.total > 0
                        ? Math.round((metrics.topCompetitorDraw.count / metrics.topCompetitorDraw.total) * 100)
                        : 0}
                    color="#f59e0b"
                />
                <MetricCard
                    title="Brain Drain"
                    value={metrics.brainDrain.count}
                    subtext={`${metrics.brainDrain.rate}% leaving for abroad`}
                    progress={metrics.brainDrain.rate}
                    color={metrics.brainDrain.rate > 20 ? '#f43f5e' : '#3b82f6'}
                />
                <MetricCard
                    title="Conflict Exits"
                    value={metrics.conflictExits.count}
                    subtext={`${metrics.conflictExits.rate}% cite leadership issues`}
                    progress={metrics.conflictExits.rate}
                    color={metrics.conflictExits.rate > 25 ? '#f43f5e' : '#8b5cf6'}
                />
            </div>

            {/* Row 2: Butterfly Chart + Destination Donut */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ButterflyChart
                    push={metrics.pushPull.push}
                    pull={metrics.pushPull.pull}
                />
                <DestinationDonut data={metrics.destination} />
            </div>

            {/* Row 3: Money vs Culture */}
            <MoneyVsCultureBar
                financial={metrics.moneyVsCulture.financial}
                environment={metrics.moneyVsCulture.environment}
                total={metrics.moneyVsCulture.total}
            />
        </div>
    );
}

// ------------------------------------------------------------------
// LOADING SKELETONS
// ------------------------------------------------------------------
function ExitDriversSkeleton() {
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
            <div className="h-[200px] rounded-3xl border border-white/5 bg-white/[0.02] p-6">
                <Skeleton className="h-6 w-[200px] mb-4" />
                <Skeleton className="h-10 w-full" />
            </div>
        </div>
    );
}
