'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ThumbsUp, ThumbsDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { TurnoverDataPoint } from '@/app/actions/analytics';

interface VerdictScorecardProps {
    data: TurnoverDataPoint[];
    totalResponses?: number;
    className?: string;
}

export function VerdictScorecard({ data, totalResponses, className }: VerdictScorecardProps) {
    // Find Yes/No counts
    const yesCount = data.find(d => d.name.toLowerCase() === 'yes')?.value || 0;
    const noCount = data.find(d => d.name.toLowerCase() === 'no')?.value || 0;

    // Calculate percentage based on total responses to be accurate
    const total = totalResponses || (yesCount + noCount) || 1;
    const approvalRate = Math.round((yesCount / total) * 100);

    // Determine Sentiment
    let sentiment: 'positive' | 'neutral' | 'negative' = 'neutral';
    if (approvalRate >= 70) sentiment = 'positive';
    else if (approvalRate <= 40) sentiment = 'negative';

    return (
        <Card className={cn("col-span-1 h-full flex flex-col overflow-hidden relative", className)}>
            <div className={cn(
                "absolute top-0 left-0 w-1 h-full transition-colors duration-500",
                sentiment === 'positive' ? "bg-emerald-500" :
                    sentiment === 'negative' ? "bg-rose-500" : "bg-amber-500"
            )} />

            <CardHeader>
                <CardTitle className="text-base text-muted-foreground">The Verdict</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col justify-center items-center pb-8">
                <div className="flex items-center gap-4 mb-2">
                    {sentiment === 'positive' && <ThumbsUp className="w-12 h-12 text-emerald-500 animate-in zoom-in duration-300" />}
                    {sentiment === 'negative' && <ThumbsDown className="w-12 h-12 text-rose-500 animate-in zoom-in duration-300" />}
                    {sentiment === 'neutral' && <Minus className="w-12 h-12 text-amber-500 animate-in zoom-in duration-300" />}

                    <span className={cn(
                        "text-6xl font-black tracking-tighter",
                        sentiment === 'positive' ? "text-emerald-500" :
                            sentiment === 'negative' ? "text-rose-500" : "text-foreground"
                    )}>
                        {approvalRate}%
                    </span>
                </div>

                <p className="text-sm font-medium text-muted-foreground text-center max-w-[200px]">
                    of departing employees would recommend us.
                </p>

                <div className="mt-6 flex gap-8 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                        <div className="w-2 h-2 rounded-full bg-emerald-500" />
                        <span className="font-semibold text-foreground">{yesCount}</span> Promoters
                    </div>
                    <div className="flex items-center gap-1">
                        <div className="w-2 h-2 rounded-full bg-rose-500" />
                        <span className="font-semibold text-foreground">{noCount}</span> Detractors
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
