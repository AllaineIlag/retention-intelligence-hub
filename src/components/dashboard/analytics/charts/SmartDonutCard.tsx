"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { usePageFilter } from '@/components/dashboard/page-filter-context'
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { getExitQuestionStats, TurnoverDataPoint } from "@/app/actions/analytics"
import { endOfMonth, startOfYear, subDays, subMonths } from "date-fns"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts"

interface SmartDonutCardProps {
    title: string
    questionKey: string
    unit?: string
    initialData?: TurnoverDataPoint[]
    className?: string
}

const COLORS = [
    'var(--chart-1)',
    'var(--chart-2)',
    'var(--chart-3)',
    'var(--chart-4)',
    'var(--chart-5)',
]

export function SmartDonutCard({ title, questionKey, unit = "Resp", initialData = [], className }: SmartDonutCardProps) {
    const [data, setData] = useState<TurnoverDataPoint[]>(initialData)
    const [mode, setMode] = useState<'7d' | '30d' | '3m' | '6m' | '12m' | 'ytd'>('30d')
    const [isLoading, setIsLoading] = useState(false)
    const { pageFilter, version } = usePageFilter()
    const lastVersionRef = useRef(version)

    // Sync with page-level filter
    useEffect(() => {
        if (version !== lastVersionRef.current) {
            lastVersionRef.current = version
            if (pageFilter) {
                handleToggle(pageFilter, true)
            } else {
                handleToggle('30d', true)
            }
        }
    }, [pageFilter, version])

    // Initial fetch if no initial data
    useEffect(() => {
        if (initialData.length === 0) {
            handleToggle('30d')
        }
    }, [])

    const handleToggle = async (newMode: '7d' | '30d' | '3m' | '6m' | '12m' | 'ytd', force = false) => {
        if (!force && newMode === mode && data.length > 0) return
        setMode(newMode)
        setIsLoading(true)

        const today = new Date()
        let startDate: Date

        switch (newMode) {
            case '7d': startDate = subDays(today, 7); break
            case '3m': startDate = subMonths(today, 3); break
            case '6m': startDate = subMonths(today, 6); break
            case '12m': startDate = subMonths(today, 12); break
            case 'ytd': startDate = startOfYear(today); break
            default: startDate = subDays(today, 30); break
        }

        const filters = {
            startDate,
            endDate: endOfMonth(today)
        }

        try {
            const res = await getExitQuestionStats(filters)
            if (res.success && res.data) {
                const stats = res.data.find(s => s.question_key === questionKey)?.stats || []
                setData(stats)
            }
        } catch (error) {
            console.error(`Failed to fetch ${questionKey}`, error)
        } finally {
            setIsLoading(false)
        }
    }

    const total = data.reduce((acc, curr) => acc + curr.value, 0)

    return (
        <Card className={cn("flex flex-col border-border bg-card/50 min-h-0 rounded-3xl shadow-sm hover:bg-accent/5 transition-colors duration-300 overflow-hidden relative", className)}>
            {isLoading && (
                <div className="absolute inset-0 bg-background/50 backdrop-blur-sm z-10 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                </div>
            )}
            <CardHeader className="py-3 px-5 shrink-0 flex flex-row items-center justify-between border-b border-border space-y-0">
                <CardTitle className="text-sm font-medium text-foreground">{title}</CardTitle>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 gap-1 rounded-full border border-border bg-accent/50 px-2 text-[10px] font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                            suppressHydrationWarning
                        >
                            {mode.toUpperCase()}
                            <ChevronDown className="h-3 w-3" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-[140px] border-border bg-popover text-popover-foreground">
                        <DropdownMenuItem onClick={() => handleToggle('7d')} className="text-xs">Last 7 Days</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleToggle('30d')} className="text-xs">Last 30 Days</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleToggle('3m')} className="text-xs">Last 3 Months</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleToggle('6m')} className="text-xs">Last 6 Months</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleToggle('12m')} className="text-xs">Last 12 Months</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleToggle('ytd')} className="text-xs">Year to Date</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </CardHeader>
            <CardContent className="flex flex-1 items-center pb-4 px-2 min-h-0 mt-4">
                {/* Donut Chart (Left) */}
                <div className="relative w-1/2 h-full min-h-[100px] flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={data}
                                cx="50%"
                                cy="50%"
                                innerRadius="65%"
                                outerRadius="85%"
                                paddingAngle={5}
                                dataKey="value"
                                stroke="none"
                                cornerRadius={4}
                            >
                                {data.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip
                                contentStyle={{ backgroundColor: 'var(--popover)', border: '1px solid var(--border)', borderRadius: '12px' }}
                                itemStyle={{ color: 'var(--popover-foreground)', fontSize: '12px' }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                    {/* Center Text */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                        <span className="text-lg font-bold text-foreground leading-none">{total}</span>
                        <span className="text-[10px] text-muted-foreground uppercase">{unit}</span>
                    </div>
                </div>

                {/* Legend (Right) */}
                <div className="w-1/2 flex flex-col justify-center gap-2 pl-2">
                    {data.slice(0, 5).map((item, index) => (
                        <div key={index} className="flex items-center gap-2">
                            <div
                                className="w-2 h-2 rounded-full shrink-0"
                                style={{ backgroundColor: COLORS[index % COLORS.length] }}
                            />
                            <div className="flex flex-col min-w-0">
                                <span className="text-[12px] text-muted-foreground truncate" title={item.name}>{item.name}</span>
                            </div>
                        </div>
                    ))}
                    {data.length === 0 && (
                        <span className="text-xs text-muted-foreground italic">No Data</span>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}
