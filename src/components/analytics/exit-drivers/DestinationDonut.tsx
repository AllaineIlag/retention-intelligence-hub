'use client'

import { Card, CardContent, CardHeader, CardDescription } from "@/components/ui/card"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts"
import { cn } from "@/lib/utils"

interface DestinationDonutProps {
    data: { name: string; value: number }[]
    className?: string
}

const COLORS = ['#6366f1', '#8b5cf6', '#a78bfa', '#c4b5fd', '#3b82f6', '#60a5fa', '#93c5fd'];

export function DestinationDonut({ data, className }: DestinationDonutProps) {
    const hasData = data.length > 0;
    const total = data.reduce((a, b) => a + b.value, 0);

    return (
        <Card className={cn("border border-white/5 bg-white/[0.02] shadow-sm rounded-3xl relative overflow-hidden", className)}>
            <CardHeader className="pb-2">
                <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Destination Breakdown
                </h3>
                <CardDescription className="text-[10px] text-muted-foreground uppercase font-medium">
                    Where employees go after leaving
                </CardDescription>
            </CardHeader>
            <CardContent>
                {!hasData ? (
                    <div className="h-[300px] flex items-center justify-center text-muted-foreground text-sm">
                        No data available
                    </div>
                ) : (
                    <div className="h-[300px] w-full min-w-0">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={data}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={65}
                                    outerRadius={100}
                                    dataKey="value"
                                    stroke="none"
                                    cornerRadius={4}
                                    paddingAngle={2}
                                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                >
                                    {data.map((_, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: 'rgba(0, 0, 0, 0.85)',
                                        borderColor: 'rgba(255,255,255,0.1)',
                                        borderRadius: '12px',
                                        backdropFilter: 'blur(8px)',
                                    }}
                                    itemStyle={{ color: '#fff', fontSize: '12px' }}
                                    formatter={(value: number) => [`${value} employees (${total > 0 ? Math.round((value / total) * 100) : 0}%)`, '']}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
