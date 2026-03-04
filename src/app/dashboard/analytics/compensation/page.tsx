import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getMultiSeriesTrendData, getDepartmentScoreData, getCorrelationData } from '../shared-actions';
import { getCompensationMetrics, getPayBenefitsMatrix } from './actions-compensation';
import { MultiSeriesTrendAnalytics } from '@/components/analytics/MultiSeriesTrendAnalytics';
import { DepartmentScoreAnalytics } from '@/components/analytics/DepartmentScoreAnalytics';
import { CorrelationAnalytics } from '@/components/analytics/CorrelationAnalytics';


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
            {/* Header handled by root layout */}

            <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
                {/* 1. The Strategy (Golden Handcuffs Matrix) */}
                {/* REMOVED as per user request */}

                {/* 2. The Timeline (Trend) */}
                <div className="col-span-1 md:col-span-2">
                    <MultiSeriesTrendAnalytics
                        initialData={trendData}
                        options={options}
                        questionKey={questionKey}
                    />
                </div>

                {/* 3. The Heatmap (Department) */}
                <div>
                    <DepartmentScoreAnalytics
                        initialData={deptData}
                        questionKey={questionKey}
                    />
                </div>

                {/* 4. The Correlation (Root Cause) */}
                <div>
                    <CorrelationAnalytics
                        initialData={correlationData}
                        metricLabel="Compensation"
                        questionKey={questionKey}
                    />
                </div>
            </div>
        </div>
    )
}
