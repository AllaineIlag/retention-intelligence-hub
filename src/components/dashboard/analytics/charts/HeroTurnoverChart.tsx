'use client';

import { useState } from 'react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    AreaChart,
    Area,
    ReferenceLine
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TurnoverDataPoint } from '@/app/actions/analytics';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface HeroTurnoverChartProps {
    deptData: TurnoverDataPoint[];
    monthData: { name: string; resignations: number; retention: number }[];
    className?: string;
}

export function HeroTurnoverChart({ deptData, monthData, className }: HeroTurnoverChartProps) {
    const [view, setView] = useState<'department' | 'month'>('department');

    // 2% Target Calculation
    // Target is 2% of 5000 headcount = 100 employees per month Max.
    const TARGET_THRESHOLD = 100;

    return (
        <Card className={cn("col-span-1 border-white/5 bg-white/[0.02]", className)}>
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle className="text-base font-medium tracking-tight">Turnover Analysis</CardTitle>
                    <CardDescription>
                        {view === 'department' ? 'Exits breakdown by department' : 'Monthly turnover trend vs Target'}
                    </CardDescription>
                </div>
                <div className="flex bg-muted/20 p-1 rounded-lg">
                    <Button
                        variant="ghost"
                        size="sm"
                        className={cn("h-7 text-xs", view === 'department' && "bg-white/10 text-white")}
                        onClick={() => setView('department')}
                    >
                        By Department
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        className={cn("h-7 text-xs", view === 'month' && "bg-white/10 text-white")}
                        onClick={() => setView('month')}
                    >
                        By Month
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="h-[350px]">
                {view === 'department' ? (
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={deptData} margin={{ left: 0, right: 0, top: 10, bottom: 20 }}>
                            <CartesianGrid strokeDasharray="3 3" opacity={0.1} vertical={false} />
                            <XAxis
                                dataKey="name"
                                fontSize={11}
                                tickLine={false}
                                axisLine={false}
                                stroke="#a1a1aa"
                                interval={0}
                                angle={-15}
                                textAnchor="end"
                            />
                            <YAxis
                                type="number"
                                fontSize={11}
                                tickLine={false}
                                axisLine={false}
                                stroke="#a1a1aa"
                            />
                            <Tooltip
                                cursor={{ fill: 'white', opacity: 0.05 }}
                                contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '6px' }}
                                itemStyle={{ color: '#e4e4e7', fontSize: '12px' }}
                            />
                            <Bar
                                dataKey="value"
                                fill="#14b8a6"
                                radius={[4, 4, 0, 0]}
                                barSize={40}
                                name="Exits"
                                animationDuration={1000}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                ) : (
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={monthData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorResignations" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <XAxis
                                dataKey="name"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                                stroke="#52525b"
                                dy={10}
                            />
                            <YAxis
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                                stroke="#52525b"
                            />
                            <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.1} />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '6px' }}
                                itemStyle={{ color: '#e4e4e7', fontSize: '12px' }}
                            />
                            <ReferenceLine
                                y={TARGET_THRESHOLD}
                                stroke="#fbbf24"
                                strokeDasharray="3 3"
                                label={{ position: 'insideTopRight', value: '2% Target (100)', fill: '#fbbf24', fontSize: 10 }}
                            />
                            <Area
                                type="monotone"
                                dataKey="resignations"
                                stroke="#f43f5e"
                                fillOpacity={1}
                                fill="url(#colorResignations)"
                                name="Resignations"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                )}
            </CardContent>
        </Card>
    );
}
