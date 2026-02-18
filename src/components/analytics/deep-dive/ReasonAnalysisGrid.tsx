'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { TrendingUp, DollarSign } from 'lucide-react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell
} from 'recharts';

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
}

const PUSH_COLORS = ['#fb7185', '#f43f5e', '#e11d48', '#be123c', '#9f1239']; // Rose palette
const PULL_COLORS = ['#60a5fa', '#3b82f6', '#2563eb', '#1d4ed8', '#1e40af']; // Blue palette

const CustomTooltip = ({ active, payload, label, color }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="rounded-lg border border-white/10 bg-[#0f0f11]/90 p-3 shadow-xl backdrop-blur-md">
                <p className="mb-1 text-xs font-medium text-gray-400">{label}</p>
                <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
                    <span className="text-sm font-bold text-white">
                        {payload[0].value}
                    </span>
                </div>
            </div>
        );
    }
    return null;
};

export function ReasonAnalysisGrid({ competitor, moneyVsCulture, push, pull }: ReasonAnalysisGridProps) {
    // Sort chart data descending
    const pushSorted = [...push].sort((a, b) => b.value - a.value).slice(0, 5);
    const pullSorted = [...pull].sort((a, b) => b.value - a.value).slice(0, 5);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in slide-in-from-bottom-2 duration-700">

            {/* --- COLUMN 1: Market Intelligence Stack --- */}
            <div className="flex flex-col gap-6 col-span-1">

                {/* 1. Competitor Draw */}
                <Card className="bg-[#1a1a1c]/50 border-white/5 backdrop-blur-xl group hover:border-white/10 transition-all flex-1">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <div>
                            <p className="text-sm font-medium text-gray-400">Top Competitor Draw</p>
                            <CardTitle className="text-2xl font-bold text-white mt-1">{competitor.value}</CardTitle>
                        </div>
                        <TrendingUp className="h-4 w-4 text-emerald-500" />
                    </CardHeader>
                    <CardContent>
                        <p className="text-xs text-gray-500 mb-4">{competitor.subValue}</p>
                        <div className="space-y-3">
                            {competitor.items?.slice(0, 3).map((item, i) => (
                                <div key={i} className="flex justify-between items-center text-xs">
                                    <span className="text-gray-300">{item.label}</span>
                                    <span className="text-white font-mono font-medium">{item.value}</span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* 2. Money vs Culture */}
                <Card className="bg-[#1a1a1c]/50 border-white/5 backdrop-blur-xl group hover:border-white/10 transition-all flex-1">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <div>
                            <p className="text-sm font-medium text-gray-400">Money vs Culture</p>
                            <CardTitle className="text-2xl font-bold text-white mt-1">{moneyVsCulture.value}</CardTitle>
                        </div>
                        <DollarSign className="h-4 w-4 text-purple-400" />
                    </CardHeader>
                    <CardContent>
                        <p className="text-xs text-gray-500 mb-4">{moneyVsCulture.subValue}</p>

                        {/* Bar Visual */}
                        <div className="h-3 w-full bg-gray-800 rounded-full overflow-hidden flex mb-2">
                            <div
                                style={{ width: `${(moneyVsCulture.items?.[0].value || 0) / ((moneyVsCulture.items?.[0].value || 1) + (moneyVsCulture.items?.[1].value || 1)) * 100}%` }}
                                className="bg-emerald-500 h-full"
                            />
                            <div
                                className="bg-purple-500 h-full flex-1"
                            />
                        </div>
                        <div className="flex justify-between text-[10px] text-gray-400">
                            <span>Financial ({moneyVsCulture.items?.[0].value})</span>
                            <span>Cultural ({moneyVsCulture.items?.[1].value})</span>
                        </div>
                    </CardContent>
                </Card>
            </div>


            {/* --- COLUMN 2: Push Factors (Chart) --- */}
            <Card className="bg-[#1a1a1c]/50 border-white/5 backdrop-blur-xl col-span-1 min-h-[400px]">
                <CardHeader>
                    <CardDescription className="text-xs uppercase tracking-widest font-semibold text-rose-400">
                        Push Factors
                    </CardDescription>
                    <CardTitle className="text-sm font-medium text-gray-200">
                        Why They Left
                    </CardTitle>
                </CardHeader>
                <CardContent className="h-full">
                    <div className="h-[320px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                layout="vertical"
                                data={pushSorted}
                                margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(255,255,255,0.05)" />
                                <XAxis type="number" hide />
                                <YAxis
                                    dataKey="name"
                                    type="category"
                                    width={100}
                                    tick={{ fill: '#9ca3af', fontSize: 11 }}
                                    tickLine={false}
                                    axisLine={false}
                                />
                                <Tooltip
                                    content={<CustomTooltip color={PUSH_COLORS[1]} />}
                                    cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                                />
                                <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                                    {pushSorted.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={PUSH_COLORS[index % PUSH_COLORS.length]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>


            {/* --- COLUMN 3: Pull Factors (Chart) --- */}
            <Card className="bg-[#1a1a1c]/50 border-white/5 backdrop-blur-xl col-span-1 min-h-[400px]">
                <CardHeader>
                    <CardDescription className="text-xs uppercase tracking-widest font-semibold text-blue-400">
                        Pull Factors
                    </CardDescription>
                    <CardTitle className="text-sm font-medium text-gray-200">
                        Where They Went
                    </CardTitle>
                </CardHeader>
                <CardContent className="h-full">
                    <div className="h-[320px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                layout="vertical"
                                data={pullSorted}
                                margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(255,255,255,0.05)" />
                                <XAxis type="number" hide />
                                <YAxis
                                    dataKey="name"
                                    type="category"
                                    width={100}
                                    tick={{ fill: '#9ca3af', fontSize: 11 }}
                                    tickLine={false}
                                    axisLine={false}
                                />
                                <Tooltip
                                    content={<CustomTooltip color={PULL_COLORS[1]} />}
                                    cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                                />
                                <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                                    {pullSorted.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={PULL_COLORS[index % PULL_COLORS.length]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>

        </div>
    );
}
