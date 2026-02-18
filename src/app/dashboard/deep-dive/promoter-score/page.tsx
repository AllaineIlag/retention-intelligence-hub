import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getMultiSeriesTrendData, getDepartmentScoreData, getCorrelationData } from '../shared-actions';
import { getPromoterMetrics } from './actions-promoter';
import { MultiSeriesTrendChart } from '@/components/analytics/deep-dive/MultiSeriesTrendChart';
import { DepartmentScoreChart } from '@/components/analytics/deep-dive/DepartmentScoreChart';
import { CorrelationCard } from '@/components/analytics/deep-dive/CorrelationCard';
import { PromoterGauge } from '@/components/analytics/deep-dive/PromoterGauge';

export default async function RecommendPage() {
    const questionKey = 'recommendation'; // DB Key (Yes/No mapped to 5/1)
    const options = [
        { label: 'Yes', color: '#10b981' }, // Green
        { label: 'No', color: '#ef4444' }   // Red
    ];

    // Parallel Fetching
    const [trendData, deptData, correlationData, promoterMetrics] = await Promise.all([
        getMultiSeriesTrendData(questionKey, options.map(o => o.label)),
        getDepartmentScoreData(questionKey),
        getCorrelationData(questionKey),
        getPromoterMetrics()
    ]);

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold tracking-tight text-white mb-6">Promoter Score</h1>

            <div className="grid gap-6 md:grid-cols-2">
                 {/* Legacy Migration: Promoter Gauge */}
                <div className="col-span-2 lg:col-span-1">
                    <PromoterGauge 
                        promoters={promoterMetrics.promoters}
                        detractors={promoterMetrics.detractors}
                        avgScore={promoterMetrics.avgScore}
                        total={promoterMetrics.total}
                    />
                </div>

                {/* 2. The Heatmap (Department) */}
                <Card className="bg-[#1a1a1c]/50 border-white/5 backdrop-blur-xl">
                    <CardHeader>
                        <CardTitle className="text-sm font-medium text-gray-400">Department (Average Score)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <DepartmentScoreChart data={deptData} />
                    </CardContent>
                </Card>

                {/* 1. The Timeline (Trend) */}
                <Card className="bg-[#1a1a1c]/50 border-white/5 backdrop-blur-xl col-span-2">
                    <CardHeader>
                        <CardTitle className="text-sm font-medium text-gray-400">Response Trend (Count over Time)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <MultiSeriesTrendChart data={trendData} options={options} />
                    </CardContent>
                </Card>

                {/* 3. The Correlation (Root Cause) */}
                <Card className="bg-[#1a1a1c]/50 border-white/5 backdrop-blur-xl col-span-2">
                    <CardHeader>
                        <CardTitle className="text-sm font-medium text-gray-400">Root Cause Analysis</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <CorrelationCard data={correlationData} metricLabel="Promoter Score" />
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
