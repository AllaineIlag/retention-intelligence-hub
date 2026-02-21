'use client';

import { useState, useEffect, useRef } from 'react';
import { usePageFilter } from '@/components/dashboard/page-filter-context';
import { AnalyticsFilters } from '@/app/actions/analytics';
import { ReasonAnalysisGrid } from './ReasonAnalysisGrid';
import { getPushPullData, ButterflyData } from '@/app/dashboard/deep-dive/reason-for-leaving/actions-retention';
import { getCompetitorDraw, getMoneyVsCulture, MarketMetric } from '@/app/dashboard/deep-dive/reason-for-leaving/actions-market';
import { startOfMonth, subMonths, endOfMonth, subDays, startOfYear } from 'date-fns';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ReasonAnalysisDeepDiveProps {
    initialCompetitor: MarketMetric;
    initialMoneyVsCulture: MarketMetric;
    initialButterfly: ButterflyData;
}

export function ReasonAnalysisDeepDive({
    initialCompetitor,
    initialMoneyVsCulture,
    initialButterfly
}: ReasonAnalysisDeepDiveProps) {
    const [competitor, setCompetitor] = useState<MarketMetric>(initialCompetitor);
    const [moneyVsCulture, setMoneyVsCulture] = useState<MarketMetric>(initialMoneyVsCulture);
    const [butterfly, setButterfly] = useState<ButterflyData>(initialButterfly);

    const [isLoading, setIsLoading] = useState(false);
    const [isMounted, setIsMounted] = useState(false);

    // Simple Range Filter (Trend Style)
    const [range, setRange] = useState('30d');

    const { pageFilter, version } = usePageFilter();
    const lastVersionRef = useRef(version);

    // Hydration Fix: Only render after mount
    useEffect(() => {
        setIsMounted(true);
    }, []);

    // Sync with Global Page Filter
    useEffect(() => {
        if (version !== lastVersionRef.current) {
            lastVersionRef.current = version;
            if (pageFilter) {
                setRange(pageFilter);
            }
        }
    }, [pageFilter, version]);

    // Fetch Data on Filter Change
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
                    default: startDate = subDays(today, 30);
                }

                const apiFilters: AnalyticsFilters = {
                    startDate,
                    endDate: endOfMonth(today),
                    // Removed Department filter per user request (simplified view)
                    department: undefined
                };

                // Fetch all in parallel
                const [
                    newCompetitor,
                    newMoneyVsCulture,
                    newButterfly
                ] = await Promise.all([
                    getCompetitorDraw(apiFilters),
                    getMoneyVsCulture(apiFilters),
                    getPushPullData(apiFilters)
                ]);

                setCompetitor(newCompetitor);
                setMoneyVsCulture(newMoneyVsCulture);
                setButterfly(newButterfly);

            } catch (error) {
                console.error("Failed to fetch reason analysis data:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [range]);

    const handleRangeChange = (value: string) => {
        setRange(value);
    };

    // Construct the filter UI
    const filterElement = isMounted ? (
        <Select value={range} onValueChange={handleRangeChange}>
            <SelectTrigger className="h-8 w-[130px] bg-accent/50 border-border text-xs">
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
    ) : null;

    return (
        <div className="space-y-4 relative">

            {isLoading && (
                <div className="absolute inset-0 bg-background/50 backdrop-blur-sm z-20 flex items-center justify-center rounded-lg pointer-events-none">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
            )}

            <div className={`transition-opacity duration-300 ${isLoading ? 'opacity-50' : 'opacity-100'}`}>
                <ReasonAnalysisGrid
                    competitor={competitor}
                    moneyVsCulture={moneyVsCulture}
                    push={butterfly.push}
                    pull={butterfly.pull}
                    filterAction={filterElement}
                />
            </div>
        </div>
    );
}
