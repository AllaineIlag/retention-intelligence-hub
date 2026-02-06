'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartTimeFilter } from '@/components/dashboard/analytics/chart-time-filter';
import { getRateOfPayStats } from '@/app/actions/dashboard';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Loader2, DollarSign } from 'lucide-react';
import { subDays, startOfDay, subMonths } from 'date-fns';

export function RateOfPayChart() {
    const [timeRange, setTimeRange] = useState('30d');
    const [data, setData] = useState<{ name: string; value: number }[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // [DEV] Static Data for Visualization
                const MOCK_DATA = [
                    { name: 'Very compensating', value: 8 },
                    { name: 'Fair enough', value: 22 },
                    { name: 'A bit low', value: 30 },
                    { name: 'Very low', value: 15 }
                ];

                // Simulate network delay
                await new Promise(resolve => setTimeout(resolve, 500));
                setData(MOCK_DATA);

                /*
                const now = new Date();
                let startDate = startOfDay(subDays(now, 30));

                if (timeRange === '7d') startDate = startOfDay(subDays(now, 7));
                if (timeRange === '3m') startDate = startOfDay(subMonths(now, 3));

                const result = await getRateOfPayStats({ startDate, endDate: now });
                if (result.success && result.data && result.data.length > 0) {
                     setData(result.data);
                }
                */
            } catch (error) {
                console.error('Failed to fetch rate of pay stats:', error);
                // Fallback
                setData([
                    { name: 'Very compensating', value: 8 },
                    { name: 'Fair enough', value: 22 },
                    { name: 'A bit low', value: 30 },
                    { name: 'Very low', value: 15 }
                ]);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [timeRange]);

    const getColor = (name: string) => {
        if (name.includes('Very compensating')) return '#10b981'; // Emerald 500
        if (name.includes('Fair enough')) return '#34d399';      // Emerald 400
        if (name.includes('A bit low')) return '#fbbf24';        // Amber 400
        if (name.includes('Very low')) return '#ef4444';         // Rose 500
        return '#94a3b8';
    };

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-slate-900 border border-slate-800 p-2 rounded-lg shadow-xl">
                    <p className="text-slate-200 font-medium text-sm">{label}</p>
                    <p className="text-white font-bold text-lg">
                        {payload[0].value} <span className="text-xs text-slate-400 font-normal">Responses</span>
                    </p>
                </div>
            );
        }
        return null;
    };

    return (
        <Card className="col-span-1 h-[400px] bg-white/5 border-white/10 backdrop-blur-md flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div className="space-y-1">
                    <CardTitle className="text-lg font-medium text-slate-200 flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-emerald-400" />
                        Perception of Pay
                    </CardTitle>
                    <CardDescription className="text-xs text-slate-400">
                        Compensation competitiveness
                    </CardDescription>
                </div>
                {/* Cast to any to avoid type check issues during dev */}
                <ChartTimeFilter value={timeRange as any} onChange={setTimeRange as any} />
            </CardHeader>
            <CardContent className="flex-1 w-full min-h-0 pl-0">
                {loading ? (
                    <div className="h-full flex items-center justify-center">
                        <Loader2 className="h-8 w-8 animate-spin text-slate-500" />
                    </div>
                ) : (
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                            data={data}
                            layout="vertical"
                            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#ffffff10" />
                            <XAxis type="number" hide />
                            <YAxis
                                dataKey="name"
                                type="category"
                                width={120}
                                tick={{ fill: '#94a3b8', fontSize: 11 }}
                                tickLine={false}
                                axisLine={false}
                            />
                            <Tooltip content={<CustomTooltip />} cursor={{ fill: '#ffffff05' }} />
                            <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={24} animationDuration={1500}>
                                {data.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={getColor(entry.name)} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                )}
            </CardContent>
        </Card>
    );
}
