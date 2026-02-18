"use client"

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { usePageFilter } from '@/components/dashboard/page-filter-context';
import { ChevronDown, ArrowDownRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { getAnalyticsSummary } from "@/app/actions/analytics"
import { endOfMonth, startOfYear, subDays, subMonths } from "date-fns"
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts"

interface LowestExitReasonCardProps {
    initialValue?: string
    initialPercent?: number
    className?: string
}

export function LowestExitReasonCard({ initialValue = "No Data", initialPercent = 0, className }: LowestExitReasonCardProps) {
    const [reason, setReason] = useState(initialValue)
    const [percent, setPercent] = useState(initialPercent)
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

    const handleToggle = async (newMode: '7d' | '30d' | '3m' | '6m' | '12m' | 'ytd', force = false) => {
        if (!force && newMode === mode) return;
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
            const res = await getAnalyticsSummary(filters)
            if (res.success && res.data) {
                const driver = res.data.lowestDriver
                setReason(driver ? driver.reason : "No Data")
                setPercent(driver ? driver.percentage : 0)
            }
        } catch (error) {
            console.error("Failed to fetch lowest exit reason", error)
        } finally {
            setIsLoading(false)
        }
    }

    const getLabel = () => {
        switch (mode) {
            case '7d': return 'Last 7 Days'
            case '3m': return 'Last 3 Months'
            case '6m': return 'Last 6 Months'
            case '12m': return 'Last 12 Months'
            case 'ytd': return 'Year to Date'
            default: return 'Last 30 Days'
        }
    }

    const chartData = [
        { name: 'Value', value: percent },
        { name: 'Remaining', value: 100 - percent },
    ]

    return (
        <Card className={cn("border border-white/5 bg-white/[0.02] shadow-sm flex flex-col justify-between h-full rounded-3xl relative overflow-hidden", className)}>
            {isLoading && (
                <div className="absolute inset-0 bg-background/50 backdrop-blur-sm z-10 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                </div>
            )}
            <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
                <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground line-clamp-1">
                    Lowest Exit Reason
                </h3>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 gap-1 rounded-full border border-white/5 bg-white/5 px-2 text-[10px] font-medium text-zinc-400 transition-colors hover:bg-white/10 hover:text-zinc-300"
                            suppressHydrationWarning
                        >
                            {mode.toUpperCase()}
                            <ChevronDown className="h-3 w-3" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-[140px] border-white/10 bg-zinc-950">
                        <DropdownMenuItem onClick={() => handleToggle('7d')} className="text-xs">Last 7 Days</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleToggle('30d')} className="text-xs">Last 30 Days</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleToggle('3m')} className="text-xs">Last 3 Months</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleToggle('6m')} className="text-xs">Last 6 Months</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleToggle('12m')} className="text-xs">Last 12 Months</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleToggle('ytd')} className="text-xs">Year to Date</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </CardHeader>
            <CardContent className="flex items-end justify-between pb-4 pt-0">
                <div className="flex flex-col max-w-[65%]">
                    <span className="text-lg font-bold tracking-tight text-white leading-tight line-clamp-2" title={reason}>
                        {reason}
                    </span>
                    <span className="text-[10px] text-muted-foreground uppercase font-medium mt-1">
                        {getLabel()}
                    </span>
                </div>
                <div className="h-[50px] w-[50px] relative">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={chartData}
                                cx="50%"
                                cy="50%"
                                innerRadius={18}
                                outerRadius={24}
                                startAngle={90}
                                endAngle={-270}
                                dataKey="value"
                                stroke="none"
                            >
                                <Cell key="value" fill="#10b981" />
                                <Cell key="remaining" fill="#27272a" />
                            </Pie>
                        </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-[10px] font-bold text-white">{percent}%</span>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
