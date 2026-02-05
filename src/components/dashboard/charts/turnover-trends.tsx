'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from 'recharts';
import { useState, useEffect, useTransition } from 'react';
import { getTurnoverTrends } from '@/app/actions/dashboard';
import { ChartTimeFilter, TimeRange } from '@/components/dashboard/analytics/chart-time-filter';
import { Skeleton } from '@/components/ui/skeleton';

export function TurnoverTrendsChart() {
    const [timeRange, setTimeRange] = useState<TimeRange>('30d');
    const [data, setData] = useState<{ name: string; resignations: number; retention: number }[]>([]);
    const [isPending, startTransition] = useTransition();

    useEffect(() => {
        const fetchTrends = async () => {
            const endDate = new Date();
            const startDate = new Date();

            if (timeRange === '7d') startDate.setDate(endDate.getDate() - 7);
            if (timeRange === '30d') startDate.setDate(endDate.getDate() - 30);
            if (timeRange === '3m') startDate.setMonth(endDate.getMonth() - 3);

            startTransition(async () => {
                const res = await getTurnoverTrends(startDate, endDate);
                if (res.success && res.data) {
                    setData(res.data);
                }
            });
        };

        fetchTrends();
    }, [timeRange]);

    return (
        <Card className="col-span-2 border-white/5 bg-white/[0.02] backdrop-blur-sm overflow-hidden group h-[400px] flex flex-col">
            <CardHeader className="pb-4 flex flex-row items-start justify-between space-y-0">
                <div>
                    <CardTitle className="text-lg font-bold text-white tracking-tight">Turnover Trends</CardTitle>
                    <CardDescription className="text-[10px] uppercase tracking-widest text-muted-foreground/60">
                        Resignation activity over time.
                    </CardDescription>
                </div>
                <ChartTimeFilter value={timeRange} onChange={setTimeRange} />
            </CardHeader>
            <CardContent className="pl-2 pt-2 flex-1 min-h-0 relative">
                {isPending && (
                    <div className="absolute inset-0 bg-black/10 backdrop-blur-[1px] z-10 flex items-center justify-center">
                        <Skeleton className="h-full w-full opacity-10" />
                    </div>
                )}
                <div className="h-full w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={data}>
                            <defs>
                                <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                                    <feGaussianBlur stdDeviation="3" result="blur" />
                                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                                </filter>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                            <XAxis
                                dataKey="name"
                                stroke="#525252"
                                fontSize={10}
                                tickLine={false}
                                axisLine={false}
                                dy={10}
                            />
                            <YAxis
                                stroke="#525252"
                                fontSize={10}
                                tickLine={false}
                                axisLine={false}
                                tickFormatter={(value) => `${value}`}
                            />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: 'rgba(10, 10, 10, 0.8)',
                                    backdropFilter: 'blur(12px)',
                                    borderRadius: '12px',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    boxShadow: '0 10px 25px -5px rgba(0,0,0,0.5)',
                                    color: '#fff'
                                }}
                                itemStyle={{ fontSize: '12px' }}
                            />
                            <Line
                                type="monotone"
                                dataKey="resignations"
                                stroke="#f43f5e"
                                strokeWidth={3}
                                dot={{ fill: '#f43f5e', strokeWidth: 2, r: 4 }}
                                activeDot={{ r: 6, strokeWidth: 0, fill: '#f43f5e' }}
                                name="Resignations"
                                filter="url(#glow)"
                            />
                            <Line
                                type="monotone"
                                dataKey="retention"
                                stroke="#6366f1"
                                strokeWidth={3}
                                dot={{ fill: '#6366f1', strokeWidth: 2, r: 4 }}
                                activeDot={{ r: 6, strokeWidth: 0, fill: '#6366f1' }}
                                name="Retention %"
                                filter="url(#glow)"
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
}
