"use client"

import { Card, CardContent, CardHeader, CardDescription, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { cn } from "@/lib/utils"

interface PushPullChartProps {
    title: string
    subtitle: string
    data: { name: string; value: number }[]
    colors: string[]
    className?: string
    action?: React.ReactNode
}

const CustomTooltip = ({ active, payload, label, color }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="rounded-xl border border-border bg-popover/90 p-3 shadow-xl backdrop-blur-md">
                <p className="mb-1 text-[10px] font-medium text-muted-foreground uppercase">{label}</p>
                <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
                    <span className="text-sm font-bold text-foreground">
                        {payload[0].value}
                    </span>
                </div>
            </div>
        );
    }
    return null;
};

export function PushPullChart({ title, subtitle, data, colors, className, action }: PushPullChartProps) {
    const sortedData = [...data].sort((a, b) => b.value - a.value).slice(0, 5)

    return (
        <Card className={cn("border border-border bg-card/50 shadow-sm flex flex-col rounded-3xl relative overflow-hidden min-h-[400px]", className)}>
            <CardHeader className="pb-2 relative z-20">
                {action && (
                    <div className="absolute right-6 top-6">
                        {action}
                    </div>
                )}
                <CardDescription className="text-xs uppercase tracking-widest font-semibold text-muted-foreground/60">
                    {subtitle}
                </CardDescription>
                <CardTitle className="text-lg font-bold text-foreground mt-1">
                    {title}
                </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 min-h-0 relative">
                <div className="absolute inset-4 top-0 bottom-4">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                            layout="vertical"
                            data={sortedData}
                            margin={{ top: 5, right: 10, left: 10, bottom: 5 }}
                            barCategoryGap={20}
                        >
                            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--border)" opacity={0.2} />
                            <XAxis type="number" hide />
                            <YAxis
                                dataKey="name"
                                type="category"
                                width={120}
                                tick={{ fill: '#a1a1aa', fontSize: 11, fontWeight: 500 }}
                                tickLine={false}
                                axisLine={false}
                            />
                            <Tooltip
                                content={<CustomTooltip color={colors[1]} />}
                                cursor={{ fill: 'currentColor', opacity: 0.05, radius: 4 }}
                            />
                            <Bar dataKey="value" radius={[0, 4, 4, 0]} animationDuration={1000}>
                                {sortedData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    )
}
