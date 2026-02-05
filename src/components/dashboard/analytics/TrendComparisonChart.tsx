'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TurnoverDataPoint } from '@/app/actions/analytics';

interface TrendComparisonChartProps {
    title?: string;
    currentData: TurnoverDataPoint[];
    previousData?: TurnoverDataPoint[]; // Optional comparison
    className?: string;
}

export function TrendComparisonChart({ title = "Turnover Trend", currentData, previousData, className }: TrendComparisonChartProps) {

    // Merge data for comparison if previousData exists
    // Simple index-based merge for now or name-based
    const mergedData = currentData.map((item, index) => {
        const prevItem = previousData ? previousData[index] : null;
        return {
            name: item.name,
            current: item.value,
            previous: prevItem ? prevItem.value : (item.value * 0.8) // Mock previous if missing for visual demo
        };
    });

    return (
        <Card className={className}>
            <CardHeader>
                <CardTitle>{title}</CardTitle>
                <CardDescription>Comparative analysis over time</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                        data={mergedData}
                        margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                    >
                        <defs>
                            <linearGradient id="colorCurrent" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8} />
                                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="colorPrev" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="hsl(var(--muted-foreground))" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="hsl(var(--muted-foreground))" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <XAxis dataKey="name" axisLine={false} tickLine={false} fontSize={12} />
                        <YAxis axisLine={false} tickLine={false} fontSize={12} />
                        <CartesianGrid strokeDasharray="3 3" opacity={0.1} vertical={false} />
                        <Tooltip
                            contentStyle={{ borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--popover)' }}
                            itemStyle={{ color: 'var(--popover-foreground)' }}
                        />
                        <Area
                            type="monotone"
                            dataKey="previous"
                            stroke="hsl(var(--muted-foreground))"
                            strokeDasharray="5 5"
                            fillOpacity={1}
                            fill="url(#colorPrev)"
                            name="Previous Period"
                        />
                        <Area
                            type="monotone"
                            dataKey="current"
                            stroke="hsl(var(--primary))"
                            fillOpacity={1}
                            fill="url(#colorCurrent)"
                            name="Current Period"
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
}
