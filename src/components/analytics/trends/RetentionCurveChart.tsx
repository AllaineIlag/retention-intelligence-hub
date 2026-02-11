'use client'

import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface RetentionCurveProps {
    data: {
        name: string
        value: number
    }[]
    className?: string
}

export function RetentionCurveChart({ data, className }: RetentionCurveProps) {
    return (
        <Card className={cn("border border-white/5 bg-white/[0.02] shadow-sm rounded-3xl relative overflow-hidden", className)}>
            <CardHeader className="pb-2">
                <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Retention Curve
                </h3>
                <CardDescription className="text-[10px] text-muted-foreground uppercase font-medium">
                    % of employees remaining after X months
                </CardDescription>
            </CardHeader>
            <CardContent className="pl-2">
                <div className="h-[300px] w-full min-w-0">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={data}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" vertical={false} />
                            <XAxis
                                dataKey="name"
                                stroke="#888888"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                            />
                            <YAxis
                                stroke="#888888"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                                tickFormatter={(value) => `${value}%`}
                                domain={[0, 100]}
                            />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: 'rgba(0, 0, 0, 0.85)',
                                    borderColor: 'rgba(255,255,255,0.1)',
                                    borderRadius: '12px',
                                    backdropFilter: 'blur(8px)',
                                }}
                                itemStyle={{ color: '#fff', fontSize: '12px' }}
                                labelStyle={{ color: '#a1a1aa', fontSize: '11px' }}
                                formatter={(value: number) => [`${value.toFixed(1)}%`, 'Retention']}
                                cursor={{ stroke: '#444' }}
                            />
                            <Line
                                type="monotone"
                                dataKey="value"
                                stroke="#ea580c"
                                strokeWidth={3}
                                dot={{ r: 4, fill: "#ea580c", strokeWidth: 0 }}
                                activeDot={{ r: 6, fill: "#fff", stroke: "#ea580c", strokeWidth: 2 }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    )
}
