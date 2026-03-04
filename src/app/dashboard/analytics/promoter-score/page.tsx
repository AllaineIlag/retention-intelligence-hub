import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getMultiSeriesTrendData, getDepartmentScoreData, getCorrelationData } from '../shared-actions';

import { MultiSeriesTrendAnalytics } from '@/components/analytics/MultiSeriesTrendAnalytics';
import { DepartmentScoreAnalytics } from '@/components/analytics/DepartmentScoreAnalytics';
import { CorrelationAnalytics } from '@/components/analytics/CorrelationAnalytics';


export default async function RecommendPage() {
    const questionKey = 'recommendation'; // DB Key (Yes/No mapped to 5/1)
    const options = [
        { label: 'Yes', color: '#10b981' }, // Green
        { label: 'No', color: '#ef4444' }   // Red
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
                        metricLabel="Promoter Score"
                        questionKey={questionKey}
                    />
                </div>
            </div>
        </div>
    )
}
