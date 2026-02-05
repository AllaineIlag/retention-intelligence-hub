'use client';

import {
    PieChart,
    Pie,
    Cell,
    Tooltip,
    ResponsiveContainer,
    Legend
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface CountryPieChartProps {
    data: { name: string; value: number }[];
    className?: string;
}

const COLORS = ['#adfa1d', '#10b981', '#3b82f6', '#8b5cf6', '#f43f5e'];

export function CountryPieChart({ data, className }: CountryPieChartProps) {
    return (
        <Card className={cn("col-span-1 border-white/5 bg-white/[0.02]", className)}>
            <CardHeader>
                <CardTitle className="text-sm font-medium tracking-tight uppercase">Where are they going?</CardTitle>
                <CardDescription className="text-xs">Top destinations for jobs abroad</CardDescription>
            </CardHeader>
            <CardContent className="h-[250px]">
                {data.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart margin={{ top: 0, bottom: 0 }}>
                            <Pie
                                data={data}
                                cx="50%"
                                cy="50%"
                                innerRadius={45}
                                outerRadius={70}
                                paddingAngle={2}
                                dataKey="value"
                                stroke="none"
                            >
                                {data.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip
                                contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '6px' }}
                                itemStyle={{ color: '#e4e4e7', fontSize: '12px' }}
                            />
                            <Legend
                                verticalAlign="bottom"
                                height={36}
                                iconType="circle"
                                iconSize={8}
                                wrapperStyle={{ fontSize: '10px', paddingTop: '10px' }}
                            />
                        </PieChart>
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
