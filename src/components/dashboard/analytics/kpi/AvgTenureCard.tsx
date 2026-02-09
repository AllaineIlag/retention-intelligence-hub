"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { getAnalyticsSummary } from "@/app/actions/analytics"
import { endOfMonth, subDays, subMonths } from "date-fns"
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts"

interface AvgTenureCardProps {
    initialValue?: number
    className?: string
}

export function AvgTenureCard({ initialValue = 0, className }: AvgTenureCardProps) {
    const [value, setValue] = useState(initialValue)
    const [mode, setMode] = useState<'7d' | '30d' | '3m'>('30d')
    const [isLoading, setIsLoading] = useState(false)

    const handleToggle = async (newMode: '7d' | '30d' | '3m') => {
        if (newMode === mode) return
        setMode(newMode)
        setIsLoading(true)

        const today = new Date()
        let startDate = subDays(today, 30)

        if (newMode === '7d') startDate = subDays(today, 7)
        else if (newMode === '3m') startDate = subMonths(today, 3)

        const filters = {
            startDate,
            endDate: endOfMonth(today)
        }

        try {
            const res = await getAnalyticsSummary(filters)
            if (res.success && res.data) {
                setValue(res.data.avgTenureMonths)
            }
        } catch (error) {
            console.error("Failed to fetch avg tenure", error)
        } finally {
            setIsLoading(false)
        }
    }

    const getLabel = () => {
        if (mode === '7d') return 'Last 7 Days'
        if (mode === '3m') return 'Last 3 Months'
        return 'Last 30 Days'
    }

    const progress = Math.min((value / 36) * 100, 100) // Cap at 3 years for visual

    const chartData = [
        { name: 'Value', value: progress },
        { name: 'Remaining', value: 100 - progress },
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
                    Avg. Tenure
                </h3>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 gap-1 rounded-full border border-white/5 bg-white/5 px-2 text-[10px] font-medium text-zinc-400 transition-colors hover:bg-white/10 hover:text-zinc-300"
                        >
                            {mode.toUpperCase()}
                            <ChevronDown className="h-3 w-3" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-[120px] border-white/10 bg-zinc-950">
                        <DropdownMenuItem onClick={() => handleToggle('7d')} className="text-xs">Last 7 Days</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleToggle('30d')} className="text-xs">Last 30 Days</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleToggle('3m')} className="text-xs">Last 3 Months</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </CardHeader>
            <CardContent className="flex items-end justify-between pb-4 pt-0">
                <div className="flex flex-col">
                    <span className="text-2xl font-bold tracking-tight text-white">{value} mo</span>
                    <span className="text-[10px] text-muted-foreground uppercase font-medium mt-1">
                        Length of Service
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
                                <Cell key="value" fill="#6366f1" />
                                <Cell key="remaining" fill="#27272a" />
                            </Pie>
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    )
}
