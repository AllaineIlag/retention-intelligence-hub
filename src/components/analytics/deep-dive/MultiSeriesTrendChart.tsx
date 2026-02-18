'use client';

import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend
} from 'recharts';

import { MultiSeriesTrendData } from '@/app/dashboard/deep-dive/shared-actions';

interface MultiSeriesTrendChartProps {
    data: MultiSeriesTrendData[];
    options: { label: string; color: string }[];
}

export function MultiSeriesTrendChart({ data, options }: MultiSeriesTrendChartProps) {
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
                    />

                    <Tooltip
                        contentStyle={{
                            backgroundColor: '#1f2937',
                            borderColor: '#374151',
                            color: '#f3f4f6',
                            borderRadius: '0.5rem'
                        }}
                        itemStyle={{ color: '#e5e7eb' }}
                    />

                    <Legend
                        verticalAlign="top"
                        height={36}
                        iconType="circle"
                        wrapperStyle={{ fontSize: '12px', color: '#9ca3af' }}
                    />

                    {options.map((opt) => (
                        <Line
                            key={opt.label}
                            type="monotone"
                            dataKey={opt.label}
                            stroke={opt.color}
                            strokeWidth={2}
                            dot={{ r: 3, fill: '#1f2937', strokeWidth: 2, stroke: opt.color }}
                            activeDot={{ r: 5, fill: opt.color }}
                        />
                    ))}
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}
