'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

interface TopExitReasonCardProps {
    reason: string;
    percentage: number;
}

export function TopExitReasonCard({ reason, percentage }: TopExitReasonCardProps) {
    const data = [
        { name: 'Value', value: percentage },
        { name: 'Remaining', value: 100 - percentage },
    ];

    // Emerald for the active segment, Darker Gray for the track
    // Reference image uses a dark track. 
    const COLORS = ['#10b981', '#27272a'];

    return (
        <Card className="rounded-xl border border-white/5 bg-white/[0.02] shadow-sm flex flex-col justify-between h-full">
            <CardHeader className="pb-2">
                <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-1">Top Exit Reason</h3>
                <CardTitle className="text-sm font-medium leading-tight text-zinc-100 line-clamp-2 min-h-[2.5em]">
                    {reason}
                </CardTitle>
            </CardHeader>
            <CardContent className="flex items-end justify-between pb-4 pt-0">
                <div className="flex flex-col">
                    <span className="text-3xl font-bold tracking-tight text-white">{percentage}%</span>
                    <span className="text-[10px] text-muted-foreground uppercase font-medium">Of Total Exits</span>
                </div>

                {/* Ring Chart */}
                <div className="h-12 w-12 shrink-0 relative">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={data}
                                cx="50%"
                                cy="50%"
                                innerRadius={16}
                                outerRadius={21}
                                startAngle={90}
                                endAngle={-270}
                                dataKey="value"
                                stroke="none"
                                cornerRadius={4}
                            >
                                <Cell key="value" fill={COLORS[0]} />
                                <Cell key="remaining" fill={COLORS[1]} />
                            </Pie>
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
}
