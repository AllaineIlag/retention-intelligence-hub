'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { TurnoverDataPoint } from '@/app/actions/analytics';
import { motion } from 'framer-motion';

interface RatingDistributionProps {
    title: string;
    description?: string;
    data: TurnoverDataPoint[];
    totalResponses?: number;
    className?: string;
}

// Map rating labels to rough sentiment colors
const SENTIMENT_MAP: Record<string, string> = {
    // POSITIVE
    'Very good chance': 'bg-emerald-500',
    'Good chances': 'bg-teal-500',
    'Very compensating': 'bg-emerald-500',
    'Fair enough': 'bg-blue-500',
    'Very adequate': 'bg-emerald-500',
    'Adequate': 'bg-blue-500',
    'Just enough': 'bg-blue-500',
    'Minimal': 'bg-emerald-500', // For workload, minimal is usually good? Or maybe neutral. Context dependent.

    // NEGATIVE / WARNING
    'Little chances': 'bg-orange-500',
    'Very little': 'bg-amber-600',
    'No chances': 'bg-rose-500',
    'A bit low': 'bg-orange-500',
    'Very low': 'bg-rose-500',
    'Inadequate': 'bg-rose-500',
    'Too much': 'bg-rose-500',
};

const DEFAULT_COLOR = 'bg-slate-500';

export function RatingDistribution({ title, description, data, totalResponses = 0, className }: RatingDistributionProps) {
    // Sort logic? Usually provided data is already sorted by value desc. 
    // Ideally for ratings we want a fixed order (High to Low), but sticking to frequency for now is safer unless we strictly type the answers.

    return (
        <Card className={cn("col-span-1 h-full flex flex-col border-white/5 bg-white/[0.02]", className)}>
            <CardHeader className="pb-3">
                <CardTitle className="text-base font-medium tracking-tight h-[48px] flex items-center">{title}</CardTitle>
                {description && <CardDescription className="text-xs">{description}</CardDescription>}
            </CardHeader>
            <CardContent className="space-y-3 flex-1">
                {data.map((item, index) => {
                    const percentage = totalResponses > 0 ? (item.value / totalResponses) * 100 : 0;
                    const color = SENTIMENT_MAP[item.name] || DEFAULT_COLOR;

                    return (
                        <div key={item.name} className="space-y-1.5">
                            <div className="flex justify-between items-center text-xs">
                                <span className="font-medium text-muted-foreground/80">{item.name}</span>
                                <span className="font-mono text-muted-foreground">{Math.round(percentage)}%</span>
                            </div>
                            <div className="h-2 w-full bg-secondary/20 rounded-full overflow-hidden flex">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${percentage}%` }}
                                    transition={{ duration: 0.5, delay: index * 0.1 }}
                                    className={cn("h-full rounded-full opacity-80", color)}
                                />
                            </div>
                        </div>
                    );
                })}
                {data.length === 0 && (
                    <div className="text-center text-muted-foreground py-10 text-xs uppercase tracking-widest">No Data</div>
                )}
            </CardContent>
        </Card>
    );
}
