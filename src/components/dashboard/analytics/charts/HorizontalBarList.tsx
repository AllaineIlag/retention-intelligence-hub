'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { TurnoverDataPoint } from '@/app/actions/analytics';
import { motion } from 'framer-motion';

interface HorizontalBarListProps {
    title: string;
    description?: string;
    data: TurnoverDataPoint[];
    totalResponses?: number;
    className?: string;
    colorClass?: string;
}

export function HorizontalBarList({ title, description, data, totalResponses, className, colorClass = "bg-blue-600" }: HorizontalBarListProps) {
    const displayData = data.slice(0, 8); // Top 8
    const maxVal = displayData[0]?.value || 1;

    return (
        <Card className={cn("col-span-1 h-full flex flex-col overflow-hidden relative border-white/5 bg-white/[0.02]", className)}>
            <div className="absolute inset-0 -z-10 bg-gradient-to-br from-blue-500/5 via-transparent to-transparent opacity-50" />
            <CardHeader className="pb-2">
                <CardTitle className="text-base font-medium tracking-tight">{title}</CardTitle>
                {description && <CardDescription className="text-xs">{description}</CardDescription>}
            </CardHeader>
            <CardContent className="space-y-4 flex-1">
                {displayData.map((item, index) => (
                    <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        key={item.name}
                        className="space-y-1 group"
                    >
                        <div className="flex items-center justify-between text-sm">
                            <span className="font-medium truncate pr-2 max-w-[200px] text-muted-foreground group-hover:text-foreground transition-colors" title={item.name}>{item.name}</span>
                            <span className="text-muted-foreground tabular-nums text-xs">
                                {item.value} <span className="opacity-50">/</span> {totalResponses ? Math.round((item.value / totalResponses) * 100) : 0}%
                            </span>
                        </div>
                        <div className="relative h-1.5 w-full bg-secondary/30 rounded-full overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${(item.value / maxVal) * 100}%` }}
                                transition={{ duration: 0.8, ease: "easeOut" }}
                                className={cn("h-full rounded-full transition-all duration-500 ease-out", colorClass)}
                            />
                        </div>
                    </motion.div>
                ))}

                {displayData.length === 0 && (
                    <div className="text-center text-muted-foreground py-10 text-xs uppercase tracking-widest">No Data</div>
                )}
            </CardContent>
        </Card>
    );
}
