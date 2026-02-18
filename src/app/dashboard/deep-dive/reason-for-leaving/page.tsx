

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AttritionTrendChart } from '@/components/analytics/deep-dive/AttritionTrendChart';
import { DepartmentClusterChart } from '@/components/analytics/deep-dive/DepartmentClusterChart';
import { DemographicRiskChart } from '@/components/analytics/deep-dive/DemographicRiskChart';
import { QualitativeFeed } from '@/components/analytics/deep-dive/QualitativeFeed';

import { getAttritionTrendData } from './actions-trend';
import { getDepartmentClusterData } from './actions-heatmap';
import { getDemographicRiskData } from './actions-demographic';
import { getQualitativeComments } from './actions-qualitative';

export default async function ReasonForLeavingPage() {
    // Parallel data fetching
    const [trendData, clusterData, riskData, comments] = await Promise.all([
        getAttritionTrendData(),
        getDepartmentClusterData(),
        getDemographicRiskData(),
        getQualitativeComments()
    ]);

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold tracking-tight text-white mb-6">Reason for Leaving</h1>

            <div className="grid gap-6 md:grid-cols-2">
                {/* 1. The Timeline (Trend) */}
                <Card className="bg-[#1a1a1c]/50 border-white/5 backdrop-blur-xl col-span-2">
                    <CardHeader>
                        <CardTitle className="text-sm font-medium text-gray-400">Trend (Frequency over Time)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="mt-4">
                            <AttritionTrendChart data={trendData} />
                        </div>
                    </CardContent>
                </Card>

                {/* 2. The Cluster (Reason by Dept) */}
                <Card className="bg-[#1a1a1c]/50 border-white/5 backdrop-blur-xl">
                    <CardHeader>
                        <CardTitle className="text-sm font-medium text-gray-400">Cluster Analysis (Reason by Dept)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="mt-4">
                            <DepartmentClusterChart data={clusterData} />
                        </div>
                    </CardContent>
                </Card>

                {/* 3. The Demographic (Risk Profile) */}
                <Card className="bg-[#1a1a1c]/50 border-white/5 backdrop-blur-xl">
                    <CardHeader>
                        <CardTitle className="text-sm font-medium text-gray-400">Demographic Risk (Tenure)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="mt-4">
                            <DemographicRiskChart data={riskData} />
                        </div>
                    </CardContent>
                </Card>

            </div>
        </div>
    );
}

