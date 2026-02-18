'use client';

import {
    ScatterChart,
    Scatter,
    XAxis,
    YAxis,
    ZAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    ReferenceLine,
    Label
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

// Mock Data for "Magic Quadrant"
const mockData = [
    { department: 'Sales', pay: 4.2, benefits: 3.8, size: 120, fill: '#10b981' }, // High/High (Optimized)
    { department: 'Engineering', pay: 2.1, benefits: 4.5, size: 200, fill: '#f59e0b' }, // Low/High (Anchored)
    { department: 'Support', pay: 1.8, benefits: 1.5, size: 80, fill: '#ef4444' }, // Low/Low (At Risk)
    { department: 'Marketing', pay: 4.0, benefits: 1.2, size: 50, fill: '#3b82f6' }, // High/Low (Transactional)
    { department: 'Product', pay: 3.5, benefits: 3.2, size: 60, fill: '#10b981' },
    { department: 'HR', pay: 2.8, benefits: 4.1, size: 40, fill: '#f59e0b' },
    { department: 'Finance', pay: 3.9, benefits: 2.8, size: 90, fill: '#10b981' }
];

export function PayBenefitsScatter() {
    return (
        <Card className="bg-[#1a1a1c]/50 border-white/5 backdrop-blur-xl">
            <CardHeader>
                <CardTitle className="text-sm font-medium text-gray-400">Total Rewards Analysis (Magic Quadrant)</CardTitle>
                <CardDescription className="text-xs text-muted-foreground">
                    Positioning departments by Pay Satisfaction vs. Benefits Satisfaction
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="h-[400px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />

                            {/* X-Axis: Pay Satisfaction */}
                            <XAxis
                                type="number"
                                dataKey="pay"
                                name="Pay Satisfaction"
                                unit=""
                                domain={[0, 5]}
                                stroke="#6b7280"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                            >
                                <Label value="Pay Satisfaction" offset={0} position="insideBottom" fill="#6b7280" style={{ fontSize: '11px' }} />
                            </XAxis>

                            {/* Y-Axis: Benefits Satisfaction */}
                            <YAxis
                                type="number"
                                dataKey="benefits"
                                name="Benefits Satisfaction"
                                unit=""
                                domain={[0, 5]}
                                stroke="#6b7280"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                            >
                                <Label value="Benefits Satisfaction" angle={-90} position="insideLeft" fill="#6b7280" style={{ fontSize: '11px' }} />
                            </YAxis>

                            <ZAxis type="number" dataKey="size" range={[50, 400]} name="Headcount" />

                            <Tooltip
                                cursor={{ strokeDasharray: '3 3' }}
                                content={({ active, payload }) => {
                                    if (active && payload && payload.length) {
                                        const data = payload[0].payload;
                                        return (
                                            <div className="bg-[#1f2937] border border-white/10 p-3 rounded-lg shadow-xl">
                                                <p className="font-bold text-white mb-1">{data.department}</p>
                                                <div className="text-xs text-gray-400 space-y-1">
                                                    <div>Pay Score: <span className="text-white">{data.pay}</span></div>
                                                    <div>Benefits Score: <span className="text-white">{data.benefits}</span></div>
                                                    <div>Headcount: <span className="text-white">{data.size}</span></div>
                                                </div>
                                            </div>
                                        );
                                    }
                                    return null;
                                }}
                            />

                            {/* Magic Quadrant Reference Lines */}
                            <ReferenceLine x={2.5} stroke="#374151" strokeDasharray="3 3" />
                            <ReferenceLine y={2.5} stroke="#374151" strokeDasharray="3 3" />

                            {/* Quadrant Labels */}
                            <ReferenceLine segment={[{ x: 0, y: 5 }, { x: 2.5, y: 5 }]} stroke="none" label={{ position: 'insideTopLeft', value: 'ANCHORED', fill: '#f59e0b', fontSize: 10, opacity: 0.5 }} />
                            <ReferenceLine segment={[{ x: 2.5, y: 5 }, { x: 5, y: 5 }]} stroke="none" label={{ position: 'insideTopRight', value: 'OPTIMIZED', fill: '#10b981', fontSize: 10, opacity: 0.5 }} />
                            <ReferenceLine segment={[{ x: 0, y: 0 }, { x: 2.5, y: 0 }]} stroke="none" label={{ position: 'insideBottomLeft', value: 'AT RISK', fill: '#ef4444', fontSize: 10, opacity: 0.5 }} />
                            <ReferenceLine segment={[{ x: 2.5, y: 0 }, { x: 5, y: 0 }]} stroke="none" label={{ position: 'insideBottomRight', value: 'TRANSACTIONAL', fill: '#3b82f6', fontSize: 10, opacity: 0.5 }} />

                            <Scatter name="Departments" data={mockData} fill="#8884d8" />
                        </ScatterChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
}
