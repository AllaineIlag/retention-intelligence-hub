'use client';

import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    ReferenceArea
} from 'recharts';

import { ScoreTrendData } from '@/app/dashboard/deep-dive/shared-actions';

interface ScoreTrendChartProps {
    data: ScoreTrendData[];
    color?: string;
}

export function ScoreTrendChart({ data, color = '#6366f1' }: ScoreTrendChartProps) {
    if (!data || data.length === 0) {
        return (
            <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                No trend data available
            </div>
        );
    }

    return (
        <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <defs>
                        <linearGradient id="gradientScore" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                            <stop offset="95%" stopColor={color} stopOpacity={0} />
                        </linearGradient>
                    </defs>

                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.1} />

                    <XAxis
                        dataKey="month"
                        stroke="var(--muted-foreground)"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        dy={10}
                    />

                    <YAxis
                        stroke="var(--muted-foreground)"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        domain={[0, 5]}
                        ticks={[1, 2, 3, 4, 5]}
                    />

                    <Tooltip
                        contentStyle={{
                            backgroundColor: 'var(--popover)',
                            borderColor: 'var(--border)',
                            color: 'var(--popover-foreground)',
                            borderRadius: '0.75rem',
                            borderWidth: '1px',
                            boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'
                        }}
                        itemStyle={{ color: 'var(--foreground)' }}
                        formatter={(value: any) => [value, 'Avg Score']}
                    />

                    {/* Background bands for context */}
                    <ReferenceArea y1={0} y2={2.5} fill="rgba(239, 68, 68, 0.05)" /> {/* Red Zone */}
                    <ReferenceArea y1={2.5} y2={3.5} fill="rgba(245, 158, 11, 0.05)" /> {/* Amber Zone */}
                    <ReferenceArea y1={3.5} y2={5} fill="rgba(16, 185, 129, 0.05)" /> {/* Green Zone */}

                    <Line
                        type="monotone"
                        dataKey="average"
                        stroke={color}
                        strokeWidth={3}
                        dot={{ r: 4, fill: 'var(--background)', strokeWidth: 2, stroke: color }}
                        activeDot={{ r: 6, fill: color }}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}
