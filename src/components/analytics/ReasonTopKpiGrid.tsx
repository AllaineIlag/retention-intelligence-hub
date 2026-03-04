import { getReasonKPIs } from '@/app/dashboard/analytics/reason-for-leaving/actions-kpi';
import { getBrainDrain } from '@/app/dashboard/analytics/reason-for-leaving/actions-market';
import { TopExitReasonCard } from '@/components/dashboard/analytics/kpi/TopExitReasonCard';
import { LowestExitReasonCard } from '@/components/dashboard/analytics/kpi/LowestExitReasonCard';
import { AvgTenureCard } from '@/components/dashboard/analytics/kpi/AvgTenureCard';
import { BrainDrainCard } from '@/components/dashboard/analytics/kpi/BrainDrainCard';

export async function ReasonTopKpiGrid() {
    // Parallel data fetching for Top Row metrics
    const [kpiData, brainDrain] = await Promise.all([
        getReasonKPIs(),
        getBrainDrain()
    ]);

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-in slide-in-from-top-2 duration-500">

            {/* 1. Top Reason */}
            <TopExitReasonCard
                initialValue={kpiData.topReason.label}
                initialPercent={kpiData.topReason.percent}
            />

            {/* 2. Lowest Reason */}
            <LowestExitReasonCard
                initialValue={kpiData.lowestReason.label}
                initialPercent={kpiData.lowestReason.percent}
            />

            {/* 3. Average Tenure */}
            <AvgTenureCard
                initialValue={kpiData.avgTenure.months + (kpiData.avgTenure.years * 12)}
            />

            {/* 4. Brain Drain */}
            <BrainDrainCard
                initialValue={String(brainDrain.value)}
                initialInsight={brainDrain.insight}
            />

        </div>
    );
}
