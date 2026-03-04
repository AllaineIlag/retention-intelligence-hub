import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getMultiSeriesTrendData, getDepartmentScoreData, getCorrelationData } from '../shared-actions';
import { MultiSeriesTrendAnalytics } from '@/components/analytics/MultiSeriesTrendAnalytics';
import { DepartmentScoreAnalytics } from '@/components/analytics/DepartmentScoreAnalytics';
import { CorrelationAnalytics } from '@/components/analytics/CorrelationAnalytics';

export default async function BenefitsPage() {
    const questionKey = 'benefits'; // DB Key
    const options = [
        { label: 'Very satisfied', color: '#10b981' },    // Green
        { label: 'Satisfied', color: '#34d399' },        // Light Green
        { label: 'Dissatisfied', color: '#f59e0b' },     // Amber
        { label: 'Very dissatisfied', color: '#ef4444' } // Red
    ];

    // Parallel Fetching
    const [trendData, deptData, correlationData] = await Promise.all([
        getMultiSeriesTrendData(questionKey, options.map(o => o.label)),
        getDepartmentScoreData(questionKey),
        getCorrelationData(questionKey)
    ]);

    return (
        <div className="space-y-6">
            {/* Header handled by root layout */}

            <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
                {/* 1. The Timeline (Trend) */}
                <div className="col-span-1 md:col-span-2">
                    <MultiSeriesTrendAnalytics
                        initialData={trendData}
                        options={options}
                        questionKey={questionKey}
                    />
                </div>

                {/* 2. The Heatmap (Department) */}
                <div>
                    <DepartmentScoreAnalytics
                        initialData={deptData}
                        questionKey={questionKey}
                    />
                </div>

                {/* 3. The Correlation (Root Cause) */}
                <div>
                    <CorrelationAnalytics
                        initialData={correlationData}
                        metricLabel="Benefits"
                        questionKey={questionKey}
                    />
                </div>
            </div>
        </div>
    )
}
