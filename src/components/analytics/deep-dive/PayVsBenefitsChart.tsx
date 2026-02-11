'use client'

import { Card, CardContent, CardHeader, CardDescription } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Legend } from "recharts"
import { cn } from "@/lib/utils"

interface PayVsBenefitsProps {
    data: { label: string; pay: number; benefits: number }[]
    className?: string
}

export function PayVsBenefitsChart({ data, className }: PayVsBenefitsProps) {
    return (
        <Card className={cn("border border-white/5 bg-white/[0.02] shadow-sm rounded-3xl relative overflow-hidden", className)}>
            <CardHeader className="pb-2">
                <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Pay vs Benefits Perception
                </h3>
                <CardDescription className="text-[10px] text-muted-foreground uppercase font-medium">
                    They hate the pay but stay for insurance?
                </CardDescription>
            </CardHeader>
            <CardContent>
                {data.length === 0 ? (
                    <div className="h-[280px] flex items-center justify-center text-muted-foreground text-sm">No data available</div>
                ) : (
                    <div className="h-[280px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data} barGap={4} barCategoryGap="30%">
                                <XAxis dataKey="label"
                                    tick={{ fill: '#a1a1aa', fontSize: 11, fontWeight: 500 }} axisLine={false} tickLine={false} />
                                <YAxis allowDecimals={false}
                                    tick={{ fill: '#71717a', fontSize: 10 }} axisLine={false} tickLine={false} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: 'rgba(0,0,0,0.85)', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px', backdropFilter: 'blur(8px)' }}
                                    itemStyle={{ fontSize: '11px' }}
                                />
                                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '10px', paddingTop: '8px' }} />
                                <Bar dataKey="pay" name="Pay" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                                <Bar dataKey="benefits" name="Benefits" fill="#a78bfa" radius={[6, 6, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
