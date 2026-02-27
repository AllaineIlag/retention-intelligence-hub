"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { getRetentionRiskData, RiskDataPoint } from "@/app/actions/analytics"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts"
import { cn } from "@/lib/utils"
import { Skeleton } from "@/components/ui/skeleton"
import { TrendingUp, ShieldAlert } from "lucide-react"

const RiskTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
        const data = payload[0].payload as RiskDataPoint;
        return (
            <div className="bg-popover/90 backdrop-blur-md border border-border p-4 rounded-2xl shadow-xl ring-1 ring-black/5 min-w-[200px]">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-[12px] font-bold text-foreground">{data.name}</span>
                    <span className={cn(
                        "text-[10px] px-1.5 py-0.5 rounded font-bold uppercase",
                        data.riskScore > 70 ? "bg-destructive/20 text-destructive border border-destructive/30" :
                            data.riskScore > 40 ? "bg-amber-500/20 text-amber-500 border border-amber-500/30" :
                                "bg-primary/20 text-primary border border-primary/30"
                    )}>
                        {data.riskScore > 70 ? 'Critical' : data.riskScore > 40 ? 'Warning' : 'Stable'}
                    </span>
                </div>
                <div className="space-y-1.5">
                    <div className="flex justify-between text-[11px]">
                        <span className="text-muted-foreground">Risk Index</span>
                        <span className="font-bold text-foreground">{data.riskScore}%</span>
                    </div>
                    <div className="flex justify-between text-[11px]">
                        <span className="text-muted-foreground">Attrition Velocity</span>
                        <span className="font-bold text-foreground">{data.velocity}x</span>
                    </div>
                    <div className="flex justify-between text-[11px]">
                        <span className="text-muted-foreground">Sentiment Score</span>
                        <span className="font-bold text-foreground">{data.sentiment}/5</span>
                    </div>
                    <div className="w-full h-1 bg-muted rounded-full overflow-hidden mt-1">
                        <div
                            className={cn(
                                "h-full transition-all duration-500",
                                data.riskScore > 70 ? "bg-destructive" :
                                    data.riskScore > 40 ? "bg-amber-500" : "bg-primary"
                            )}
                            style={{ width: `${data.riskScore}%` }}
                        />
                    </div>
                </div>
            </div>
        );
    }
    return null;
};

export function RiskHeatmap() {
    const [data, setData] = useState<RiskDataPoint[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        async function load() {
            try {
                const res = await getRetentionRiskData()
                if (res.success && res.data) {
                    // Show top 8 at-risk departments
                    setData(res.data.slice(0, 8))
                }
            } catch (e) {
                console.error("Failed to load risk data", e)
            } finally {
                setIsLoading(false)
            }
        }
        load()
    }, [])

    if (isLoading) {
        return (
            <Card className="border-border bg-card/50 rounded-3xl h-full min-h-[400px]">
                <CardHeader>
                    <Skeleton className="h-6 w-48" />
                </CardHeader>
                <CardContent className="h-[300px]">
                    <Skeleton className="h-full w-full opacity-20" />
                </CardContent>
            </Card>
        )
    }

    return (
        <Card className="border-border bg-card/50 rounded-3xl shadow-sm h-full flex flex-col overflow-hidden group">
            <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive">
                            <ShieldAlert className="w-4 h-4" />
                        </div>
                        <div>
                            <CardTitle className="text-sm font-bold">Retention Risk Index</CardTitle>
                            <CardDescription className="text-[10px]">Departmental Attrition Heatmap (Weighted Score)</CardDescription>
                        </div>
                    </div>
                    <TrendingUp className="w-4 h-4 text-muted-foreground opacity-30 group-hover:opacity-100 transition-opacity" />
                </div>
            </CardHeader>
            <CardContent className="flex-1 min-h-[300px] pt-4 pr-4">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                        data={data}
                        layout="vertical"
                        margin={{ left: 20, right: 20, top: 0, bottom: 0 }}
                        barSize={20}
                    >
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--border)" opacity={0.4} />
                        <XAxis type="number" hide domain={[0, 100]} />
                        <YAxis
                            dataKey="name"
                            type="category"
                            axisLine={false}
                            tickLine={false}
                            width={100}
                            tick={{ fontSize: 10, fontWeight: 600, fill: 'var(--muted-foreground)' }}
                        />
                        <Tooltip content={<RiskTooltip />} cursor={{ fill: 'var(--accent)', opacity: 0.1 }} />
                        <Bar
                            dataKey="riskScore"
                            radius={[0, 4, 4, 0]}
                            animationDuration={1500}
                            animationEasing="ease-out"
                        >
                            {data.map((entry, index) => (
                                <Cell
                                    key={`cell-${index}`}
                                    fill={
                                        entry.riskScore > 70 ? 'var(--destructive)' :
                                            entry.riskScore > 40 ? '#f59e0b' : // Amber
                                                'var(--primary)'
                                    }
                                    fillOpacity={0.8}
                                    className="hover:fill-opacity-100 transition-all duration-300"
                                />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    )
}
