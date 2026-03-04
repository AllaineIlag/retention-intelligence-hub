"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { StrategicInsight, DiagnosticCheck, getStrategicInsights } from "@/app/actions/analytics"
import { AlertCircle, AlertTriangle, CheckCircle, Eye, ExternalLink } from "lucide-react"
import { cn } from "@/lib/utils"
import { Skeleton } from "@/components/ui/skeleton"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"

const StatusIcon = ({ type }: { type: string }) => {
    switch (type) {
        case 'critical': return <AlertCircle className="w-4 h-4" />
        case 'warning': return <AlertTriangle className="w-4 h-4" />
        default: return <CheckCircle className="w-4 h-4" />
    }
}

// ─── Full Insights List (used inside Dialog) ─────────────────────────────────
function InsightsList({ insights }: { insights: StrategicInsight[] }) {
    if (insights.length === 0) {
        return (
            <div className="flex items-center gap-3 p-4 rounded-2xl border bg-status-success/10 border-status-success/30">
                <div className="p-2 rounded-full bg-status-success/20 text-status-success shrink-0">
                    <CheckCircle className="w-4 h-4" />
                </div>
                <div>
                    <p className="text-sm font-semibold text-foreground">System Stable</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Nominal operations confirmed</p>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-3">
            {insights.map((insight) => (
                <div
                    key={insight.id}
                    className={cn(
                        "relative p-4 rounded-2xl border overflow-hidden",
                        insight.type === 'critical' ? "bg-status-error/5 border-status-error/20" :
                            insight.type === 'warning' ? "bg-status-warning/5 border-status-warning/20" :
                                "bg-status-success/5 border-status-success/20"
                    )}
                >
                    <div className="flex items-start gap-3">
                        <div className={cn(
                            "p-2 rounded-full shrink-0 mt-0.5",
                            insight.type === 'critical' ? "bg-status-error/20 text-status-error" :
                                insight.type === 'warning' ? "bg-status-warning/20 text-status-warning" :
                                    "bg-status-success/20 text-status-success"
                        )}>
                            <StatusIcon type={insight.type} />
                        </div>
                        <div className="flex flex-col flex-1 min-w-0 gap-1">
                            <div className="flex items-center gap-2 flex-wrap">
                                <h4 className="text-sm font-bold text-foreground">{insight.title}</h4>
                                {insight.metrics && (
                                    <span className="text-xs font-medium px-2 py-0.5 rounded-md bg-background border border-border text-muted-foreground whitespace-nowrap shrink-0">
                                        {insight.metrics}
                                    </span>
                                )}
                            </div>
                            <p className="text-xs text-muted-foreground leading-relaxed">
                                {insight.description}
                            </p>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    )
}

// ─── System Diagnosis Checklist (The Evidence Layer) ─────────────────────────
function SystemChecklist({ checks }: { checks: DiagnosticCheck[] }) {
    if (!checks || checks.length === 0) return null;

    return (
        <div className="mt-6 border-t border-border pt-6">
            <h5 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-3">System Diagnosis</h5>
            <div className="space-y-2">
                {checks.map((check, i) => (
                    <div key={i} className="flex items-center justify-between px-4 py-3 rounded-xl bg-accent border border-border hover:bg-accent/80 transition-colors duration-200">
                        <div className="flex items-center gap-3">
                            <div className={cn(
                                "p-1 rounded-full shrink-0",
                                check.isHealthy ? "bg-status-success/20 text-status-success" : "bg-status-warning/20 text-status-warning"
                            )}>
                                {check.isHealthy ? <CheckCircle className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
                            </div>
                            <span className="text-sm text-foreground">{check.label}</span>
                        </div>
                        <span className="text-xs font-medium text-muted-foreground">{check.status}</span>
                    </div>
                ))}
            </div>
        </div>
    )
}

// ─── Main Export ──────────────────────────────────────────────────────────────
export function StrategicInsights() {
    const [insights, setInsights] = useState<StrategicInsight[]>([])
    const [diagnostics, setDiagnostics] = useState<DiagnosticCheck[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [open, setOpen] = useState(false)

    useEffect(() => {
        async function load() {
            try {
                const res = await getStrategicInsights()
                if (res.success && res.data) {
                    setInsights(res.data.insights)
                    setDiagnostics(res.data.diagnostics)
                }
            } catch (e) {
                console.error("Failed to load insights", e)
            } finally {
                setIsLoading(false)
            }
        }
        load()
    }, [])

    const topInsight = insights[0] ?? null

    if (isLoading) {
        return (
            <Card className="border-border bg-card rounded-3xl h-36">
                <CardHeader className="p-5">
                    <Skeleton className="h-4 w-40 rounded-md" />
                    <Skeleton className="h-3 w-28 mt-2 rounded-md opacity-50" />
                </CardHeader>
            </Card>
        )
    }

    return (
        <>
            {/* ── COMPACT BANNER ─────────────────────────────────────────────── */}
            <Card
                onClick={() => setOpen(true)}
                className="border-border bg-card rounded-3xl relative overflow-hidden group cursor-pointer transition-all hover:shadow-md h-36"
            >
                <CardHeader className="flex flex-row items-center justify-between pb-2 p-5">
                    <div className="flex items-center gap-2">
                        <Eye className="h-4 w-4 text-muted-foreground transition-colors group-hover:text-primary" />
                        <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                            Insights Engine
                        </CardTitle>
                        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-status-success/10 border border-status-success/20">
                            <span className="w-1.5 h-1.5 rounded-full bg-status-success animate-pulse" />
                            <span className="text-[9px] font-bold tracking-widest text-status-success uppercase">Live</span>
                        </div>
                    </div>
                    <ExternalLink className="h-3.5 w-3.5 text-muted-foreground/30 group-hover:text-primary/60 transition-colors" />
                </CardHeader>

                <CardContent className="px-5 pb-5 pt-0">
                    {topInsight ? (
                        <div className={cn(
                            "flex items-center gap-3 p-3 rounded-xl border",
                            topInsight.type === 'critical' ? "bg-status-error/5 border-status-error/20" :
                                topInsight.type === 'warning' ? "bg-status-warning/5 border-status-warning/20" :
                                    "bg-status-success/5 border-status-success/20"
                        )}>
                            <div className={cn(
                                "p-1.5 rounded-full shrink-0",
                                topInsight.type === 'critical' ? "bg-status-error/20 text-status-error" :
                                    topInsight.type === 'warning' ? "bg-status-warning/20 text-status-warning" :
                                        "bg-status-success/20 text-status-success"
                            )}>
                                <StatusIcon type={topInsight.type} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-foreground truncate">{topInsight.title}</p>
                                {topInsight.metrics && (
                                    <p className="text-xs text-muted-foreground">{topInsight.metrics}</p>
                                )}
                            </div>
                            {insights.length > 1 && (
                                <span className="text-xs text-muted-foreground shrink-0">
                                    +{insights.length - 1} more
                                </span>
                            )}
                        </div>
                    ) : (
                        <div className="flex items-center gap-3 p-3 rounded-xl border bg-status-success/5 border-status-success/20">
                            <div className="p-1.5 rounded-full bg-status-success/20 text-status-success shrink-0">
                                <CheckCircle className="w-4 h-4" />
                            </div>
                            <p className="text-sm font-semibold text-foreground">System stable — nominal operations</p>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* ── FULL ANALYSIS DIALOG ───────────────────────────────────────── */}
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="max-w-xl rounded-3xl border border-border bg-popover shadow-2xl p-0 overflow-hidden">
                    <DialogHeader className="flex flex-row items-center justify-between px-6 pt-6 pb-4 border-b border-border">
                        <div className="flex items-center gap-2">
                            <Eye className="h-4 w-4 text-muted-foreground" />
                            <div>
                                <DialogTitle className="text-xs font-bold uppercase tracking-wider text-foreground">
                                    Insights Engine
                                </DialogTitle>
                                <p className="text-xs text-muted-foreground mt-0.5">
                                    Analysis runs live on every dashboard load
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-status-success/10 border border-status-success/20">
                            <span className="w-1.5 h-1.5 rounded-full bg-status-success animate-pulse" />
                            <span className="text-[9px] font-bold tracking-widest text-status-success uppercase">Live</span>
                        </div>
                    </DialogHeader>

                    <div className="px-6 pb-6 pt-4 overflow-y-auto max-h-[70vh]">
                        <InsightsList insights={insights} />
                        <SystemChecklist checks={diagnostics} />
                    </div>
                </DialogContent>
            </Dialog>
        </>
    )
}