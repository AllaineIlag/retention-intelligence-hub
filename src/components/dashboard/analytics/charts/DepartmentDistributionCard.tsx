'use client';

import { useState, useEffect, useRef } from 'react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TurnoverDataPoint, getDepartmentBreakdown } from '@/app/actions/analytics';
import { cn } from '@/lib/utils';
import { CardFilter, FilterState } from '@/components/dashboard/card-filter';
import { startOfMonth, endOfMonth, subDays, subMonths, startOfYear } from 'date-fns';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { usePageFilter } from '@/components/dashboard/page-filter-context';

interface DepartmentDistributionCardProps {
    data: TurnoverDataPoint[];
    className?: string;
}

export function DepartmentDistributionCard({ data: initialData, className }: DepartmentDistributionCardProps) {
    const [data, setData] = useState<TurnoverDataPoint[]>(initialData);
    const [isLoading, setIsLoading] = useState(false);
    const [range, setRange] = useState("30d");
    const { pageFilter, version } = usePageFilter();
    const lastVersionRef = useRef(version);

    // Sync with page-level filter
    useEffect(() => {
        if (version !== lastVersionRef.current) {
            lastVersionRef.current = version;
            if (pageFilter) {
                handleRangeChange(pageFilter, true);
            } else {
                handleRangeChange('30d', true);
            }
        }
    }, [pageFilter, version]);

    const handleRangeChange = async (value: string, force = false) => {
        if (!force && value === range) return;
        setRange(value); // Fix: Always update local state when forced or changed
        setIsLoading(true);

        const today = new Date();
        let startDate: Date;

        switch (value) {
            case '7d': startDate = subDays(today, 7); break;
            case '30d': startDate = subDays(today, 30); break;
            case '3m': startDate = subMonths(today, 3); break;
            case '12m': startDate = subMonths(today, 12); break;
            case 'ytd': startDate = startOfYear(today); break;
            default: startDate = subDays(today, 30); break; // 30d default
        }

        try {
            const apiFilters = {
                startDate: startOfMonth(startDate),
                endDate: endOfMonth(today),
                department: undefined
            };

            const response = await getDepartmentBreakdown(apiFilters);

            if (response.success && response.data) {
                setData(response.data.map((d, i) => ({
                    ...d,
                    fill: [
                        'var(--chart-1)',
                        'var(--chart-2)',
                        'var(--chart-3)',
                        'var(--chart-4)',
                        'var(--chart-5)'
                    ][i % 5]
                })));
            }
        } catch (error) {
            console.error("Failed to fetch department breakdown", error);
        } finally {
            setIsLoading(false);
        }
    };

    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    // Sync with page-level filter
    useEffect(() => {
        if (version !== lastVersionRef.current) {
            lastVersionRef.current = version;
            handleRangeChange(pageFilter || '30d', true);
        }
    }, [pageFilter, version]);

    // ... (keep handleRangeChange)

    if (!isMounted) {
        return (
            <Card className={cn("col-span-1 border-border bg-card/50 rounded-3xl relative overflow-hidden transition-all hover:shadow-md", className)}>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <div>
                        <CardTitle className="text-base font-medium tracking-tight">Department Breakdown</CardTitle>
                        <CardDescription>Loading...</CardDescription>
                    </div>
                </CardHeader>
                <CardContent className="h-[350px] flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className={cn("col-span-1 border-border bg-card/50 rounded-3xl relative overflow-hidden transition-all hover:shadow-md", className)}>
            {isLoading && (
                <div className="absolute inset-0 bg-background/50 backdrop-blur-sm z-10 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
            )}
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div>
                    <CardTitle className="text-base font-bold tracking-tight uppercase">Turnover Trend per Department</CardTitle>
                    <CardDescription className="text-[10px] uppercase tracking-widest font-bold opacity-50">
                        Attrition velocity by business unit
                    </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                    <Select value={range} onValueChange={handleRangeChange}>
                        <SelectTrigger className="w-[140px] h-8 text-xs border-border bg-accent/50">
                            <SelectValue placeholder="Select range" />
                        </SelectTrigger>
                        <SelectContent className="border-border bg-popover text-popover-foreground">
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
                    <BarChart
                        data={data}
                        layout="vertical"
                        margin={{ left: 0, right: 20, top: 0, bottom: 0 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--chart-grid)" />
                        <XAxis
                            type="number"
                            fontSize={11}
                            tickLine={false}
                            axisLine={false}
                            stroke="var(--chart-axis)"
                            hide
                        />
                        <YAxis
                            dataKey="name"
                            type="category"
                            fontSize={11}
                            tickLine={false}
                            axisLine={false}
                            stroke="var(--chart-axis)"
                            width={100}
                        />
                        <Tooltip
                            cursor={{ fill: 'currentColor', opacity: 0.1 }}
                            contentStyle={{ backgroundColor: 'var(--popover)', border: '1px solid var(--border)', borderRadius: '12px' }}
                            itemStyle={{ color: 'var(--popover-foreground)', fontSize: '12px' }}
                        />
                        <Bar
                            dataKey="value"
                            fill="var(--chart-1)"
                            radius={[0, 4, 4, 0]}
                            barSize={32}
                            name="Exits"
                            animationDuration={1000}
                            background={{ fill: 'var(--muted)', opacity: 0.1, radius: 4 }}
                        />
                    </BarChart>
                </ResponsiveContainer>
            </CardContent>
        </Card >
    );
}
