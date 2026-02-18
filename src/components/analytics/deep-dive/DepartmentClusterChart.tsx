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
    '#EF4444', // Red
    '#F59E0B', // Amber
    '#10B981', // Emerald
    '#8B5CF6', // Violet
    '#3B82F6', // Blue
    '#EC4899', // Pink
    '#6366F1', // Indigo
    '#14B8A6', // Teal
    '#84CC16', // Lime
    '#F97316', // Orange
];

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        const total = payload[0].payload.totalCount;
        return (
            <div className="rounded-lg border border-white/10 bg-[#0f0f11]/90 p-3 shadow-xl backdrop-blur-md">
                <p className="mb-2 text-sm font-semibold text-white">{label}</p>
                <div className="space-y-1">
                    {payload.map((entry: any, index: number) => (
                        <div key={index} className="flex items-center gap-2 text-xs">
                            <div
                                className="h-2 w-2 rounded-full"
                                style={{ backgroundColor: entry.color }}
                            />
                            <span className="font-medium text-gray-300">
                                {entry.name}:
                            </span>
                            <span className="font-bold text-white">
                                {entry.value}
                            </span>
                            <span className="text-gray-500">
                                ({((entry.value / total) * 100).toFixed(0)}%)
                            </span>
                        </div>
                    ))}
                    <div className="mt-2 text-xs text-gray-400 border-t border-white/10 pt-1">
                        Total Exits: <span className="text-white font-medium">{total}</span>
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
                        stroke="rgba(255,255,255,0.05)"
                    />
                    <XAxis
                        type="number"
                        stroke="#71717a"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(value) => `${(value * 100).toFixed(0)}%`}
                    />
                    <YAxis
                        dataKey="department"
                        type="category"
                        stroke="#71717a"
                        fontSize={11}
                        tickLine={false}
                        axisLine={false}
                        width={100}
                    />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
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
