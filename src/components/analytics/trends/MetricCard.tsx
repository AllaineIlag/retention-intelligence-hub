'use client'

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts"
import { cn } from "@/lib/utils"

interface MetricCardProps {
    title: string
    value: string | number
    subtext?: string
    /** 0-100 progress for the ring chart */
    progress?: number
    /** Ring color */
    color?: string
    className?: string
}

export function MetricCard({ title, value, subtext, progress = 0, color = '#6366f1', className }: MetricCardProps) {
    const TRACK_COLOR = '#27272a'

    const chartData = [
        { name: 'Value', value: Math.min(progress, 100) },
        { name: 'Remaining', value: Math.max(100 - progress, 0) },
    ]

    return (
        <Card className={cn("border border-white/5 bg-white/[0.02] shadow-sm flex flex-col justify-between h-full rounded-3xl relative overflow-hidden", className)}>
            <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
                <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground line-clamp-1">
                    {title}
                </h3>
            </CardHeader>
            <CardContent className="flex items-end justify-between pb-4 pt-0">
                <div className="flex flex-col">
                    <span className="text-2xl font-bold tracking-tight text-white">{value}</span>
                    {subtext && (
                        <span className="text-[10px] text-muted-foreground uppercase font-medium mt-1">
                            {subtext}
                        </span>
                    )}
                </div>

                {/* Ring Chart */}
                <div className="h-[50px] w-[50px] shrink-0 relative">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={chartData}
                                cx="50%"
                                cy="50%"
                                innerRadius={18}
                                outerRadius={24}
                                startAngle={90}
                                endAngle={-270}
                                dataKey="value"
                                stroke="none"
                                cornerRadius={3}
                            >
                                <Cell key="value" fill={color} />
                                <Cell key="remaining" fill={TRACK_COLOR} />
                            </Pie>
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    )
}
