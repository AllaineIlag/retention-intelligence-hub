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

interface AttritionTrendData {
    month: string;
    [key: string]: string | number;
}

interface AttritionTrendChartProps {
    data: AttritionTrendData[];
}

const COLORS = [
    '#0052CC', // Corporate Blue
    '#EF4444', // Red (Voluntary)
    '#F59E0B', // Amber (Involuntary)
    '#10B981', // Emerald
    '#0EA5E9', // Sky Blue
];

interface CustomTooltipProps {
    active?: boolean;
    payload?: any[];
    label?: string;
}

const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
    if (active && payload && payload.length) {
        return (
            <div className="rounded-xl border border-border bg-popover/90 p-3 shadow-xl backdrop-blur-md">
                <p className="mb-2 text-[10px] font-semibold text-muted-foreground uppercase">{label}</p>
                <div className="space-y-1">
                    {payload.map((entry: any, index: number) => (
                        <div key={index} className="flex items-center gap-2 text-xs">
                            <div
                                className="h-2 w-2 rounded-full"
                                style={{ backgroundColor: entry.color }}
                            />
                            <span className="font-medium text-muted-foreground">
                                {entry.name}:
                            </span>
                            <span className="text-foreground">
                                {entry.value}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        );
    }
    return null;
};

export function AttritionTrendChart({ data }: AttritionTrendChartProps) {
    // Extract all unique keys from data (excluding 'month') to generate lines
    const allKeys = Array.from(new Set(data.flatMap(d => Object.keys(d).filter(k => k !== 'month'))));

    return (
        <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                <LineChart
                    data={data}
                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                >
                    <CartesianGrid
                        strokeDasharray="3 3"
                        vertical={false}
                        stroke="var(--chart-grid)"
                    />
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
                        dx={-10}
                    />
                    <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'var(--border)', strokeWidth: 2, opacity: 0.2 }} />
                    <Legend
                        wrapperStyle={{ paddingTop: '20px' }}
                        iconType="circle"
                    />
                    {allKeys.map((key, index) => (
                        <Line
                            key={key}
                            type="monotone"
                            dataKey={key}
                            stroke={COLORS[index % COLORS.length]}
                            strokeWidth={2}
                            dot={{ r: 4, fill: 'var(--background)', strokeWidth: 2 }}
                            activeDot={{ r: 6, strokeWidth: 0 }}
                        />
                    ))}
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}
