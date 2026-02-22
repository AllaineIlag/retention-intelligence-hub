'use client';

import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TurnoverDataPoint } from '@/app/actions/analytics';
import { cn } from '@/lib/utils';

interface DepartmentChartProps {
    data: TurnoverDataPoint[];
    className?: string;
}

export function DepartmentChart({ data, className }: DepartmentChartProps) {
    return (
        <Card className={cn("col-span-1 border-white/5 bg-white/[0.02]", className)}>
            <CardHeader>
                <CardTitle className="text-base font-medium tracking-tight">Departures by Department</CardTitle>
                <CardDescription>Total exits per department</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px]">
                {data.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data} layout="vertical" margin={{ left: 0, right: 30 }}>
                            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--chart-grid)" />
                            <XAxis type="number" hide />
                            <YAxis
                                dataKey="name"
                                type="category"
                                width={100}
                                fontSize={11}
                                tickLine={false}
                                axisLine={false}
                                stroke="#a1a1aa"
                            />
                            <Tooltip
                                cursor={{ fill: 'white', opacity: 0.05 }}
                                contentStyle={{ backgroundColor: 'var(--popover)', border: '1px solid var(--border)', borderRadius: '6px' }}
                                itemStyle={{ color: '#e4e4e7', fontSize: '12px' }}
                            />
                            <Bar
                                dataKey="value"
                                fill="#adfa1d"
                                radius={[0, 4, 4, 0]}
                                barSize={24}
                                name="Exits"
                                animationDuration={1000}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="flex h-full items-center justify-center text-muted-foreground text-xs">
                        No data available
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
