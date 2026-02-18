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

                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />

                    <XAxis
                        dataKey="month"
                        stroke="#6b7280"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        dy={10}
                    />

                    <YAxis
                        stroke="#6b7280"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        domain={[0, 5]}
                        ticks={[1, 2, 3, 4, 5]}
                    />

                    <Tooltip
                        contentStyle={{
                            backgroundColor: '#1f2937',
                            borderColor: '#374151',
                            color: '#f3f4f6',
                            borderRadius: '0.5rem'
                        }}
                        itemStyle={{ color: '#e5e7eb' }}
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
                        dot={{ r: 4, fill: '#1f2937', strokeWidth: 2, stroke: color }}
                        activeDot={{ r: 6, fill: color }}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}
