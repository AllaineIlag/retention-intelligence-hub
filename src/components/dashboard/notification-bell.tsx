"use client"

import * as React from "react"
import { Bell } from "lucide-react"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { getDashboardStats } from "@/app/actions/dashboard"
import { cn } from "@/lib/utils"

export function NotificationBell() {
    const [stats, setStats] = React.useState<{ turnoverRate: number } | null>(null)
    const [loading, setLoading] = React.useState(true)

    React.useEffect(() => {
        getDashboardStats().then(res => {
            if (res.success && res.data) {
                setStats(res.data)
            }
            setLoading(false)
        })
    }, [])

    // Threshold Logic
    const THRESHOLD = 2.2
    const currentRate = stats?.turnoverRate || 0
    const isAlert = currentRate > THRESHOLD

    if (loading) return (
        <Button variant="ghost" size="icon" className="relative text-zinc-400">
            <Bell className="h-5 w-5" />
        </Button>
    )

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="relative hover:bg-white/5">
                    <Bell className={cn("h-5 w-5", isAlert ? "text-red-400" : "text-zinc-400")} />
                    {isAlert && (
                        <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-red-500 ring-2 ring-[#0f0f11]" />
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 border-white/5 bg-[#0f0f11]/95 backdrop-blur-xl text-white p-0 shadow-2xl rounded-2xl" align="end">
                <div className="p-4 border-b border-white/5 bg-white/[0.02]">
                    <div className="flex items-center gap-2">
                        <Bell className="h-4 w-4 text-indigo-400" />
                        <h4 className="font-medium text-sm text-zinc-200">System Notifications</h4>
                    </div>
                </div>
                <div className="p-4">
                    {isAlert ? (
                        <div className="flex gap-3 items-start">
                            <span className="relative flex h-2 w-2 mt-2 translate-y-0.5">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                            </span>
                            <div className="space-y-1">
                                <p className="text-sm font-medium text-red-400">High Turnover Alert</p>
                                <p className="text-xs text-zinc-400 leading-relaxed">
                                    Global turnover has spiked to <span className="text-white font-medium">{currentRate}%</span> this week. This exceeds the 2.2% safety threshold.
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-6 text-center text-zinc-500 space-y-2">
                            <Bell className="h-8 w-8 opacity-20" />
                            <p className="text-xs">All systems nominal.</p>
                            <p className="text-[10px] opacity-70">Turnover is currently {currentRate}%</p>
                        </div>
                    )}
                </div>
            </PopoverContent>
        </Popover>
    )
}
