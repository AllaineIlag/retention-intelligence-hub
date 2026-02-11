'use client'

import { Card, CardContent, CardHeader, CardDescription } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface MoneyVsCultureBarProps {
    financial: number
    environment: number
    total: number
    className?: string
}

export function MoneyVsCultureBar({ financial, environment, total, className }: MoneyVsCultureBarProps) {
    const financialPct = total > 0 ? Math.round((financial / total) * 100) : 0;
    const environmentPct = total > 0 ? Math.round((environment / total) * 100) : 0;

    return (
        <Card className={cn("border border-white/5 bg-white/[0.02] shadow-sm rounded-3xl relative overflow-hidden", className)}>
            <CardHeader className="pb-2">
                <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Money vs Culture
                </h3>
                <CardDescription className="text-[10px] text-muted-foreground uppercase font-medium">
                    Budget problem or leadership problem?
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {total === 0 ? (
                    <div className="h-[100px] flex items-center justify-center text-muted-foreground text-sm">
                        No data available
                    </div>
                ) : (
                    <>
                        {/* Stacked horizontal bar */}
                        <div className="space-y-3">
                            <div className="h-10 rounded-xl bg-white/5 overflow-hidden flex">
                                {financialPct > 0 && (
                                    <div
                                        className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 flex items-center justify-center transition-all duration-700"
                                        style={{ width: `${financialPct}%` }}
                                    >
                                        <span className="text-xs font-bold text-black">{financialPct}%</span>
                                    </div>
                                )}
                                {environmentPct > 0 && (
                                    <div
                                        className="h-full bg-gradient-to-r from-violet-500 to-violet-400 flex items-center justify-center transition-all duration-700"
                                        style={{ width: `${environmentPct}%` }}
                                    >
                                        <span className="text-xs font-bold text-black">{environmentPct}%</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Legend */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="h-3 w-3 rounded-full bg-emerald-500" />
                                <div>
                                    <p className="text-xs font-medium text-zinc-300">Financial</p>
                                    <p className="text-[10px] text-muted-foreground">Pay, Benefits, Compensation</p>
                                </div>
                            </div>
                            <span className="text-lg font-bold text-zinc-200">{financial}</span>
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="h-3 w-3 rounded-full bg-violet-500" />
                                <div>
                                    <p className="text-xs font-medium text-zinc-300">Environment</p>
                                    <p className="text-[10px] text-muted-foreground">Culture, Management, Workload</p>
                                </div>
                            </div>
                            <span className="text-lg font-bold text-zinc-200">{environment}</span>
                        </div>
                    </>
                )}
            </CardContent>
        </Card>
    )
}
