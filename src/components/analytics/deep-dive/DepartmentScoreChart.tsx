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
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(255,255,255,0.05)" />

                    <XAxis
                        type="number"
                        domain={[0, 5]}
                        ticks={[1, 2, 3, 4, 5]}
                        stroke="#6b7280"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                    />

                    <YAxis
                        dataKey="department"
                        type="category"
                        stroke="#9ca3af" // Lighter text for labels
                        fontSize={11}
                        width={100}
                        tickLine={false}
                        axisLine={false}
                    />

                    <Tooltip
                        cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                        contentStyle={{
                            backgroundColor: '#1f2937',
                            borderColor: '#374151',
                            color: '#f3f4f6',
                            borderRadius: '0.5rem'
                        }}
                        itemStyle={{ color: '#e5e7eb' }}
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
