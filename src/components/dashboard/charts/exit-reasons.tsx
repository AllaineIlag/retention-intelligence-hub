'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Cell } from 'recharts';
import { useState, useEffect, useTransition } from 'react';
import { getDetailedExitStats } from '@/app/actions/dashboard';
import { ChartTimeFilter, TimeRange } from '@/components/dashboard/analytics/chart-time-filter';
import { Skeleton } from '@/components/ui/skeleton';

interface ExitReasonsChartProps {
    initialData?: { name: string; value: number }[];
}

const COLORS = ['#f43f5e', '#facc15', '#3b82f6', '#8b5cf6', '#10b981'];

export function ExitReasonsChart({ initialData }: ExitReasonsChartProps) {
    const [timeRange, setTimeRange] = useState<TimeRange>('30d');
    const [data, setData] = useState<{ name: string; value: number }[]>(initialData || []);
    const [isPending, startTransition] = useTransition();
    const [hasLoaded, setHasLoaded] = useState(!!initialData);

    useEffect(() => {
        const fetchData = async () => {
            const endDate = new Date();
            const startDate = new Date();

            if (timeRange === '7d') startDate.setDate(endDate.getDate() - 7);
            if (timeRange === '30d') startDate.setDate(endDate.getDate() - 30);
            if (timeRange === '3m') startDate.setMonth(endDate.getMonth() - 3);

            startTransition(async () => {
                const res = await getDetailedExitStats(startDate, endDate);
                if (res.success && res.data) {
                    setData(res.data.topReasons);
                    setHasLoaded(true);
                }
            });
        };

        // Don't double fetch on init if we have data, unless filter changes
        // But for simplicity in this refactor, we can let it fetch or just fetch on change
        // If initialData is passed for a default range (e.g. 30d), we might skip first effect run
        // For now, simpler to just fetch when range changes.
        fetchData();
    }, [timeRange]);


    return (
        <Card className="col-span-1 border-white/5 bg-white/[0.02] backdrop-blur-sm overflow-hidden group h-[400px] flex flex-col">
            <CardHeader className="pb-4 flex flex-row items-start justify-between space-y-0">
                <div>
                    <CardTitle className="text-lg font-bold text-white tracking-tight">Top Exit Reasons</CardTitle>
                    <CardDescription className="text-[10px] uppercase tracking-widest text-muted-foreground/60">
                        Primary reasons cited.
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

                {data.length === 0 && hasLoaded ? (
                    <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
                        No data available for this period.
                    </div>
                ) : (
                    <div className="h-full w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data} layout="vertical" margin={{ left: -20, right: 30, top: 10, bottom: 10 }}>
                                <XAxis type="number" hide />
                                <YAxis
                                    type="category"
                                    dataKey="name"
                                    stroke="#525252"
                                    fontSize={10}
                                    tickLine={false}
                                    axisLine={false}
                                    width={120}
                                />
                                <Tooltip
                                    cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                                    contentStyle={{
                                        backgroundColor: 'rgba(10, 10, 10, 0.8)',
                                        backdropFilter: 'blur(12px)',
                                        borderRadius: '12px',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        boxShadow: '0 10px 25px -5px rgba(0,0,0,0.5)',
                                        color: '#fff'
                                    }}
                                />
                                <Bar dataKey="value" radius={[0, 10, 10, 0]} barSize={20}>
                                    {data.map((entry, index) => (
                                        <Cell
                                            key={`cell-${index}`}
                                            fill={COLORS[index % COLORS.length]}
                                            fillOpacity={0.8}
                                        />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
