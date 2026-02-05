'use client';

import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

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

export function QuickWinsCharts({ pullFactors, careerGrowth, payPerception, benefits, workload }: QuickWinsChartsProps) {
    return (
        <div className="flex flex-col h-full gap-4">
            <MiniChart title="Key Pull Factors" data={pullFactors} color="#f472b6" /> {/* Pink */}
            <MiniChart title="Career Growth" data={careerGrowth} color="#34d399" /> {/* Green */}
            <MiniChart title="Pay Perception" data={payPerception} color="#60a5fa" /> {/* Blue */}
            <MiniChart title="Feel About Benefits" data={benefits} color="#a78bfa" /> {/* Purple */}
            <MiniChart title="Amount of Work" data={workload} color="#fbbf24" /> {/* Amber */}
        </div>
    );
}

function MiniChart({ title, data, color }: { title: string, data: QuickWinData[], color: string }) {
    return (
        <Card className="border-white/5 bg-white/[0.02]">
            <CardHeader className="py-3 px-4">
                <CardTitle className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{title}</CardTitle>
            </CardHeader>
            <CardContent className="py-0 px-4 pb-3 h-[100px]">
                {data && data.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data} layout="vertical" margin={{ left: 0, right: 10, top: 0, bottom: 0 }}>
                            <XAxis type="number" hide />
                            <YAxis
                                dataKey="name"
                                type="category"
                                width={80}
                                fontSize={9}
                                tickLine={false}
                                axisLine={false}
                                stroke="#71717a"
                                interval={0}
                            />
                            <Tooltip
                                cursor={{ fill: 'white', opacity: 0.05 }}
                                contentStyle={{ background: '#18181b', border: 'none', fontSize: '10px', color: '#fff' }}
                            />
                            <Bar dataKey="value" fill={color} radius={[0, 2, 2, 0]} barSize={12} />
                        </BarChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="flex items-center justify-center h-full text-[10px] text-muted-foreground">
                        No data
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
