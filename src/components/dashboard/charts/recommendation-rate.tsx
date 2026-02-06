'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { useState, useEffect, useTransition } from 'react';
import { getRecommendationStats } from '@/app/actions/dashboard';
import { ChartTimeFilter, TimeRange } from '@/components/dashboard/analytics/chart-time-filter';
import { Skeleton } from '@/components/ui/skeleton';

const COLORS = ['#10b981', '#f43f5e', '#94a3b8']; // Green, Red, Gray

export function RecommendationRateChart() {
    const [timeRange, setTimeRange] = useState<TimeRange>('30d');
    const [data, setData] = useState<{ name: string; value: number }[]>([]);
    const [isPending, startTransition] = useTransition();

    useEffect(() => {
        const fetchData = async () => {
            const endDate = new Date();
            const startDate = new Date();

            if (timeRange === '7d') startDate.setDate(endDate.getDate() - 7);
            if (timeRange === '30d') startDate.setDate(endDate.getDate() - 30);
            if (timeRange === '3m') startDate.setMonth(endDate.getMonth() - 3);

            startTransition(async () => {
                const res = await getRecommendationStats({ startDate, endDate });
                if (res.success && res.data) {
                    setData(res.data);
                }
            });
        };

        fetchData();
    }, [timeRange]);

    return (
        <Card className="col-span-1 border-white/5 bg-white/[0.02] backdrop-blur-sm overflow-hidden group h-[400px] flex flex-col">
            <CardHeader className="pb-4 flex flex-row items-start justify-between space-y-0">
                <div>
                    <CardTitle className="text-lg font-bold text-white tracking-tight">Recommendation</CardTitle>
                    <CardDescription className="text-[10px] uppercase tracking-widest text-muted-foreground/60">
                        NPS Projection.
                    </CardDescription>
                </div>
                <ChartTimeFilter value={timeRange} onChange={setTimeRange} />
            </CardHeader>
            <CardContent className="flex-1 min-h-0 relative">
                {isPending && (
                    <div className="absolute inset-0 bg-black/10 backdrop-blur-[1px] z-10 flex items-center justify-center">
                        <Skeleton className="h-full w-full opacity-10" />
                    </div>
                )}

                {data.length === 0 || data.every(d => d.value === 0) ? (
                    <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
                        No data available.
                    </div>
                ) : (
                    <div className="h-full w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={data}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={70}
                                    outerRadius={90}
                                    paddingAngle={8}
                                    dataKey="value"
                                >
                                    {data.map((entry, index) => (
                                        <Cell
                                            key={`cell-${index}`}
                                            fill={COLORS[index % COLORS.length]}
                                            stroke="rgba(255,255,255,0.05)"
                                            strokeWidth={2}
                                        />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: 'rgba(10, 10, 10, 0.8)',
                                        backdropFilter: 'blur(12px)',
                                        borderRadius: '12px',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        boxShadow: '0 10px 25px -5px rgba(0,0,0,0.5)',
                                        color: '#fff'
                                    }}
                                />
                                <Legend
                                    verticalAlign="bottom"
                                    height={36}
                                    iconType="circle"
                                    formatter={(value) => <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">{value}</span>}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
