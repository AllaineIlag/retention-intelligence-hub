'use client'


import Link from "next/link"
import { Card, CardContent, CardHeader, CardDescription } from "@/components/ui/card"
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts"
import { cn } from "@/lib/utils"

interface PromoterGaugeProps {
    promoters: number
    detractors: number
    avgScore: number
    total: number
    className?: string
}

export function PromoterGauge({ promoters, detractors, avgScore, total, className }: PromoterGaugeProps) {
    const promoterPct = total > 0 ? Math.round((promoters / total) * 100) : 0;
    const detractorPct = total > 0 ? Math.round((detractors / total) * 100) : 0;

    const gaugeData = [
        { name: 'Promoters', value: promoters },
        { name: 'Detractors', value: detractors },
    ];

    const COLORS = ['#22c55e', '#f43f5e'];

    return (
        <Card className={cn("border border-white/5 bg-white/[0.02] shadow-sm rounded-3xl relative overflow-hidden", className)}>
            <CardHeader className="pb-2">
                <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    The &ldquo;Promoter&rdquo; Reality
                </h3>
                <CardDescription className="text-[10px] text-muted-foreground uppercase font-medium">
                    Would they recommend you as an employer?
                </CardDescription>
            </CardHeader>
            <CardContent>
                {total === 0 ? (
                    <div className="h-[280px] flex items-center justify-center text-muted-foreground text-sm">No data available</div>
                ) : (
                    <div className="flex flex-col items-center gap-3">
                        <div className="h-[180px] w-[180px] relative">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={gaugeData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={55}
                                        outerRadius={80}
                                        dataKey="value"
                                        stroke="none"
                                        startAngle={90}
                                        endAngle={-270}
                                        paddingAngle={3}
                                    >
                                        {gaugeData.map((_, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index]} />
                                        ))}
                                    </Pie>
                                </PieChart>
                            </ResponsiveContainer>
                            {/* Center label */}
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="text-2xl font-bold text-zinc-100">{avgScore}</span>
                                <span className="text-[10px] text-muted-foreground uppercase">avg score</span>
                            </div>
                        </div>

                        {/* Legend */}
                        <div className="flex items-center gap-6">
                            <div className="flex items-center gap-2">
                                <div className="h-2.5 w-2.5 rounded-full bg-green-500" />
                                <span className="text-xs text-zinc-400">Yes {promoterPct}%</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="h-2.5 w-2.5 rounded-full bg-rose-500" />
                                <span className="text-xs text-zinc-400">No {detractorPct}%</span>
                            </div>
                        </div>
                        <p className="text-[10px] text-muted-foreground text-center">
                            {promoters} of {total} would recommend • Score ≥ 50 = Yes
                        </p>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
