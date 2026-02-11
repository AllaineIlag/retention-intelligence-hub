'use client'

import { Card, CardContent, CardHeader, CardDescription } from "@/components/ui/card"
import { ScatterChart, Scatter, XAxis, YAxis, ResponsiveContainer, Tooltip, ReferenceLine, ZAxis } from "recharts"
import { cn } from "@/lib/utils"

interface ScatterPoint {
    workloadScore: number
    recommendationScore: number
    name: string
}

interface WorkloadScatterProps {
    data: ScatterPoint[]
    className?: string
}

const WORKLOAD_LABELS: Record<number, string> = {
    1: 'Light',
    2: 'Mgbl',
    3: 'Mod',
    4: 'Heavy',
    5: 'V.Heavy',
};

export function WorkloadScatter({ data, className }: WorkloadScatterProps) {
    return (
        <Card className={cn("border border-white/5 bg-white/[0.02] shadow-sm rounded-3xl relative overflow-hidden", className)}>
            <CardHeader className="pb-2">
                <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Workload vs Recommendation
                </h3>
                <CardDescription className="text-[10px] text-muted-foreground uppercase font-medium">
                    Does burnout kill their loyalty?
                </CardDescription>
            </CardHeader>
            <CardContent>
                {data.length === 0 ? (
                    <div className="h-[280px] flex items-center justify-center text-muted-foreground text-sm">No data available</div>
                ) : (
                    <div className="h-[280px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <ScatterChart margin={{ top: 10, right: 20, bottom: 10, left: 0 }}>
                                <XAxis
                                    type="number" dataKey="workloadScore" name="Workload"
                                    domain={[0.5, 5.5]}
                                    ticks={[1, 2, 3, 4, 5]}
                                    tickFormatter={(v: any) => WORKLOAD_LABELS[v] || String(v)}
                                    tick={{ fill: '#a1a1aa', fontSize: 10 }} axisLine={false} tickLine={false}
                                />
                                <YAxis
                                    type="number" dataKey="recommendationScore" name="Recommendation"
                                    domain={[0, 100]}
                                    tick={{ fill: '#71717a', fontSize: 10 }} axisLine={false} tickLine={false}
                                    tickFormatter={(v: any) => `${v}`}
                                />
                                <ZAxis range={[50, 50]} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: 'rgba(0,0,0,0.85)', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px', backdropFilter: 'blur(8px)' }}
                                    itemStyle={{ fontSize: '11px', color: '#fff' }}
                                    formatter={(value: any, name: any) => {
                                        if (name === 'Workload') return WORKLOAD_LABELS[value] || value;
                                        if (name === 'Recommendation') return `${value}/100`;
                                        return value;
                                    }}
                                    labelFormatter={(_, payload) => {
                                        if (payload && payload[0]) {
                                            return (payload[0].payload as ScatterPoint).name;
                                        }
                                        return '';
                                    }}
                                />
                                {/* Reference line at 50 recommendation */}
                                <ReferenceLine y={50} stroke="rgba(255,255,255,0.15)" strokeDasharray="4 4" label={{ value: 'Would Recommend ↑', position: 'insideTopLeft', fill: '#71717a', fontSize: 9 }} />
                                <Scatter data={data} fill="#6366f1" fillOpacity={0.7} />
                            </ScatterChart>
                        </ResponsiveContainer>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
