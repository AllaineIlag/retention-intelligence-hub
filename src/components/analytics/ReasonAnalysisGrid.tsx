'use client';

import { CompetitorDrawCard } from '@/components/dashboard/analytics/kpi/CompetitorDrawCard';
import { MoneyVsCultureCard } from '@/components/dashboard/analytics/kpi/MoneyVsCultureCard';
import { PushPullChart } from '@/components/dashboard/analytics/kpi/PushPullChart';

interface ReasonAnalysisGridProps {
    competitor: {
        value: string | number;
        subValue?: string;
        items?: { label: string; value: number }[];
    };
    moneyVsCulture: {
        value: string | number;
        subValue?: string;
        items?: { label: string; value: number }[];
    };
    push: { name: string; value: number }[];
    pull: { name: string; value: number }[];
    filterAction?: React.ReactNode;
}

const PUSH_COLORS = ['#fb7185', '#f43f5e', '#e11d48', '#be123c', '#9f1239']; // Rose palette
const PULL_COLORS = ['#60a5fa', '#3b82f6', '#2563eb', '#1d4ed8', '#1e40af']; // Blue palette

export function ReasonAnalysisGrid({ competitor, moneyVsCulture, push, pull, filterAction }: ReasonAnalysisGridProps) {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in slide-in-from-bottom-2 duration-700">

            {/* --- COLUMN 1: Market Intelligence Stack --- */}
            <div className="flex flex-col gap-6 col-span-1 h-full">

                {/* 1. Competitor Draw */}
                <div className="flex-1 min-h-[220px]">
                    <CompetitorDrawCard
                        initialValue={String(competitor.value)}
                        initialSubValue={competitor.subValue}
                        initialItems={competitor.items}
                        className="h-full"
                    />
                </div>

                {/* 2. Money vs Culture */}
                <div className="flex-1 min-h-[220px]">
                    <MoneyVsCultureCard
                        initialValue={String(moneyVsCulture.value)}
                        initialSubValue={moneyVsCulture.subValue}
                        initialItems={moneyVsCulture.items}
                        className="h-full"
                    />
                </div>
            </div>


            {/* --- COLUMN 2: Push Factors (Chart) --- */}
            <div className="col-span-1 h-full min-h-[460px]">
                <PushPullChart
                    title="Why They Left"
                    subtitle="Push Factors"
                    data={push}
                    colors={PUSH_COLORS}
                    className="h-full"
                    action={filterAction}
                />
            </div>


            {/* --- COLUMN 3: Pull Factors (Chart) --- */}
            <div className="col-span-1 h-full min-h-[460px]">
                <PushPullChart
                    title="Where They Went"
                    subtitle="Pull Factors"
                    data={pull}
                    colors={PULL_COLORS}
                    className="h-full"
                    action={filterAction}
                />
            </div>

        </div>
    );
}
