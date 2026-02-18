'use client';

import { Card, CardContent } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { CorrelationData } from "@/app/dashboard/deep-dive/shared-actions";

interface CorrelationCardProps {
    data: CorrelationData;
    metricLabel: string; // e.g. "Low Pay"
}

export function CorrelationCard({ data, metricLabel }: CorrelationCardProps) {
    // Chart Data for Donut
    // Slice 1: Those who left because of this reason (Red)
    // Slice 2: Other low scorers (Gray)
    const chartData = [
        { name: 'Correlated', value: data.percentage },
        { name: 'Other', value: 100 - data.percentage },
    ];

    const COLORS = ['#ef4444', '#374151']; // Red vs Gray

    return (
        <div className="flex flex-col sm:flex-row h-full items-center gap-6 p-4">
            {/* Left: Donut Chart */}
            <div className="h-[180px] w-[180px] shrink-0 relative">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={chartData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                            startAngle={90}
                            endAngle={-270}
                            stroke="none"
                        >
                            {chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip
                            contentStyle={{
                                backgroundColor: '#1f2937',
                                borderColor: '#374151',
                                color: '#f3f4f6',
                                borderRadius: '0.5rem'
                            }}
                            itemStyle={{ color: '#e5e7eb' }}
                        />
                    </PieChart>
                </ResponsiveContainer>

                {/* Center Stat */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-3xl font-bold text-white">{data.percentage}%</span>
                    <span className="text-xs text-muted-foreground uppercase">Correlation</span>
                </div>
            </div>

            {/* Right: Insight Text */}
            <div className="flex-1 space-y-4">
                <div>
                    <h3 className="text-lg font-medium text-white mb-1">{metricLabel} & {data.topReason || 'Attrition'}</h3>
                    <p className="text-sm text-gray-400">
                        Analyzing users who rated {metricLabel} poorly (1-2 Stars).
                    </p>
                </div>

                <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20">
                    <p className="text-sm text-red-200">
                        <span className="font-bold text-red-400">Insight:</span> {data.insight}
                    </p>
                </div>

                <div className="flex gap-4 text-xs text-muted-foreground">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-red-500" />
                        <span>Left due to {data.topReason}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-gray-700" />
                        <span>Other Reasons</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
