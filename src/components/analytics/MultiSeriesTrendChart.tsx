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

import { MultiSeriesTrendData } from '@/app/dashboard/analytics/shared-actions';

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
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--chart-grid)" />

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
                    />

                    <Tooltip
                        cursor={{ stroke: 'var(--muted-foreground)', strokeWidth: 1, strokeDasharray: '3 3', opacity: 0.2 }}
                        contentStyle={{
                            backgroundColor: 'var(--popover)',
                            borderColor: 'var(--border)',
                            color: 'var(--popover-foreground)',
                            borderRadius: '0.75rem',
                            borderWidth: '1px',
                            boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'
                        }}
                        itemStyle={{ color: 'var(--foreground)' }}
                    />

                    <Legend
                        verticalAlign="top"
                        height={36}
                        iconType="circle"
                        wrapperStyle={{ fontSize: '10px', color: 'var(--muted-foreground)', textTransform: 'uppercase', fontWeight: 500 }}
                    />

                    {options.map((opt) => (
                        <Line
                            key={opt.label}
                            type="monotone"
                            dataKey={opt.label}
                            stroke={opt.color}
                            strokeWidth={2}
                            dot={{ r: 3, fill: 'var(--background)', strokeWidth: 2, stroke: opt.color }}
                            activeDot={{ r: 5, fill: opt.color }}
                        />
                    ))}
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}
