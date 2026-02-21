import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getMultiSeriesTrendData, getDepartmentScoreData, getCorrelationData } from '../shared-actions';
import { getCompensationMetrics, getPayBenefitsMatrix } from './actions-compensation';
import { MultiSeriesTrendDeepDive } from '@/components/analytics/deep-dive/MultiSeriesTrendDeepDive';
import { DepartmentScoreDeepDive } from '@/components/analytics/deep-dive/DepartmentScoreDeepDive';
import { CorrelationDeepDive } from '@/components/analytics/deep-dive/CorrelationDeepDive';


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
            <h1 className="text-2xl font-bold tracking-tight text-foreground mb-6">Compensation</h1>

            <div className="grid gap-6 md:grid-cols-2">
                {/* 1. The Strategy (Golden Handcuffs Matrix) */}
                {/* REMOVED as per user request */}

                {/* 2. The Timeline (Trend) */}
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

                {/* 3. The Heatmap (Department) */}
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

                {/* 4. The Correlation (Root Cause) */}
                <Card className="bg-card/50 border-border backdrop-blur-xl">
                    <CardHeader>
                        <CardTitle className="text-sm font-medium text-muted-foreground">Root Cause Analysis</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <CorrelationDeepDive
                            initialData={correlationData}
                            metricLabel="Compensation"
                            questionKey={questionKey}
                        />
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
