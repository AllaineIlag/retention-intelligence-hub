"use client"

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { usePageFilter } from '@/components/dashboard/page-filter-context';
import { ChevronDown, DollarSign } from "lucide-react"
import { cn } from "@/lib/utils"
import { getMoneyVsCulture } from "@/app/dashboard/analytics/reason-for-leaving/actions-market"
import { endOfMonth, startOfYear, subDays, subMonths } from "date-fns"

interface MoneyVsCultureCardProps {
    initialValue?: string
    initialSubValue?: string
    initialItems?: { label: string; value: number }[]
    className?: string
}

export function MoneyVsCultureCard({
    initialValue = "N/A",
    initialSubValue = "No data",
    initialItems = [],
    className
}: MoneyVsCultureCardProps) {
    const [value, setValue] = useState(initialValue)
    const [subValue, setSubValue] = useState(initialSubValue)
    const [items, setItems] = useState(initialItems)
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
            const res = await getMoneyVsCulture(filters)
            setValue(String(res.value))
            setSubValue(res.subValue || "No data")
            setItems(res.items || [])
        } catch (error) {
            console.error("Failed to fetch money vs culture", error)
        } finally {
            setIsLoading(false)
        }
    }

    // Safe calculation for bar width
    const financialVal = items.find(i => i.label === 'Financial')?.value || 0
    const culturalVal = items.find(i => i.label === 'Cultural')?.value || 0
    const total = financialVal + culturalVal || 1
    const financialPct = (financialVal / total) * 100

    return (
        <Card className={cn("border border-border bg-card/50 shadow-sm flex flex-col justify-between h-full rounded-3xl relative overflow-hidden", className)}>
            {isLoading && (
                <div className="absolute inset-0 bg-background/50 backdrop-blur-sm z-10 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                </div>
            )}
            <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
                <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground line-clamp-1">
                    Money vs Culture
                </h3>
                <div className="flex items-center gap-2">
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
                    <div className="p-2 rounded-full bg-purple-500/10 text-purple-400">
                        <DollarSign className="h-4 w-4" />
                    </div>
                </div>
            </CardHeader>
            <CardContent className="h-full flex flex-col justify-end pb-6">
                <h3 className="text-2xl font-bold text-foreground mb-1 truncate" title={value}>
                    {value}
                </h3>
                <p className="text-xs text-muted-foreground mb-6">{subValue}</p>

                {/* Progress Bar Visual */}
                <div className="h-4 w-full bg-accent rounded-full overflow-hidden flex mb-3 ring-1 ring-border">
                    <div
                        style={{ width: `${financialPct}%` }}
                        className="bg-emerald-500 h-full transition-all duration-1000 ease-out"
                    />
                    <div
                        className="bg-purple-500 h-full flex-1 transition-all duration-1000 ease-out"
                    />
                </div>

                <div className="flex justify-between text-[10px] text-muted-foreground font-medium">
                    <span className="flex items-center gap-1.5">
                        <div className="h-2 w-2 rounded-full bg-emerald-500"></div>
                        Financial ({financialVal})
                    </span>
                    <span className="flex items-center gap-1.5">
                        Cultural ({culturalVal})
                        <div className="h-2 w-2 rounded-full bg-purple-500"></div>
                    </span>
                </div>
            </CardContent>
        </Card>
    )
}
