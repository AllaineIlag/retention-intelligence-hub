"use client"

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { usePageFilter } from '@/components/dashboard/page-filter-context';
import { ChevronDown, LineChart } from "lucide-react"
import { cn } from "@/lib/utils"
import { getAttritionTrendData, AttritionTrendData } from "@/app/dashboard/analytics/reason-for-leaving/actions-trend"
import { endOfMonth, startOfYear, subDays, subMonths } from "date-fns"
import { MultiSeriesTrendChart } from '@/components/analytics/MultiSeriesTrendChart';

interface TrendCardProps {
    initialData?: AttritionTrendData[]
    className?: string
}

export function TrendCard({ initialData = [], className }: TrendCardProps) {
    const [data, setData] = useState<AttritionTrendData[]>(initialData)
    const [mode, setMode] = useState<'7d' | '30d' | '3m' | '6m' | '12m' | 'ytd'>('12m')
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
                handleToggle('12m', true) // Default to 12m for trends usually
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
            const res = await getAttritionTrendData(filters)
            setData(res)
        } catch (error) {
            console.error("Failed to fetch trend data", error)
        } finally {
            setIsLoading(false)
        }
    }

    // Extract unique reasons for chart lines from the data
    const allKeys = Array.from(new Set(data.flatMap(d => Object.keys(d).filter(k => k !== 'month'))));

    // Generate colors dynamically or use a preset palette
    const COLORS = ['var(--chart-1)', 'var(--chart-2)', 'var(--chart-3)', 'var(--chart-4)', 'var(--chart-5)'];
    const options = allKeys.map((key, i) => ({
        label: key,
        color: COLORS[i % COLORS.length]
    }));

    return (
        <Card className={cn("border border-white/5 bg-white/[0.02] shadow-sm flex flex-col h-full rounded-3xl relative overflow-hidden", className)}>
            {isLoading && (
                <div className="absolute inset-0 bg-background/50 backdrop-blur-sm z-10 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                </div>
            )}
            <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
                <div className="flex flex-col gap-1">
                    <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        Trend Analysis
                    </h3>
                    <h2 className="text-lg font-bold text-white">Frequency Over Time</h2>
                </div>
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
                    <DropdownMenuContent align="end" className="w-[140px] border-border bg-popover">
                        <DropdownMenuItem onClick={() => handleToggle('7d')} className="text-xs">Last 7 Days</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleToggle('30d')} className="text-xs">Last 30 Days</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleToggle('3m')} className="text-xs">Last 3 Months</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleToggle('6m')} className="text-xs">Last 6 Months</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleToggle('12m')} className="text-xs">Last 12 Months</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleToggle('ytd')} className="text-xs">Year to Date</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </CardHeader>
            <CardContent className="flex-1 min-h-[300px] pt-4">
                <MultiSeriesTrendChart data={data} options={options} />
                <div className="absolute top-6 right-16 p-2 rounded-full bg-primary/10 text-primary">
                    <LineChart className="h-4 w-4" />
                </div>
            </CardContent>
        </Card>
    )
}
