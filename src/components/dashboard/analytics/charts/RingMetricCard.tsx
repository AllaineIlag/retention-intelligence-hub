'use client';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { cn } from '@/lib/utils';

interface RingMetricCardProps {
    title: string;
    value: string | number;
    subtext: string;
    progress: number; // 0 to 100
    color?: string; // Hex color for the ring
    className?: string;
    trend?: 'up' | 'down' | 'neutral'; // Optional trend indicator logic could be added later
}

export function RingMetricCard({
    title,
    value,
    subtext,
    progress,
    color = '#10b981',
    className
}: RingMetricCardProps) {
    const data = [
        { name: 'Value', value: progress },
        { name: 'Remaining', value: 100 - progress },
    ];

    // Track color: Dark zinc for contrast against the black card
    const TRACK_COLOR = '#27272a';

    return (
        <Card className={cn("border border-white/5 bg-white/[0.02] shadow-sm flex flex-col justify-between h-full rounded-3xl", className)}>
            <CardHeader className="pb-2">
                <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground line-clamp-1" title={title}>
                    {title}
                </h3>
            </CardHeader>
            <CardContent className="flex items-end justify-between pb-4 pt-0">
                <div className="flex flex-col">
                    <span className="text-2xl font-bold tracking-tight text-white">{value}</span>
                    <span className="text-[10px] text-muted-foreground uppercase font-medium mt-1">{subtext}</span>
                </div>

                {/* Ring Chart */}
                <div className="h-10 w-10 shrink-0 relative">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={data}
                                cx="50%"
                                cy="50%"
                                innerRadius={14}
                                outerRadius={18}
                                startAngle={90}
                                endAngle={-270}
                                dataKey="value"
                                stroke="none"
                                cornerRadius={3}
                            >
                                <Cell key="value" fill={color} />
                                <Cell key="remaining" fill={TRACK_COLOR} />
                            </Pie>
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
}
