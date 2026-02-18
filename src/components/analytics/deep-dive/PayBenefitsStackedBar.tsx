'use client';

import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

// Mock Data for Stacked Bar
const mockData = [
    {
        payTier: 'Low',
        lowBenefits: 35,
        highBenefits: 10,
        total: 45
    },
    {
        payTier: 'Fair',
        lowBenefits: 20,
        highBenefits: 15,
        total: 35
    },
    {
        payTier: 'High',
        lowBenefits: 5,
        highBenefits: 40,
        total: 45
    }
];

export function PayBenefitsStackedBar() {
    return (
        <Card className="bg-[#1a1a1c]/50 border-white/5 backdrop-blur-xl">
            <CardHeader>
                <CardTitle className="text-sm font-medium text-gray-400">Total Rewards Analysis</CardTitle>
                <CardDescription className="text-xs text-muted-foreground">
                    Benefits Satisfaction Breakdown by Pay Tier
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="h-[300px] w-full min-h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                            data={mockData}
                            layout="horizontal"
                            margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                            <XAxis
                                dataKey="payTier"
                                stroke="#6b7280"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                                dy={10}
                            />
                            <YAxis
                                stroke="#6b7280"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                            />
                            <Tooltip
                                cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                                contentStyle={{
                                    backgroundColor: '#1f2937',
                                    borderColor: '#374151',
                                    color: '#f3f4f6',
                                    borderRadius: '0.5rem'
                                }}
                                itemStyle={{ color: '#e5e7eb' }}
                            />
                            <Legend
                                wrapperStyle={{ paddingTop: '20px' }}
                                iconType="circle"
                            />
                            <Bar
                                dataKey="highBenefits"
                                name="High Benefits"
                                stackId="a"
                                fill="#10b981"
                                radius={[0, 0, 4, 4]}
                                barSize={60}
                            />
                            <Bar
                                dataKey="lowBenefits"
                                name="Low Benefits"
                                stackId="a"
                                fill="#ef4444"
                                radius={[4, 4, 0, 0]}
                                barSize={60}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
}
