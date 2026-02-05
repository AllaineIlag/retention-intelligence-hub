'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TurnoverKPIProps {
    rate: number;
}

export function TurnoverKPI({ rate }: TurnoverKPIProps) {
    // 2% Goal Logic
    // Green: 1.8% - 2.2% (Stable)
    // Red: > 2.2% (Action Required)
    // Low (< 1.8): Technical "Good" for retention but maybe "Stagnant"? treating as OK/Blue for now.

    let colorClass = 'text-blue-500';
    let statusText = 'Low';

    if (rate >= 1.8 && rate <= 2.2) {
        colorClass = 'text-emerald-500';
        statusText = 'Stable';
    } else if (rate > 2.2) {
        colorClass = 'text-rose-500';
        statusText = 'Action Required';
    }

    return (
        <Card className="relative overflow-hidden border-white/5 bg-white/[0.02] backdrop-blur-sm group">
            <div className={cn("absolute inset-0 -z-10 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity",
                rate > 2.2 ? "from-rose-500/10" : "from-emerald-500/10")}
            />
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Turnover Rate
                </CardTitle>
                <Activity className={cn("h-4 w-4 transition-colors", colorClass)} />
            </CardHeader>
            <CardContent>
                <div className="flex items-baseline space-x-2">
                    <div className="text-2xl font-bold tracking-tight">{rate.toFixed(1)}%</div>
                    <span className={cn("text-[10px] uppercase font-semibold", colorClass)}>
                        {statusText}
                    </span>
                </div>
                <p className="text-[10px] text-muted-foreground/60 mt-1 uppercase tracking-tight">
                    Target: 2.0% (Cap 5000)
                </p>
            </CardContent>
        </Card>
    );
}
