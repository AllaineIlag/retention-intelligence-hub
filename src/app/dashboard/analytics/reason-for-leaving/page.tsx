
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AttritionTrendAnalytics } from '@/components/analytics/AttritionTrendAnalytics';
import { DepartmentClusterAnalytics } from '@/components/analytics/DepartmentClusterAnalytics';
import { DemographicRiskAnalytics } from '@/components/analytics/DemographicRiskAnalytics';
import { QualitativeFeed } from '@/components/analytics/QualitativeFeed';
import { ReasonTopKpiGrid } from '@/components/analytics/ReasonTopKpiGrid';
import { ReasonAnalysisAnalytics } from '@/components/analytics/ReasonAnalysisAnalytics';


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
            {/* Header handled by root layout */}

            {/* SECTOR 1: Top KPIs */}
            <ReasonTopKpiGrid />


            {/* SECTOR 2: Analytics Analysis (Market + Drivers) */}
            <ReasonAnalysisAnalytics
                initialCompetitor={competitor}
                initialMoneyVsCulture={moneyVsCulture}
                initialButterfly={butterflyData}
            />

            <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
                {/* 1. The Timeline (Trend) */}
                <div className="col-span-1 md:col-span-2">
                    <AttritionTrendAnalytics initialData={trendData} />
                </div>

                {/* 2. The Cluster (Reason by Dept) */}
                <div>
                    <DepartmentClusterAnalytics initialData={clusterData} />
                </div>

                {/* 3. The Demographic (Risk Profile) */}
                <div>
                    <DemographicRiskAnalytics initialData={riskData} />
                </div>
            </div>
        </div>
    );
}
