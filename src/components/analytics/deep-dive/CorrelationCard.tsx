'use client';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { CorrelationData } from '@/app/dashboard/analytics/deep-dive/actions-trend';

export function CorrelationCard({ data, metricName }: { data: CorrelationData[], metricName: string }) {
    return (
        <Card className="col-span-1">
            <CardHeader>
                <CardTitle>Key Correlations</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {data.map((item, i) => (
                        <div key={i} className="flex justify-between items-center text-sm">
                            <span>{item.factor}</span>
                            <span className={item.strength > 0 ? 'text-green-500' : 'text-red-500'}>
                                {item.strength > 0 ? '+' : ''}{item.strength}
                            </span>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
