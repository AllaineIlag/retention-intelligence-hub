'use client'

import Link from "next/link"
import { Card, CardContent, CardHeader, CardDescription } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Legend, CartesianGrid } from "recharts"
import { cn } from "@/lib/utils"

interface SentimentBucket {
    category: string
    low: number
    fair: number
    high: number
}

interface SentimentStackedBarProps {
    data: SentimentBucket[]
    className?: string
}

export function SentimentStackedBar({ data, className }: SentimentStackedBarProps) {
    // Convert absolute counts to percentages
    const chartData = data.map(d => {
        const total = d.low + d.fair + d.high;
        if (total === 0) return { category: d.category, Low: 0, Fair: 0, High: 0 };
        return {
            category: d.category,
            Low: Math.round((d.low / total) * 100),
            Fair: Math.round((d.fair / total) * 100),
            High: Math.round((d.high / total) * 100),
        };
    });

    return (
        <Card className={cn("col-span-1 border border-border bg-card/50 shadow-sm rounded-3xl relative overflow-hidden", className)}>
            <CardHeader className="pb-2">
                <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Sentiment Distribution
                </h3>
                <CardDescription className="text-[10px] text-muted-foreground uppercase font-medium">
                    How satisfaction actually breaks down by category
                </CardDescription>
            </CardHeader>
            <CardContent>
                {data.length === 0 ? (
                    <div className="h-[280px] flex items-center justify-center text-muted-foreground text-sm">No data available</div>
                ) : (
                    <div className="h-[280px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData} layout="vertical" barCategoryGap="20%">
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--chart-grid)" />
                                <XAxis type="number" domain={[0, 100]} tickFormatter={(v) => `${v}%`}
                                    tick={{ fill: 'var(--muted-foreground)', fontSize: 10 }} axisLine={false} tickLine={false} />
                                <YAxis type="category" dataKey="category" width={70}
                                    tick={{ fill: 'var(--foreground)', fontSize: 11, fontWeight: 500 }} axisLine={false} tickLine={false} />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: 'var(--popover)',
                                        borderColor: 'var(--border)',
                                        borderRadius: '12px',
                                        backdropFilter: 'blur(8px)',
                                        color: 'var(--popover-foreground)'
                                    }}
                                    itemStyle={{ fontSize: '11px', color: 'var(--foreground)' }}
                                    formatter={(value: any) => `${value}%`}
                                />
                                <Legend
                                    iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '10px', paddingTop: '8px', color: 'var(--muted-foreground)', textTransform: 'uppercase' }}
                                />
                                <Bar dataKey="Low" stackId="a" fill="#f43f5e" radius={[0, 0, 0, 0]} />
                                <Bar dataKey="Fair" stackId="a" fill="#f59e0b" />
                                <Bar dataKey="High" stackId="a" fill="#22c55e" radius={[0, 4, 4, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
