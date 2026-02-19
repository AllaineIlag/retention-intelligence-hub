import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getMultiSeriesTrendData, getDepartmentScoreData, getCorrelationData } from '../shared-actions';
import { getCompensationMetrics, getPayBenefitsMatrix } from './actions-compensation';
import { MultiSeriesTrendChart } from '@/components/analytics/deep-dive/MultiSeriesTrendChart';
import { DepartmentScoreChart } from '@/components/analytics/deep-dive/DepartmentScoreChart';
import { CorrelationCard } from '@/components/analytics/deep-dive/CorrelationCard';


export default async function CompensationPage() {
    const questionKey = 'rate_of_pay'; // DB Key
    const options = [
        { label: 'High', color: '#10b981' },     // Green
        { label: 'Fair', color: '#f59e0b' },     // Amber
        { label: 'Low', color: '#ef4444' }       // Red
    ];

    // Parallel Fetching
    const [trendData, deptData, correlationData, matrixData] = await Promise.all([
        getMultiSeriesTrendData(questionKey, options.map(o => o.label)),
        getDepartmentScoreData(questionKey),
        getCorrelationData(questionKey),
        getPayBenefitsMatrix()
    ]);

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold tracking-tight text-white mb-6">Compensation</h1>

            <div className="grid gap-6 md:grid-cols-2">
                {/* 1. The Strategy (Golden Handcuffs Matrix) */}
                {/* REMOVED as per user request */}

                {/* 2. The Timeline (Trend) */}
                <Card className="bg-[#1a1a1c]/50 border-white/5 backdrop-blur-xl col-span-2">
                    <CardHeader>
                        <CardTitle className="text-sm font-medium text-gray-400">Response Trend (Count over Time)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <MultiSeriesTrendChart data={trendData} options={options} />
                    </CardContent>
                </Card>

                {/* 3. The Heatmap (Department) */}
                <Card className="bg-[#1a1a1c]/50 border-white/5 backdrop-blur-xl">
                    <CardHeader>
                        <CardTitle className="text-sm font-medium text-gray-400">Department (Average Score)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <DepartmentScoreChart data={deptData} />
                    </CardContent>
                </Card>

                {/* 4. The Correlation (Root Cause) */}
                <Card className="bg-[#1a1a1c]/50 border-white/5 backdrop-blur-xl">
                    <CardHeader>
                        <CardTitle className="text-sm font-medium text-gray-400">Root Cause Analysis</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <CorrelationCard data={correlationData} metricLabel="Compensation" />
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
