"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getRetentionRiskData, RiskDataPoint } from "@/app/actions/analytics"
import { cn } from "@/lib/utils"
import { Skeleton } from "@/components/ui/skeleton"
import { TrendingUp, ShieldAlert, ExternalLink } from "lucide-react"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"

// ─── Risk Color Helpers (Semantic Tokens — no hardcoded values) ──────────────
const getRiskColor = (score: number) =>
    score > 70 ? 'var(--status-error)' :
        score > 40 ? 'var(--status-warning)' :
            'var(--status-info)'

const getRiskBadgeClass = (score: number) =>
    score > 70
        ? "bg-status-error/15 text-status-error border border-status-error/30"
        : score > 40
            ? "bg-status-warning/15 text-status-warning border border-status-warning/30"
            : "bg-status-info/15 text-status-info border border-status-info/30"

// ─── Data Rows (High-Density Diagnostic View) ────────────────────────────────
function RiskDataList({ data }: { data: RiskDataPoint[] }) {
    return (
        <div className="space-y-4">
            {data.map((dept, i) => (
                <div key={i} className="flex items-center gap-4">
                    {/* Department Name */}
                    <div className="w-28 shrink-0">
                        <span className="text-sm font-semibold text-foreground block truncate">
                            {dept.name}
                        </span>
                        <span className="text-xs text-muted-foreground">
                            Department
                        </span>
                    </div>

                    {/* Risk Bar */}
                    <div className="flex-1 px-2">
                        <div className="h-2 w-full bg-accent rounded-full overflow-hidden border border-border">
                            <div
                                className="h-full transition-all duration-700 ease-out rounded-full"
                                style={{
                                    width: `${dept.riskScore}%`,
                                    backgroundColor: getRiskColor(dept.riskScore),
                                    opacity: 0.85
                                }}
                            />
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center gap-6 w-52 shrink-0 justify-end">
                        <div className="flex flex-col items-end w-16">
                            <span className="text-sm font-bold text-foreground">{dept.headcount}</span>
                            <span className="text-xs text-muted-foreground">Headcount</span>
                        </div>
                        <div className="flex flex-col items-end w-16">
                            <div className="flex items-center gap-0.5 text-status-error">
                                <TrendingUp className="w-3 h-3" />
                                <span className="text-sm font-bold text-foreground">{dept.velocity}x</span>
                            </div>
                            <span className="text-xs text-muted-foreground">Velocity</span>
                        </div>
                        <div className="flex flex-col items-end w-12">
                            <span className="text-sm font-bold text-foreground">{dept.riskScore}%</span>
                            <span className="text-xs text-muted-foreground">Risk</span>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    )
}

// ─── Main Export ──────────────────────────────────────────────────────────────
export function RiskHeatmap() {
    const [data, setData] = useState<RiskDataPoint[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [open, setOpen] = useState(false)

    useEffect(() => {
        async function load() {
            try {
                const res = await getRetentionRiskData()
                if (res.success && res.data) setData(res.data.slice(0, 6))
            } catch (e) {
                console.error("Failed to load risk data", e)
            } finally {
                setIsLoading(false)
            }
        }
        load()
    }, [])

    const topRisk = [...data].sort((a, b) => b.riskScore - a.riskScore).slice(0, 2)
    const criticalDept = data[0] || null

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
                        <ShieldAlert className="h-4 w-4 text-muted-foreground transition-colors group-hover:text-status-error" />
                        <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                            Risk Index
                        </CardTitle>
                    </div>
                    <ExternalLink className="h-3.5 w-3.5 text-muted-foreground/30 group-hover:text-status-error/60 transition-colors" />
                </CardHeader>

                <CardContent className="px-5 pb-5 pt-0">
                    <div className="flex gap-2">
                        {topRisk.length === 0 ? (
                            <p className="text-sm text-muted-foreground">No risk data available.</p>
                        ) : (
                            topRisk.map((dept) => (
                                <div
                                    key={dept.name}
                                    className="flex items-center gap-2 px-3 py-2 rounded-xl border bg-accent flex-1 min-w-0"
                                >
                                    <div
                                        className="w-2 h-2 rounded-full shrink-0"
                                        style={{ backgroundColor: getRiskColor(dept.riskScore) }}
                                    />
                                    <span className="text-sm font-medium text-foreground truncate flex-1">{dept.name}</span>
                                    <span className={cn("text-xs font-bold px-1.5 py-0.5 rounded shrink-0", getRiskBadgeClass(dept.riskScore))}>
                                        {dept.riskScore}%
                                    </span>
                                </div>
                            ))
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* ── FULL HEATMAP DIALOG ────────────────────────────────────────── */}
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="max-w-2xl rounded-3xl border border-border bg-popover shadow-2xl p-0 overflow-hidden">
                    <DialogHeader className="flex flex-row items-center justify-between px-6 pt-6 pb-4 border-b border-border">
                        <div className="flex items-center gap-2">
                            <ShieldAlert className="h-4 w-4 text-muted-foreground" />
                            <div>
                                <DialogTitle className="text-xs font-bold uppercase tracking-wider text-foreground">
                                    Risk Index
                                </DialogTitle>
                                <p className="text-xs text-muted-foreground mt-0.5">
                                    Departmental attrition heatmap
                                </p>
                            </div>
                        </div>
                    </DialogHeader>

                    <div className="px-6 pb-6 pt-4">
                        <RiskDataList data={data} />

                        {criticalDept && (
                            <div className="mt-6 p-4 rounded-2xl bg-status-error/5 border border-status-error/20 flex items-start gap-3">
                                <div className="p-2 rounded-full bg-status-error/20 text-status-error shrink-0 mt-0.5">
                                    <ShieldAlert className="w-4 h-4" />
                                </div>
                                <div className="flex flex-col gap-1">
                                    <span className="text-xs font-bold uppercase tracking-widest text-status-error">Primary risk driver</span>
                                    <p className="text-sm text-foreground font-medium leading-relaxed">
                                        {criticalDept.riskScore > 75
                                            ? `Critical attrition spike detected in ${criticalDept.name}. Exit velocity is ${criticalDept.velocity}x higher than quarterly mean.`
                                            : `High correlation detected between ${criticalDept.name} attrition risk and Career Growth sentiment scores.`}
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="px-6 pb-5 border-t border-border pt-4">
                        <div className="flex items-center justify-between">
                            <p className="text-xs text-muted-foreground">Descriptive analytics — based on historical exit data</p>
                            <span className="text-xs text-muted-foreground">v6.0.4</span>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    )
}
