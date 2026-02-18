import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getMultiSeriesTrendData, getDepartmentScoreData, getCorrelationData } from '../shared-actions';
import { MultiSeriesTrendChart } from '@/components/analytics/deep-dive/MultiSeriesTrendChart';
import { DepartmentScoreChart } from '@/components/analytics/deep-dive/DepartmentScoreChart';
import { CorrelationCard } from '@/components/analytics/deep-dive/CorrelationCard';

export default async function CareerGrowthPage() {
    const questionKey = 'career_growth'; // DB Key
    const options = [
        { label: 'Very good chance', color: '#10b981' }, // Green
        { label: 'Good chances', color: '#34d399' },    // Light Green
        { label: 'Little chances', color: '#f59e0b' },   // Amber
        { label: 'Very little', color: '#f97316' },     // Orange
        { label: 'No chances', color: '#ef4444' }        // Red
    ];

    // Parallel Fetching
    const [trendData, deptData, correlationData] = await Promise.all([
        getMultiSeriesTrendData(questionKey, options.map(o => o.label)),
        getDepartmentScoreData(questionKey),
        getCorrelationData(questionKey)
    ]);

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold tracking-tight text-white mb-6">Career Growth</h1>



            <div className="grid gap-6 md:grid-cols-2">
                {/* 1. The Timeline (Trend) */}
                <Card className="bg-[#1a1a1c]/50 border-white/5 backdrop-blur-xl col-span-2">
                    <CardHeader>
                        <CardTitle className="text-sm font-medium text-gray-400">Response Trend (Count over Time)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <MultiSeriesTrendChart data={trendData} options={options} />
                    </CardContent>
                </Card>

                {/* 2. The Heatmap (Department) */}
                <Card className="bg-[#1a1a1c]/50 border-white/5 backdrop-blur-xl">
                    <CardHeader>
                        <CardTitle className="text-sm font-medium text-gray-400">Department (Average Score)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <DepartmentScoreChart data={deptData} />
                    </CardContent>
                </Card>

                {/* 3. The Correlation (Root Cause) */}
                <Card className="bg-[#1a1a1c]/50 border-white/5 backdrop-blur-xl">
                    <CardHeader>
                        <CardTitle className="text-sm font-medium text-gray-400">Root Cause Analysis</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <CorrelationCard data={correlationData} metricLabel="Career Growth" />
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
