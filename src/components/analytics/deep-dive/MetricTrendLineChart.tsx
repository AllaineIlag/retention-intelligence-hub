'use client';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { TrendPoint } from '@/app/dashboard/analytics/deep-dive/actions-trend';
import { Area, AreaChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';

export function MetricTrendLineChart({ data, title, color }: { data: TrendPoint[], title: string, color: string }) {
    return (
        <Card className="col-span-2">
            <CardHeader>
                <CardTitle>{title}</CardTitle>
            </CardHeader>
            <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data}>
                        <XAxis dataKey="date" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} domain={[0, 5]} />
                        <Tooltip />
                        <Area type="monotone" dataKey="value" stroke={color} fill={color} fillOpacity={0.2} />
                    </AreaChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
}
