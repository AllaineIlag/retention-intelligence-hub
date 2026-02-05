'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { TurnoverDataPoint } from '@/app/actions/analytics';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface DonutChartProps {
    title: string;
    description?: string;
    data: TurnoverDataPoint[];
    totalResponses?: number;
    className?: string;
    colors?: string[];
}

const DEFAULT_COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#a855f7'];

export function DonutChart({ title, description, data, totalResponses, className, colors = DEFAULT_COLORS }: DonutChartProps) {
    // Calculate dominant percentage for center text
    const dominantItem = data.length > 0 ? data.reduce((prev, current) => (prev.value > current.value) ? prev : current) : null;
    const centerPercentage = dominantItem && totalResponses ? Math.round((dominantItem.value / totalResponses) * 100) : 0;

    return (
        <Card className={cn("col-span-1 h-full flex flex-col border-white/5 bg-white/[0.02]", className)}>
            <CardHeader className="pb-0">
                <CardTitle className="text-base font-medium tracking-tight">{title}</CardTitle>
                {description && <CardDescription className="text-xs">{description}</CardDescription>}
            </CardHeader>
            <CardContent className="flex-1 min-h-[200px] relative">
                {data.length > 0 ? (
                    <div className="h-[200px] w-full relative">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={data}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={2}
                                    dataKey="value"
                                >
                                    {data.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={colors[index % colors.length]} strokeWidth={0} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '6px' }}
                                    itemStyle={{ color: '#e4e4e7', fontSize: '12px' }}
                                    formatter={(value: any) => [`${value} responses`, 'Count'] as [string, string]}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                            <span className="text-3xl font-bold tracking-tighter">{centerPercentage}%</span>
                            <span className="text-[10px] uppercase tracking-widest text-muted-foreground/50 truncate max-w-[100px] text-center">
                                {dominantItem?.name}
                            </span>
                        </div>
                    </div>
                ) : (
                    <div className="flex h-full items-center justify-center text-muted-foreground text-xs uppercase tracking-widest">No Data</div>
                )}
                {/* Legend */}
                <div className="mt-4 flex flex-wrap justify-center gap-3">
                    {data.slice(0, 4).map((item, index) => (
                        <div key={item.name} className="flex items-center gap-1.5">
                            <div className="h-2 w-2 rounded-full" style={{ backgroundColor: colors[index % colors.length] }} />
                            <span className="text-[10px] text-muted-foreground">{item.name}</span>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
