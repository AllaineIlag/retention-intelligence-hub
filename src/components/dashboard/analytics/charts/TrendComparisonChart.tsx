'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { ComparisonDataPoint } from '@/app/actions/analytics';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

interface TrendComparisonChartProps {
    title: string;
    description?: string;
    data: ComparisonDataPoint[];
    meta?: { currentLabel: string; previousLabel: string };
    className?: string;
    loading?: boolean;
}

export function TrendComparisonChart({ title, description, data, meta, className, loading }: TrendComparisonChartProps) {
    if (loading) {
        return (
            <Card className={cn("col-span-1 h-[400px] flex flex-col items-center justify-center border-white/5 bg-white/[0.02]", className)}>
                <div className="animate-pulse text-muted-foreground">Loading trend analysis...</div>
            </Card>
        );
    }

    // Calculate percent change for header
    const totalCurrent = data.reduce((acc, cur) => acc + cur.current, 0);
    const totalPrevious = data.reduce((acc, cur) => acc + cur.previous, 0);
    const diff = totalCurrent - totalPrevious;
    const percentChange = totalPrevious > 0 ? Math.round((diff / totalPrevious) * 100) : 0;
    const isPositive = diff > 0; // "Positive" here means MORE turnover, which is technically bad, but graphically "up".
    // Context: Turnover increasing is usually bad (Red), decreasing is good (Green).
    const trendColor = isPositive ? 'text-rose-400' : 'text-emerald-400';
    const trendIcon = isPositive ? '▲' : '▼';

    return (
        <Card className={cn("col-span-1 border-white/5 bg-white/[0.02]", className)}>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="text-base font-medium tracking-tight">{title}</CardTitle>
                        <CardDescription>{description || 'Comparison with previous period'}</CardDescription>
                    </div>
                    {data.length > 0 && (
                        <div className="text-right">
                            <div className={cn("text-2xl font-bold", trendColor)}>
                                {totalCurrent} <span className="text-sm font-normal text-muted-foreground">exits</span>
                            </div>
                            <div className={cn("text-xs font-medium flex items-center justify-end gap-1", trendColor)}>
                                {diff !== 0 ? (
                                    <>
                                        {diff > 0 ? '+' : ''}{diff} ({diff > 0 ? '+' : ''}{percentChange}%) {trendIcon}
                                    </>
                                ) : (
                                    <span className="text-muted-foreground">No change</span>
                                )}
                            </div>
                            <div className="text-[10px] text-muted-foreground mt-1">
                                vs {totalPrevious} prev.
                            </div>
                        </div>
                    )}
                </div>
            </CardHeader>
            <CardContent>
                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorCurrent" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                            <XAxis
                                dataKey="date"
                                stroke="#71717a"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                                minTickGap={30} // Prevent overlapping labels
                            />
                            <YAxis
                                stroke="#71717a"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                                allowDecimals={false}
                            />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '6px' }}
                                labelStyle={{ color: '#a1a1aa', marginBottom: '8px' }}
                                content={({ active, payload, label }) => {
                                    if (active && payload && payload.length) {
                                        const current = payload.find(p => p.name === 'Current Period');
                                        const previous = payload.find(p => p.name === 'Previous Period');
                                        const currData = current?.payload as ComparisonDataPoint;

                                        return (
                                            <div className="bg-zinc-900 border border-white/10 p-3 rounded-lg shadow-xl text-xs space-y-2 min-w-[200px]">
                                                <div className="flex justify-between items-center pb-2 border-b border-white/5">
                                                    <span className="text-muted-foreground">Day</span>
                                                    <span className="font-semibold">{currData.date}</span>
                                                </div>
                                                <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                                                    <div className="text-blue-400 font-medium">{meta?.currentLabel || 'Current'}</div>
                                                    <div className="text-right font-mono">{currData.current}</div>
                                                    <div className="text-[10px] text-muted-foreground col-span-2 text-right">{currData.fullDateCurrent}</div>

                                                    <div className="text-zinc-500 font-medium mt-1">{meta?.previousLabel || 'Last Period'}</div>
                                                    <div className="text-right font-mono mt-1 text-zinc-500">{currData.previous}</div>
                                                    <div className="text-[10px] text-zinc-600 col-span-2 text-right">{currData.fullDatePrevious}</div>
                                                </div>
                                            </div>
                                        );
                                    }
                                    return null;
                                }}
                            />
                            {/* Previous Period (Ghost) */}
                            <Area
                                type="monotone"
                                dataKey="previous"
                                name="Previous Period"
                                stroke="#52525b"
                                strokeDasharray="5 5"
                                strokeWidth={2}
                                fill="none"
                                animationDuration={1000}
                            />
                            {/* Current Period (Primary) */}
                            <Area
                                type="monotone"
                                dataKey="current"
                                name="Current Period"
                                stroke="#2563eb"
                                strokeWidth={2}
                                fillOpacity={1}
                                fill="url(#colorCurrent)"
                                animationDuration={1500}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
}
