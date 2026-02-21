import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getMultiSeriesTrendData, getDepartmentScoreData, getCorrelationData } from '../shared-actions';

import { MultiSeriesTrendDeepDive } from '@/components/analytics/deep-dive/MultiSeriesTrendDeepDive';
import { DepartmentScoreDeepDive } from '@/components/analytics/deep-dive/DepartmentScoreDeepDive';
import { CorrelationDeepDive } from '@/components/analytics/deep-dive/CorrelationDeepDive';


export default async function WorkloadPage() {
    const questionKey = 'workload'; // DB Key
    const options = [
        { label: 'Very manageable', color: '#10b981' }, // Green
        { label: 'Manageable', color: '#34d399' },      // Light Green
        { label: 'Heavy', color: '#f59e0b' },           // Amber
        { label: 'Very heavy', color: '#ef4444' }       // Red
    ];

    // Parallel Fetching
    const [trendData, deptData, correlationData] = await Promise.all([
        getMultiSeriesTrendData(questionKey, options.map(o => o.label)),
        getDepartmentScoreData(questionKey),
        getCorrelationData(questionKey)
    ]);

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold tracking-tight text-foreground mb-6">Workload Balance</h1>

            <div className="grid gap-6 md:grid-cols-2">
                {/* 1. The Timeline (Trend) */}
                <Card className="bg-card/50 border-border backdrop-blur-xl col-span-2">
                    <CardHeader>
                        <CardTitle className="text-sm font-medium text-muted-foreground">Response Trend (Count over Time)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <MultiSeriesTrendDeepDive
                            initialData={trendData}
                            options={options}
                            questionKey={questionKey}
                        />
                    </CardContent>
                </Card>

                {/* 2. The Heatmap (Department) */}
                <Card className="bg-card/50 border-border backdrop-blur-xl">
                    <CardHeader>
                        <CardTitle className="text-sm font-medium text-muted-foreground">Department (Average Score)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <DepartmentScoreDeepDive
                            initialData={deptData}
                            questionKey={questionKey}
                        />
                    </CardContent>
                </Card>

                {/* 3. The Correlation (Root Cause) */}
                <Card className="bg-card/50 border-border backdrop-blur-xl">
                    <CardHeader>
                        <CardTitle className="text-sm font-medium text-muted-foreground">Root Cause Analysis</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <CorrelationDeepDive
                            initialData={correlationData}
                            metricLabel="Workload"
                            questionKey={questionKey}
                        />
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
