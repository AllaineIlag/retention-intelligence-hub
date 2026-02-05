'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { TurnoverDataPoint } from '@/app/actions/analytics';
import { ThumbsUp, ThumbsDown, Minus } from 'lucide-react';
import { motion } from 'framer-motion';
import { DetailsDialog } from '@/components/ui/details-dialog';
import { VerdictScorecardModal } from './modals/VerdictScorecardModal';

interface VerdictCardProps {
    data: TurnoverDataPoint[];
    totalResponses?: number;
    className?: string;
}

export function VerdictCard({ data, totalResponses = 0, className }: VerdictCardProps) {
    // Calculate "Yes" percentage
    const yesData = data.find(d => d.name === 'Yes');
    const yesCount = yesData ? yesData.value : 0;
    const percentage = totalResponses > 0 ? Math.round((yesCount / totalResponses) * 100) : 0;

    // Detailed stats for modal
    const promoters = yesCount;
    const detractors = data.find(d => d.name === 'No')?.value || 0;
    const passives = data.find(d => d.name === 'Maybe')?.value || 0;

    let verdict = 'Neutral';
    let color = 'text-amber-500';
    let gradientFrom = 'from-amber-500/5';
    let Icon = Minus;

    if (percentage >= 70) {
        verdict = 'Excellent';
        color = 'text-emerald-500';
        gradientFrom = 'from-emerald-500/5';
        Icon = ThumbsUp;
    } else if (percentage >= 50) {
        verdict = 'Good';
        color = 'text-blue-500';
        gradientFrom = 'from-blue-500/5';
        Icon = ThumbsUp;
    } else if (percentage < 30) {
        verdict = 'Critical';
        color = 'text-rose-500';
        gradientFrom = 'from-rose-500/5';
        Icon = ThumbsDown;
    } else {
        verdict = 'Concerning';
        color = 'text-orange-500';
        gradientFrom = 'from-orange-500/5';
        Icon = ThumbsDown;
    }


    return (
        <DetailsDialog
            title="Verdict Scorecard"
            description="Detailed breakdown of employee sentiment and recommendation likelihood."
            trigger={
                <Card className={cn("relative overflow-hidden border-white/5 bg-white/[0.02] backdrop-blur-sm transition-all hover:bg-white/[0.04] hover:border-white/10 group cursor-pointer", className)}>
                    <div className={cn("absolute inset-0 -z-10 bg-gradient-to-br to-transparent opacity-0 group-hover:opacity-100 transition-opacity", gradientFrom)} />

                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                            Recommendation Score
                        </CardTitle>
                        <div className={cn("flex items-center gap-1.5 transition-colors", color)}>
                            <span className="text-[10px] font-bold uppercase tracking-wider opacity-80">{verdict}</span>
                            <Icon className="h-4 w-4" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <motion.div
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            key={percentage}
                            className="text-2xl font-bold tracking-tight"
                        >
                            {percentage}%
                        </motion.div>
                        <p className="text-[10px] text-muted-foreground/60 mt-1 uppercase tracking-tight">
                            Based on {totalResponses} responses
                        </p>
                    </CardContent>
                </Card>
            }
        >
            <VerdictScorecardModal
                score={percentage}
                verdict={verdict}
                details={{
                    promoters,
                    detractors,
                    passives,
                    total: totalResponses
                }}
            />
        </DetailsDialog>
    );
}
