'use client';

import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell
} from 'recharts';

import { DepartmentScoreData } from '@/app/dashboard/deep-dive/shared-actions';

interface DepartmentScoreChartProps {
    data: DepartmentScoreData[];
}

export function DepartmentScoreChart({ data }: DepartmentScoreChartProps) {
    if (!data || data.length === 0) {
        return (
            <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                No department data available
            </div>
        );
    }

    // Color logic based on score
    const getColor = (score: number) => {
        if (score >= 4.0) return '#10b981'; // Green
        if (score >= 3.0) return '#f59e0b'; // Amber
        return '#ef4444'; // Red
    };

    return (
        <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart
                    data={data}
                    layout="vertical"
                    margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
                >
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--border)" opacity={0.1} />

                    <XAxis
                        type="number"
                        domain={[0, 5]}
                        ticks={[1, 2, 3, 4, 5]}
                        stroke="var(--muted-foreground)"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                    />

                    <YAxis
                        dataKey="department"
                        type="category"
                        stroke="var(--muted-foreground)" // Lighter text for labels
                        fontSize={11}
                        width={100}
                        tickLine={false}
                        axisLine={false}
                    />

                    <Tooltip
                        cursor={{ fill: 'currentColor', opacity: 0.05 }}
                        contentStyle={{
                            backgroundColor: 'var(--popover)',
                            borderColor: 'var(--border)',
                            color: 'var(--popover-foreground)',
                            borderRadius: '0.75rem',
                            borderWidth: '1px'
                        }}
                        itemStyle={{ color: 'var(--foreground)' }}
                        formatter={(value: any) => [value, 'Avg Score']}
                    />

                    <Bar
                        dataKey="score"
                        radius={[0, 4, 4, 0]}
                        barSize={20}
                    >
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={getColor(entry.score)} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}
