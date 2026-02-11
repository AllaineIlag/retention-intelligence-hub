'use client'

import { Card, CardContent, CardHeader, CardDescription } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell, Tooltip } from "recharts"
import { cn } from "@/lib/utils"

interface ButterflyChartProps {
    push: { name: string; value: number }[]
    pull: { name: string; value: number }[]
    className?: string
}

export function ButterflyChart({ push, pull, className }: ButterflyChartProps) {
    // Merge push (negative) and pull (positive) into unified rows
    const allLabels = new Set<string>();
    push.forEach(p => allLabels.add(p.name));
    pull.forEach(p => allLabels.add(p.name));

    // Build chart data: push is negative (left), pull is positive (right)
    const pushMap = Object.fromEntries(push.map(p => [p.name, p.value]));
    const pullMap = Object.fromEntries(pull.map(p => [p.name, p.value]));

    // We'll render two separate stacked bars side by side
    const pushSorted = [...push].sort((a, b) => b.value - a.value).slice(0, 6);
    const pullSorted = [...pull].sort((a, b) => b.value - a.value).slice(0, 6);

    const PUSH_COLOR = '#f43f5e'   // rose-500
    const PULL_COLOR = '#3b82f6'   // blue-500

    const hasData = push.length > 0 || pull.length > 0;

    return (
        <Card className={cn("border border-white/5 bg-white/[0.02] shadow-sm rounded-3xl relative overflow-hidden", className)}>
            <CardHeader className="pb-2">
                <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Push vs Pull Factors
                </h3>
                <CardDescription className="text-[10px] text-muted-foreground uppercase font-medium">
                    Internal (push) vs External (pull) exit drivers
                </CardDescription>
            </CardHeader>
            <CardContent>
                {!hasData ? (
                    <div className="h-[300px] flex items-center justify-center text-muted-foreground text-sm">
                        No data available
                    </div>
                ) : (
                    <div className="grid grid-cols-2 gap-4">
                        {/* PUSH side (left) */}
                        <div>
                            <p className="text-[10px] uppercase tracking-wider text-rose-400 font-medium mb-3 text-center">
                                Push — Why they left
                            </p>
                            <div className="space-y-2">
                                {pushSorted.map((item) => {
                                    const max = pushSorted[0]?.value || 1;
                                    const pct = (item.value / max) * 100;
                                    return (
                                        <div key={item.name} className="group">
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="text-[11px] text-zinc-400 truncate max-w-[140px]">{item.name}</span>
                                                <span className="text-[11px] text-zinc-300 font-medium">{item.value}</span>
                                            </div>
                                            <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                                                <div
                                                    className="h-full rounded-full bg-gradient-to-r from-rose-500/70 to-rose-500 transition-all duration-500"
                                                    style={{ width: `${pct}%` }}
                                                />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* PULL side (right) */}
                        <div>
                            <p className="text-[10px] uppercase tracking-wider text-blue-400 font-medium mb-3 text-center">
                                Pull — Why new job appeals
                            </p>
                            <div className="space-y-2">
                                {pullSorted.length === 0 ? (
                                    <div className="h-[200px] flex items-center justify-center text-muted-foreground text-xs">
                                        No pull data yet
                                    </div>
                                ) : (
                                    pullSorted.map((item) => {
                                        const max = pullSorted[0]?.value || 1;
                                        const pct = (item.value / max) * 100;
                                        return (
                                            <div key={item.name} className="group">
                                                <div className="flex items-center justify-between mb-1">
                                                    <span className="text-[11px] text-zinc-400 truncate max-w-[140px]">{item.name}</span>
                                                    <span className="text-[11px] text-zinc-300 font-medium">{item.value}</span>
                                                </div>
                                                <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                                                    <div
                                                        className="h-full rounded-full bg-gradient-to-r from-blue-500/70 to-blue-500 transition-all duration-500"
                                                        style={{ width: `${pct}%` }}
                                                    />
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
