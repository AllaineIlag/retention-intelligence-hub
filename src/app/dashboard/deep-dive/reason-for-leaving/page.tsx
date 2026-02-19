
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AttritionTrendDeepDive } from '@/components/analytics/deep-dive/AttritionTrendDeepDive';
import { DepartmentClusterDeepDive } from '@/components/analytics/deep-dive/DepartmentClusterDeepDive';
import { DemographicRiskDeepDive } from '@/components/analytics/deep-dive/DemographicRiskDeepDive';
import { QualitativeFeed } from '@/components/analytics/deep-dive/QualitativeFeed';
import { ReasonTopKpiGrid } from '@/components/analytics/deep-dive/ReasonTopKpiGrid';
import { ReasonAnalysisDeepDive } from '@/components/analytics/deep-dive/ReasonAnalysisDeepDive';


import { getAttritionTrendData } from './actions-trend';
import { getDepartmentClusterData } from './actions-heatmap';
import { getDemographicRiskData } from './actions-demographic';
import { getQualitativeComments } from './actions-qualitative';
import { getPushPullData } from './actions-retention';
import { getCompetitorDraw, getMoneyVsCulture } from './actions-market';

export default async function ReasonForLeavingPage() {
    // Parallel data fetching
    const [trendData, clusterData, riskData, comments, butterflyData, competitor, moneyVsCulture] = await Promise.all([
        getAttritionTrendData(),
        getDepartmentClusterData(),
        getDemographicRiskData(),
        getQualitativeComments(),
        getPushPullData(),
        getCompetitorDraw(),
        getMoneyVsCulture()
    ]);

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold tracking-tight text-white mb-6">Reason for Leaving</h1>

            {/* SECTOR 1: Top KPIs */}
            <ReasonTopKpiGrid />


            {/* SECTOR 2: Deep Dive Analysis (Market + Drivers) */}
            <ReasonAnalysisDeepDive
                initialCompetitor={competitor}
                initialMoneyVsCulture={moneyVsCulture}
                initialButterfly={butterflyData}
            />

            <div className="grid gap-6 md:grid-cols-2">
                {/* 1. The Timeline (Trend) */}
                <Card className="bg-[#1a1a1c]/50 border-white/5 backdrop-blur-xl col-span-2">
                    <CardHeader>
                        <CardTitle className="text-sm font-medium text-gray-400">Trend (Frequency over Time)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="mt-4">
                            <AttritionTrendDeepDive initialData={trendData} />
                        </div>
                    </CardContent>
                </Card>

                {/* 2. The Cluster (Reason by Dept) */}
                {/* 2. The Cluster (Reason by Dept) */}
                <Card className="bg-[#1a1a1c]/50 border-white/5 backdrop-blur-xl">
                    <CardHeader>
                        <CardTitle className="text-sm font-medium text-gray-400">Cluster Analysis (Reason by Dept)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="mt-4">
                            <DepartmentClusterDeepDive initialData={clusterData} />
                        </div>
                    </CardContent>
                </Card>

                {/* 3. The Demographic (Risk Profile) */}
                {/* 3. The Demographic (Risk Profile) */}
                <Card className="bg-[#1a1a1c]/50 border-white/5 backdrop-blur-xl">
                    <CardHeader>
                        <CardTitle className="text-sm font-medium text-gray-400">Demographic Risk (Tenure)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="mt-4">
                            <DemographicRiskDeepDive initialData={riskData} />
                        </div>
                    </CardContent>
                </Card>

            </div>
        </div>
    );
}
