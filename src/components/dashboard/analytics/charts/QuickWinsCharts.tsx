'use client';

import {
    PieChart,
    Pie,
    Cell,
    ResponsiveContainer,
    Tooltip
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface QuickWinData {
    name: string;
    value: number;
}

interface QuickWinsChartsProps {
    pullFactors: QuickWinData[];
    careerGrowth: QuickWinData[];
    payPerception: QuickWinData[];
    benefits: QuickWinData[];
    workload: QuickWinData[];
}

const COLORS = [
    '#6366f1', // Indigo
    '#10b981', // Emerald
    '#f59e0b', // Amber
    '#14b8a6', // Teal
    '#8b5cf6', // Violet
];

export function QuickWinsCharts({ pullFactors, careerGrowth, payPerception, benefits, workload }: QuickWinsChartsProps) {
    return (
        <div className="flex flex-col gap-4 h-full min-h-0">
            <DonutMetricCard title="Key Pull Factors" data={pullFactors} unit="Resp" className="flex-1" />
            <DonutMetricCard title="Career Growth" data={careerGrowth} unit="Resp" className="flex-1" />
            <DonutMetricCard title="Pay Perception" data={payPerception} unit="Resp" className="flex-1" />
            <DonutMetricCard title="Feel About Benefits" data={benefits} unit="Resp" className="flex-1" />
            <DonutMetricCard title="Amount of Work" data={workload} unit="Resp" className="flex-1" />
        </div>
    );
}

function DonutMetricCard({ title, data, unit, className }: { title: string, data: QuickWinData[], unit: string, className?: string }) {
    const total = data.reduce((acc, curr) => acc + curr.value, 0);

    return (
        <Card className={cn("flex flex-col border-white/5 bg-white/[0.02] min-h-0 rounded-3xl shadow-sm hover:bg-white/[0.04] transition-colors duration-300 overflow-hidden", className)}>
            <CardHeader className="py-3 px-5 shrink-0">
                <CardTitle className="text-sm font-medium text-zinc-100">{title}</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-1 items-center pb-4 px-2 min-h-0">
                {/* Donut Chart (Left) */}
                <div className="relative w-1/2 h-full min-h-[100px] flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={data}
                                cx="50%"
                                cy="50%"
                                innerRadius="65%"
                                outerRadius="85%"
                                paddingAngle={5}
                                dataKey="value"
                                stroke="none"
                                cornerRadius={4}
                            >
                                {data.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip
                                contentStyle={{ backgroundColor: '#18181b', border: 'none', borderRadius: '8px', color: '#fff' }}
                                itemStyle={{ color: '#fff' }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                    {/* Center Text */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                        <span className="text-lg font-bold text-white leading-none">{total}</span>
                        <span className="text-[10px] text-muted-foreground uppercase">{unit}</span>
                    </div>
                </div>

                {/* Legend (Right) */}
                <div className="w-1/2 flex flex-col justify-center gap-2 pl-2">
                    {data.map((item, index) => (
                        <div key={index} className="flex items-center gap-2">
                            <div
                                className="w-2 h-2 rounded-full shrink-0"
                                style={{ backgroundColor: COLORS[index % COLORS.length] }}
                            />
                            <div className="flex flex-col min-w-0">
                                <span className="text-[10px] text-zinc-400 truncate">{item.name}</span>
                                {/* Optional: Show Value next to name? */}
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
