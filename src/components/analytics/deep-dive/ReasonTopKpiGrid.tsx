import { Card, CardContent } from '@/components/ui/card';
import { getReasonKPIs } from '@/app/dashboard/deep-dive/reason-for-leaving/actions-kpi';
import { getBrainDrain } from '@/app/dashboard/deep-dive/reason-for-leaving/actions-market';
import { ArrowUpRight, ArrowDownRight, Clock, Plane } from 'lucide-react';

export async function ReasonTopKpiGrid() {
    // Parallel data fetching for Top Row metrics
    const [kpiData, brainDrain] = await Promise.all([
        getReasonKPIs(),
        getBrainDrain()
    ]);

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-in slide-in-from-top-2 duration-500">

            {/* 1. Top Reason */}
            <Card className="bg-[#1a1a1c]/50 border-white/5 backdrop-blur-xl group hover:border-white/10 transition-all col-span-1">
                <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                        <p className="text-sm font-medium text-gray-400">Top Reason for Leaving</p>
                        <div className="p-2 rounded-full bg-red-500/10 text-red-500">
                            <ArrowUpRight className="h-4 w-4" />
                        </div>
                    </div>
                    <div>
                        <h3 className="text-2xl font-bold text-white mb-1 truncate" title={kpiData.topReason.label}>
                            {kpiData.topReason.label}
                        </h3>
                        <p className="text-xs text-gray-500">
                            Responsible for <span className="text-gray-300 font-medium">{kpiData.topReason.percent}%</span> of all exits
                        </p>
                    </div>
                </CardContent>
            </Card>

            {/* 2. Lowest Reason */}
            <Card className="bg-[#1a1a1c]/50 border-white/5 backdrop-blur-xl group hover:border-white/10 transition-all col-span-1">
                <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                        <p className="text-sm font-medium text-gray-400">Lowest Reason for Leaving</p>
                        <div className="p-2 rounded-full bg-emerald-500/10 text-emerald-500">
                            <ArrowDownRight className="h-4 w-4" />
                        </div>
                    </div>
                    <div>
                        <h3 className="text-2xl font-bold text-white mb-1 truncate" title={kpiData.lowestReason.label}>
                            {kpiData.lowestReason.label}
                        </h3>
                        <p className="text-xs text-gray-500">
                            Only <span className="text-gray-300 font-medium">{kpiData.lowestReason.percent}%</span> cited this factor
                        </p>
                    </div>
                </CardContent>
            </Card>

            {/* 3. Average Tenure */}
            <Card className="bg-[#1a1a1c]/50 border-white/5 backdrop-blur-xl group hover:border-white/10 transition-all col-span-1">
                <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                        <p className="text-sm font-medium text-gray-400">Average Tenure</p>
                        <div className="p-2 rounded-full bg-blue-500/10 text-blue-500">
                            <Clock className="h-4 w-4" />
                        </div>
                    </div>
                    <div>
                        <h3 className="text-2xl font-bold text-white mb-1">
                            {kpiData.avgTenure.years}y {kpiData.avgTenure.months}m
                        </h3>
                        <p className="text-xs text-gray-500">
                            Average time before resignation
                        </p>
                    </div>
                </CardContent>
            </Card>

            {/* 4. Brain Drain */}
            <Card className="bg-[#1a1a1c]/50 border-white/5 backdrop-blur-xl group hover:border-white/10 transition-all col-span-1">
                <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                        <p className="text-sm font-medium text-gray-400">Brain Drain (Migration)</p>
                        <div className="p-2 rounded-full bg-indigo-500/10 text-indigo-400">
                            <Plane className="h-4 w-4" />
                        </div>
                    </div>
                    <div>
                        <h3 className="text-2xl font-bold text-white mb-1">
                            {brainDrain.value}
                        </h3>
                        <p className="text-xs text-gray-500">
                            {brainDrain.subValue}
                        </p>
                        <p className="text-xs text-amber-500 mt-2 border-t border-white/5 pt-2">
                            {brainDrain.insight}
                        </p>
                    </div>
                </CardContent>
            </Card>

        </div>
    );
}
