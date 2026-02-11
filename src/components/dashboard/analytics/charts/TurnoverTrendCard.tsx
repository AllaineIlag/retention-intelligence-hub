'use client';

import { useState, useEffect, useRef } from 'react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar,
    ReferenceLine
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getTurnoverTrends } from '@/app/actions/analytics';
import { cn } from '@/lib/utils';
import { startOfMonth, endOfMonth, subDays, subMonths, startOfYear } from 'date-fns';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { usePageFilter } from '@/components/dashboard/page-filter-context';

interface TurnoverTrendCardProps {
    data: { name: string; resignations: number; retention: number }[];
    className?: string;
}

export function TurnoverTrendCard({ data: initialData, className }: TurnoverTrendCardProps) {
    const [data, setData] = useState<{ name: string; resignations: number; retention: number }[]>(initialData);
    const [isLoading, setIsLoading] = useState(false);
    const [range, setRange] = useState("6m");
    const { pageFilter, version } = usePageFilter();
    const lastVersionRef = useRef(version);

    // Sync with page-level filter
    useEffect(() => {
        if (version !== lastVersionRef.current) {
            lastVersionRef.current = version;
            if (pageFilter) {
                handleRangeChange(pageFilter, true);
            } else {
                handleRangeChange('6m', true);
            }
        }
    }, [pageFilter, version]);

    const handleRangeChange = async (value: string, force = false) => {
        if (!force && value === range) return;
        setIsLoading(true);

        const today = new Date();
        let startDate: Date;

        switch (value) {
            case '7d': startDate = subDays(today, 7); break;
            case '30d': startDate = subDays(today, 30); break;
            case '3m': startDate = subMonths(today, 3); break;
            case '12m': startDate = subMonths(today, 12); break;
            case 'ytd': startDate = startOfYear(today); break;
            default: startDate = subMonths(today, 6); break; // 6m
        }

        try {
            const apiFilters = {
                startDate: startOfMonth(startDate),
                endDate: endOfMonth(today),
                department: undefined // Trend is usually global, but could add dept filter back if needed
            };

            const response = await getTurnoverTrends(apiFilters);

            if (response.success && response.data) {
                setData(response.data as any);
            }
        } catch (error) {
            console.error("Failed to fetch turnover trends", error);
        } finally {
            setIsLoading(false);
        }
    };

    // 2% Target Calculation
    const TARGET_THRESHOLD = 100;

    return (
        <Card className={cn("col-span-1 border-white/5 bg-white/[0.02] rounded-3xl relative overflow-hidden", className)}>
            {isLoading && (
                <div className="absolute inset-0 bg-background/50 backdrop-blur-sm z-10 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
            )}
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div>
                    <CardTitle className="text-base font-medium tracking-tight">Turnover Trend</CardTitle>
                    <CardDescription>
                        Monthly resignations vs Target
                    </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                    <Select value={range} onValueChange={handleRangeChange}>
                        <SelectTrigger className="w-[140px] h-8 text-xs border-white/10 bg-white/5" suppressHydrationWarning>
                            <SelectValue placeholder="Select range" />
                        </SelectTrigger>
                        <SelectContent className="border-white/10 bg-zinc-950">
                            <SelectItem value="7d">Last 7 Days</SelectItem>
                            <SelectItem value="30d">Last 30 Days</SelectItem>
                            <SelectItem value="3m">Last 3 Months</SelectItem>
                            <SelectItem value="6m">Last 6 Months</SelectItem>
                            <SelectItem value="12m">Last 12 Months</SelectItem>
                            <SelectItem value="ytd">Year to Date</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </CardHeader>
            <CardContent className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                    {data.length === 1 ? (
                        <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.1} />
                            <XAxis
                                dataKey="name"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                                stroke="#52525b"
                                dy={10}
                            />
                            <YAxis
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                                stroke="#52525b"
                            />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '6px' }}
                                itemStyle={{ color: '#e4e4e7', fontSize: '12px' }}
                            />
                            <ReferenceLine
                                y={TARGET_THRESHOLD}
                                stroke="#fbbf24"
                                strokeDasharray="3 3"
                                label={{ position: 'insideTopRight', value: '2% Target (100)', fill: '#fbbf24', fontSize: 10 }}
                            />
                            <Bar
                                dataKey="resignations"
                                fill="#f43f5e"
                                radius={[4, 4, 0, 0]}
                                barSize={60}
                                name="Resignations"
                                animationDuration={1000}
                            />
                        </BarChart>
                    ) : (
                        <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorResignations" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <XAxis
                                dataKey="name"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                                stroke="#52525b"
                                dy={10}
                            />
                            <YAxis
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                                stroke="#52525b"
                            />
                            <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.1} />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '6px' }}
                                itemStyle={{ color: '#e4e4e7', fontSize: '12px' }}
                            />
                            <ReferenceLine
                                y={TARGET_THRESHOLD}
                                stroke="#fbbf24"
                                strokeDasharray="3 3"
                                label={{ position: 'insideTopRight', value: '2% Target (100)', fill: '#fbbf24', fontSize: 10 }}
                            />
                            <Area
                                type="monotone"
                                dataKey="resignations"
                                stroke="#f43f5e"
                                fillOpacity={1}
                                fill="url(#colorResignations)"
                                name="Resignations"
                            />
                        </AreaChart>
                    )}
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
}
