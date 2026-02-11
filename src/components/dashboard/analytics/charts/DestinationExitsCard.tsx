"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { getCountryStats } from "@/app/actions/analytics"
import { endOfMonth, subDays, subMonths } from "date-fns"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts"

interface DestinationExitsCardProps {
    initialData?: { name: string; value: number }[]
    className?: string
}

const COLORS = ['#14b8a6', '#10b981', '#6366f1', '#8b5cf6', '#f43f5e']

export function DestinationExitsCard({ initialData = [], className }: DestinationExitsCardProps) {
    const [data, setData] = useState(initialData)
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
            const res = await getCountryStats(filters)
            if (res.success && res.data) {
                setData(res.data)
            }
        } catch (error) {
            console.error("Failed to fetch destination stats", error)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Card className={cn("col-span-1 border-white/5 bg-white/[0.02] h-full flex flex-col rounded-3xl relative overflow-hidden", className)}>
            {isLoading && (
                <div className="absolute inset-0 bg-background/50 backdrop-blur-sm z-10 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                </div>
            )}
            <CardHeader className="shrink-0 flex flex-row items-start justify-between space-y-0">
                <div className="space-y-1">
                    <CardTitle className="text-sm font-medium tracking-tight">Destination of Exits</CardTitle>
                    <CardDescription className="text-xs">Top destinations for jobs abroad</CardDescription>
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
                    <DropdownMenuContent align="end" className="w-[120px] border-white/10 bg-zinc-950">
                        <DropdownMenuItem onClick={() => handleToggle('7d')} className="text-xs">Last 7 Days</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleToggle('30d')} className="text-xs">Last 30 Days</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleToggle('3m')} className="text-xs">Last 3 Months</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </CardHeader>
            <CardContent className="flex-1 min-h-[250px]">
                {data.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart margin={{ top: 0, bottom: 0 }}>
                            <Pie
                                data={data}
                                cx="50%"
                                cy="50%"
                                innerRadius={45}
                                outerRadius={70}
                                paddingAngle={2}
                                dataKey="value"
                                stroke="none"
                            >
                                {data.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip
                                contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '6px' }}
                                itemStyle={{ color: '#e4e4e7', fontSize: '12px' }}
                            />
                            <Legend
                                verticalAlign="bottom"
                                height={36}
                                iconType="circle"
                                iconSize={8}
                                wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="flex h-full items-center justify-center text-muted-foreground text-xs">
                        No data available
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
