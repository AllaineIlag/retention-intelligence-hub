'use client';

import { useState, useEffect, useRef } from 'react';
import { usePageFilter } from '@/components/dashboard/page-filter-context';
import { getAttritionTrendData, AttritionTrendData } from '@/app/dashboard/deep-dive/reason-for-leaving/actions-trend';
import { startOfMonth, endOfMonth, subMonths, format, startOfYear, subDays } from 'date-fns';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AttritionTrendChart } from './AttritionTrendChart';

interface AttritionTrendDeepDiveProps {
    initialData: AttritionTrendData[];
}

export function AttritionTrendDeepDive({ initialData }: AttritionTrendDeepDiveProps) {
    const [data, setData] = useState<AttritionTrendData[]>(initialData);
    const [isLoading, setIsLoading] = useState(false);
    const [range, setRange] = useState('30d');
    const { pageFilter, version } = usePageFilter();
    const lastVersionRef = useRef(version);

    const [isMounted, setIsMounted] = useState(false);
    useEffect(() => {
        setIsMounted(true);
    }, []);

    // Sync local range with global page filter
    useEffect(() => {
        if (version !== lastVersionRef.current) {
            lastVersionRef.current = version;
            if (pageFilter) {
                setRange(pageFilter);
            }
        }
    }, [pageFilter, version]);

    // Fetch data when range changes (triggered by user or global sync)
    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const today = new Date();
                let startDate: Date;

                switch (range) {
                    case '7d': startDate = subDays(today, 7); break;
                    case '30d': startDate = subDays(today, 30); break;
                    case '3m': startDate = subMonths(today, 3); break;
                    case '6m': startDate = subMonths(today, 6); break;
                    case '12m': startDate = subMonths(today, 12); break;
                    case 'ytd': startDate = startOfYear(today); break;
                    default: startDate = subDays(today, 30); // Fallback
                }

                const filters = {
                    startDate,
                    endDate: endOfMonth(today)
                };

                const result = await getAttritionTrendData(filters);
                setData(result);
            } catch (error) {
                console.error("Failed to fetch attrition trend data:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [range]);


    const handleRangeChange = (value: string) => {
        setRange(value);
    };

    return (
        <div className="relative">
            <div className="absolute top-[-3.5rem] right-0 z-10 flex gap-2">
                {isMounted && (
                    <Select value={range} onValueChange={handleRangeChange}>
                        <SelectTrigger className="h-8 w-[130px] bg-white/5 border-white/10 text-xs">
                            <SelectValue placeholder="Select range" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="7d">Last 7 Days</SelectItem>
                            <SelectItem value="30d">Last 30 Days</SelectItem>
                            <SelectItem value="3m">Last 3 Months</SelectItem>
                            <SelectItem value="6m">Last 6 Months</SelectItem>
                            <SelectItem value="12m">Last 12 Months</SelectItem>
                            <SelectItem value="ytd">Year to Date</SelectItem>
                        </SelectContent>
                    </Select>
                )}
            </div>

            {isLoading && (
                <div className="absolute inset-0 bg-background/50 backdrop-blur-sm z-10 flex items-center justify-center rounded-lg">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
            )}

            <AttritionTrendChart data={data} />
        </div>
    );
}
