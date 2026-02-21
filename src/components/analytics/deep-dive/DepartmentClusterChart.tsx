'use client';

import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend
} from 'recharts';

interface DepartmentClusterData {
    department: string;
    totalCount: number;
    [reason: string]: number | string;
}

interface DepartmentClusterChartProps {
    data: DepartmentClusterData[];
}

const COLORS = [
    '#0052CC', // Corporate Blue
    '#0EA5E9', // Sky Blue
    '#F59E0B', // Amber
    '#10B981', // Emerald
    '#14B8A6', // Teal
    '#EF4444', // Red
    '#EC4899', // Pink
    '#84CC16', // Lime
    '#F97316', // Orange
];

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        const total = payload[0].payload.totalCount;
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
                            <span className="font-bold text-foreground">
                                {entry.value}
                            </span>
                            <span className="text-muted-foreground/60">
                                ({total > 0 ? ((entry.value / total) * 100).toFixed(0) : 0}%)
                            </span>
                        </div>
                    ))}
                    <div className="mt-2 text-[10px] text-muted-foreground border-t border-border pt-2 uppercase font-medium">
                        Total Exits: <span className="text-foreground font-bold">{total}</span>
                    </div>
                </div>
            </div>
        );
    }
    return null;
};

export function DepartmentClusterChart({ data }: DepartmentClusterChartProps) {
    // Extract reason keys dynamically (excluding 'department' and 'totalCount')
    const allKeys = Array.from(new Set(data.flatMap(d => Object.keys(d).filter(k => k !== 'department' && k !== 'totalCount'))));

    return (
        <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart
                    data={data}
                    layout="vertical"
                    margin={{ top: 10, right: 30, left: 40, bottom: 0 }}
                    stackOffset="expand" // This makes it a 100% stacked bar chart
                >
                    <CartesianGrid
                        strokeDasharray="3 3"
                        horizontal={false}
                        stroke="var(--border)"
                        opacity={0.1}
                    />
                    <XAxis
                        type="number"
                        stroke="var(--muted-foreground)"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(value) => `${(value * 100).toFixed(0)}%`}
                    />
                    <YAxis
                        dataKey="department"
                        type="category"
                        stroke="var(--muted-foreground)"
                        fontSize={11}
                        tickLine={false}
                        axisLine={false}
                        width={100}
                    />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: 'currentColor', opacity: 0.05 }} />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />

                    {allKeys.map((key, index) => (
                        <Bar
                            key={key}
                            dataKey={key}
                            stackId="a"
                            fill={COLORS[index % COLORS.length]}
                            radius={[0, 0, 0, 0]}
                            barSize={20}
                            animationDuration={1500}
                        />
                    ))}
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}
