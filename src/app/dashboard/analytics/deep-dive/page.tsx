import { Suspense } from "react";
import { getDeepDiveMetrics } from "./actions";
import { SentimentStackedBar } from "@/components/analytics/deep-dive/SentimentStackedBar";
import { PayVsBenefitsChart } from "@/components/analytics/deep-dive/PayVsBenefitsChart";
import { WorkloadScatter } from "@/components/analytics/deep-dive/WorkloadScatter";
import { PromoterGauge } from "@/components/analytics/deep-dive/PromoterGauge";
import { UnhappyTable } from "@/components/analytics/deep-dive/UnhappyTable";
import { Skeleton } from "@/components/ui/skeleton";

export default async function DeepDivePage() {
    return (
        <div className="space-y-6 animate-in fade-in duration-700 p-2">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Satisfaction Deep Dive</h2>
                    <p className="text-muted-foreground">Detailed breakdown of exit survey responses and sentiment.</p>
                </div>
            </div>

            <Suspense fallback={<DeepDiveSkeleton />}>
                <DeepDiveContent />
            </Suspense>
        </div>
    );
}

async function DeepDiveContent() {
    const metrics = await getDeepDiveMetrics();

    return (
        <div className="space-y-6">
            {/* Row 1: Sentiment Distribution + Pay vs Benefits */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <SentimentStackedBar data={metrics.sentiment} />
                <PayVsBenefitsChart data={metrics.payVsBenefits} />
            </div>

            {/* Row 2: Workload Scatter + Promoter Gauge */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <WorkloadScatter data={metrics.scatter} />
                <PromoterGauge
                    promoters={metrics.promoter.promoters}
                    detractors={metrics.promoter.detractors}
                    avgScore={metrics.promoter.avgScore}
                    total={metrics.promoter.total}
                />
            </div>

            {/* Row 3: Unhappy Table (full width) */}
            <UnhappyTable data={metrics.unhappyList} />
        </div>
    );
}

// ------------------------------------------------------------------
// LOADING SKELETONS
// ------------------------------------------------------------------
function DeepDiveSkeleton() {
    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {[...Array(2)].map((_, i) => (
                    <div key={i} className="h-[360px] rounded-3xl border border-white/5 bg-white/[0.02] p-6 flex flex-col space-y-4">
                        <Skeleton className="h-4 w-[180px]" />
                        <Skeleton className="h-3 w-[240px]" />
                        <Skeleton className="h-full w-full opacity-20" />
                    </div>
                ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {[...Array(2)].map((_, i) => (
                    <div key={i} className="h-[360px] rounded-3xl border border-white/5 bg-white/[0.02] p-6 flex flex-col space-y-4">
                        <Skeleton className="h-4 w-[180px]" />
                        <Skeleton className="h-3 w-[240px]" />
                        <Skeleton className="h-full w-full opacity-20" />
                    </div>
                ))}
            </div>
            <div className="h-[300px] rounded-3xl border border-white/5 bg-white/[0.02] p-6 flex flex-col space-y-4">
                <Skeleton className="h-4 w-[160px]" />
                <Skeleton className="h-3 w-[280px]" />
                <Skeleton className="h-full w-full opacity-20" />
            </div>
        </div>
    );
}
