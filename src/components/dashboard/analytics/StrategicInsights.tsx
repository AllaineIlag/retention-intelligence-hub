"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { StrategicInsight, getStrategicInsights } from "@/app/actions/analytics"
import { AlertCircle, AlertTriangle, Info, Zap, Eye, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { Skeleton } from "@/components/ui/skeleton"

export function StrategicInsights() {
    const [insights, setInsights] = useState<StrategicInsight[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        async function load() {
            try {
                const res = await getStrategicInsights()
                if (res.success && res.data) {
                    setInsights(res.data)
                }
            } catch (e) {
                console.error("Failed to load insights", e)
            } finally {
                setIsLoading(false)
            }
        }
        load()
    }, [])

    if (isLoading) {
        return (
            <Card className="border-border bg-card/50 rounded-3xl overflow-hidden">
                <CardHeader className="border-b border-border/50 pb-3">
                    <Skeleton className="h-6 w-48" />
                </CardHeader>
                <CardContent className="pt-6 space-y-4">
                    <Skeleton className="h-20 w-full rounded-2xl" />
                    <Skeleton className="h-20 w-full rounded-2xl" />
                </CardContent>
            </Card>
        )
    }

    return (
        <Card className="border-border bg-card/80 backdrop-blur-xl rounded-3xl overflow-hidden shadow-2xl relative">
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-50" />

            <CardHeader className="border-b border-border/50 pb-4 bg-accent/5">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-primary/10 border border-primary/20 text-primary">
                            <Eye className="w-4 h-4" />
                        </div>
                        <div>
                            <CardTitle className="text-lg font-bold tracking-tight">Swain's Strategic Eye</CardTitle>
                            <CardDescription className="text-[11px] uppercase tracking-widest font-bold text-muted-foreground/60">Descriptive Intelligence Hub</CardDescription>
                        </div>
                    </div>
                    <Badge variant="outline" className="bg-primary/5 border-primary/20 text-primary animate-pulse">Live Analysis</Badge>
                </div>
            </CardHeader>

            <CardContent className="pt-6 space-y-4 max-h-[400px] overflow-y-auto custom-scrollbar">
                {insights.map((insight, idx) => (
                    <div
                        key={insight.id}
                        className={cn(
                            "group relative p-4 rounded-2xl border transition-all duration-300 hover:shadow-lg",
                            insight.type === 'critical' ? "bg-destructive/5 border-destructive/20 hover:border-destructive/40" :
                                insight.type === 'warning' ? "bg-amber-500/5 border-amber-500/20 hover:border-amber-500/40" :
                                    "bg-primary/5 border-primary/20 hover:border-primary/40"
                        )}
                    >
                        <div className="flex gap-4">
                            <div className={cn(
                                "mt-1 p-2 rounded-xl border shrink-0",
                                insight.type === 'critical' ? "bg-destructive/10 border-destructive/20 text-destructive" :
                                    insight.type === 'warning' ? "bg-amber-500/10 border-amber-500/20 text-amber-500" :
                                        "bg-primary/10 border-primary/20 text-primary"
                            )}>
                                {insight.type === 'critical' ? <AlertCircle className="w-4 h-4" /> :
                                    insight.type === 'warning' ? <AlertTriangle className="w-4 h-4" /> :
                                        <Zap className="w-4 h-4" />}
                            </div>

                            <div className="flex-1 space-y-1">
                                <div className="flex items-center justify-between">
                                    <h4 className="text-sm font-bold tracking-tight">{insight.title}</h4>
                                    {insight.metrics && (
                                        <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-foreground/5 border border-foreground/10 opacity-70">
                                            {insight.metrics}
                                        </span>
                                    )}
                                </div>
                                <p className="text-xs text-muted-foreground leading-relaxed">
                                    {insight.description}
                                </p>
                            </div>

                            <ChevronRight className="w-4 h-4 text-muted-foreground/30 group-hover:text-muted-foreground transition-colors self-center" />
                        </div>
                    </div>
                ))}

                {insights.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-10 text-center opacity-50">
                        <Info className="w-8 h-8 mb-2" />
                        <p className="text-sm font-medium">No strategic anomalies detected.</p>
                        <p className="text-xs">Intelligence engine is nominal.</p>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
