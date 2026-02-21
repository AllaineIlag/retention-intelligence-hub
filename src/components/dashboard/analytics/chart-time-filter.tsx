'use client';

import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

export type TimeRange = '7d' | '30d' | '3m';

interface ChartTimeFilterProps {
    value: TimeRange;
    onChange: (value: TimeRange) => void;
    className?: string;
}

export function ChartTimeFilter({ value, onChange, className }: ChartTimeFilterProps) {
    return (
        <Tabs
            value={value}
            onValueChange={(v) => onChange(v as TimeRange)}
            className={`w-auto ${className}`}
        >
            <TabsList className="bg-brand-primary hover:bg-brand-primary/90 text-white w-full sm:w-auto">
                <TabsTrigger
                    value="7d"
                    className="text-[10px] px-2 h-5 data-[state=active]:bg-blue-600 data-[state=active]:text-white"
                >
                    7d
                </TabsTrigger>
                <TabsTrigger
                    value="30d"
                    className="text-[10px] px-2 h-5 data-[state=active]:bg-blue-600 data-[state=active]:text-white"
                >
                    30d
                </TabsTrigger>
                <TabsTrigger
                    value="3m"
                    className="text-[10px] px-2 h-5 data-[state=active]:bg-blue-600 data-[state=active]:text-white"
                >
                    3m
                </TabsTrigger>
            </TabsList>
        </Tabs>
    );
}
