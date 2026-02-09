'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { cn } from '@/lib/utils';
import { getAnalyticsSummary } from '@/app/actions/analytics';
import { startOfMonth, endOfMonth, startOfYear, subDays, subMonths } from 'date-fns';
import { Button } from '@/components/ui/button';
import { ChevronDown } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface TurnoverRateCardProps {
    initialRate: number;
    className?: string;
}

export function TurnoverRateCard({ initialRate, className }: TurnoverRateCardProps) {
    const [rate, setRate] = useState(initialRate);
    const [mode, setMode] = useState<'7d' | '30d' | '3m'>('30d'); // Default to 30d
    const [isLoading, setIsLoading] = useState(false);

    const handleToggle = async (newMode: '7d' | '30d' | '3m') => {
        if (newMode === mode) return;
        setMode(newMode);
        setIsLoading(true);

        const today = new Date();
        let startDate = subDays(today, 30);

        if (newMode === '7d') {
            startDate = subDays(today, 7);
        } else if (newMode === '3m') {
            startDate = subMonths(today, 3);
        }

        const filters = {
            startDate: startDate,
            endDate: endOfMonth(today), // Keep end date as today/end of month
        };

        try {
            const res = await getAnalyticsSummary(filters);
            if (res.success && res.data) {
                setRate(res.data.turnoverRate);
            }
        } catch (error) {
            console.error("Failed to fetch turnover rate", error);
        } finally {
            setIsLoading(false);
        }
    };

    const progress = Math.min((rate / 3) * 100, 100);
    const color = rate > 2.2 ? '#f43f5e' : '#10b981';
    const TRACK_COLOR = '#27272a';

    const data = [
        { name: 'Value', value: progress },
        { name: 'Remaining', value: 100 - progress },
    ];

    const getLabel = () => {
        if (mode === '7d') return 'Last 7 Days';
        if (mode === '3m') return 'Last 3 Months';
        return 'Last 30 Days';
    }

    return (
        <Card className={cn("border border-white/5 bg-white/[0.02] shadow-sm flex flex-col justify-between h-full rounded-3xl relative overflow-hidden", className)}>
            {isLoading && (
                <div className="absolute inset-0 bg-background/50 backdrop-blur-sm z-10 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                </div>
            )}
            <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
                <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground line-clamp-1">
                    Turnover Rate
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
                        <DropdownMenuItem onClick={() => handleToggle('7d')} className="text-xs">
                            Last 7 Days
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleToggle('30d')} className="text-xs">
                            Last 30 Days
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleToggle('3m')} className="text-xs">
                            Last 3 Months
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </CardHeader>
            <CardContent className="flex items-end justify-between pb-4 pt-0">
                <div className="flex flex-col">
                    <span className="text-2xl font-bold tracking-tight text-white">{rate.toFixed(1)}%</span>
                    <span className="text-[10px] text-muted-foreground uppercase font-medium mt-1">
                        {getLabel()}
                    </span>
                </div>

                {/* Ring Chart */}
                <div className="h-10 w-10 shrink-0 relative">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={data}
                                cx="50%"
                                cy="50%"
                                innerRadius={14}
                                outerRadius={18}
                                startAngle={90}
                                endAngle={-270}
                                dataKey="value"
                                stroke="none"
                                cornerRadius={3}
                            >
                                <Cell key="value" fill={color} />
                                <Cell key="remaining" fill={TRACK_COLOR} />
                            </Pie>
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
}
