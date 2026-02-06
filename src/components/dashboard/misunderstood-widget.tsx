'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CorrectionStat, getMisunderstoodQuestions } from '@/app/actions/dashboard';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AlertCircle } from 'lucide-react';
import { useState, useEffect, useTransition } from 'react';
import { ChartTimeFilter, TimeRange } from '@/components/dashboard/analytics/chart-time-filter';
import { Skeleton } from '@/components/ui/skeleton';

interface MisunderstoodWidgetProps {
    initialData?: CorrectionStat[];
}

export function MisunderstoodWidget({ initialData }: MisunderstoodWidgetProps) {
    const [timeRange, setTimeRange] = useState<TimeRange>('30d');
    const [data, setData] = useState<CorrectionStat[]>(initialData || []);
    const [isPending, startTransition] = useTransition();

    useEffect(() => {
        const fetchData = async () => {
            const endDate = new Date();
            const startDate = new Date();

            if (timeRange === '7d') startDate.setDate(endDate.getDate() - 7);
            if (timeRange === '30d') startDate.setDate(endDate.getDate() - 30);
            if (timeRange === '3m') startDate.setMonth(endDate.getMonth() - 3);

            startTransition(async () => {
                const res = await getMisunderstoodQuestions({ startDate, endDate });
                if (res.success && res.data) {
                    setData(res.data);
                }
            });
        };

        fetchData();
    }, [timeRange]);

    // Find max for scaling progress bars
    const maxCount = Math.max(...data.map(d => d.count), 1);

    return (
        <Card className="col-span-1 border-white/5 bg-white/[0.02] backdrop-blur-sm shadow-xl relative group overflow-hidden h-[400px] flex flex-col">
            <div className="absolute inset-0 -z-10 bg-gradient-to-br from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <CardHeader className="pb-4 flex flex-row items-start justify-between space-y-0">
                <div>
                    <CardTitle className="flex items-center gap-2 text-lg font-bold text-white tracking-tight">
                        <div className="p-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20">
                            <AlertCircle className="h-4 w-4 text-indigo-400" />
                        </div>
                        Perception Gap
                    </CardTitle>
                    <CardDescription className="text-[10px] uppercase tracking-widest text-muted-foreground/60">
                        Reality vs. Perception.
                    </CardDescription>
                </div>
                <ChartTimeFilter value={timeRange} onChange={setTimeRange} />
            </CardHeader>
            <CardContent className="flex-1 min-h-0 p-0 relative">
                {isPending && (
                    <div className="absolute inset-0 bg-black/10 backdrop-blur-[1px] z-10 flex items-center justify-center">
                        <Skeleton className="h-full w-full opacity-10" />
                    </div>
                )}
                <ScrollArea className="h-full px-6 pb-6">
                    {data.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-40 text-muted-foreground/50 text-xs">
                            <p className="font-medium">Strategic Alignment Achieved</p>
                            <p className="opacity-50 mt-1 uppercase tracking-tighter italic">No corrections logged yet.</p>
                        </div>
                    ) : (
                        <div className="space-y-5">
                            {data.map((item) => (
                                <div key={item.questionKey} className="space-y-2">
                                    <div className="flex justify-between items-end gap-4 overflow-hidden">
                                        <span className="font-medium text-sm text-gray-200 truncate">{item.questionText}</span>
                                        <span className="text-[10px] font-bold text-indigo-400 shrink-0 uppercase tracking-widest bg-indigo-400/5 px-2 py-0.5 rounded border border-indigo-400/10">{item.count}</span>
                                    </div>
                                    <Progress
                                        value={(item.count / maxCount) * 100}
                                        className="h-1 bg-white/5 [&>div]:bg-gradient-to-r [&>div]:from-indigo-600 [&>div]:to-indigo-400 [&>div]:shadow-[0_0_8px_rgba(99,102,241,0.4)]"
                                    />
                                </div>
                            ))}
                        </div>
                    )}
                </ScrollArea>
            </CardContent>
        </Card>
    );
}
