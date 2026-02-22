'use client';

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

export interface DepartmentHeatmapData {
    department: string;
    count: number;
}

interface DepartmentHeatmapProps {
    data: DepartmentHeatmapData[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="rounded-lg border border-border bg-popover/90 p-3 shadow-xl backdrop-blur-md">
                <p className="mb-2 text-sm font-semibold text-foreground">{label}</p>
                <div className="flex items-center gap-2 text-xs">
                    <div
                        className="h-2 w-2 rounded-full"
                        style={{ backgroundColor: payload[0].payload.color }} // Use cell color
                    />
                    <span className="font-medium text-muted-foreground">
                        Total Exits:
                    </span>
                    <span className="font-bold text-foreground">
                        {payload[0].value}
                    </span>
                </div>
            </div>
        );
    }
    return null;
};

// Color Logic based on Volume (Severity)
// We need to calculate max locally to determine thresholds, or use absolute thresholds?
// Let's use relative thresholds for now:
// Top 25% = Red (Critical)
// Top 50% = Amber (Warning)
// Bottom 50% = Green (Stable)

const getBarColor = (value: number, max: number) => {
    if (value > max * 0.75) return '#EF4444'; // Red
    if (value > max * 0.4) return '#F59E0B';  // Amber
    return '#10B981';                         // Emerald
};

export function DepartmentHeatmap({ data }: DepartmentHeatmapProps) {
    const maxVal = Math.max(...data.map(d => d.count), 0);

    return (
        <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart
                    data={data}
                    layout="vertical" // Horizontal Bar Chart
                    margin={{ top: 10, right: 30, left: 10, bottom: 0 }} // Increased left margin for labels
                >
                    <CartesianGrid
                        strokeDasharray="3 3"
                        horizontal={false} // Vertical grid lines only for horizontal bars
                        stroke="var(--chart-grid)"
                    />
                    <XAxis
                        type="number"
                        stroke="var(--muted-foreground)"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        allowDecimals={false}
                    />
                    <YAxis
                        dataKey="department"
                        type="category"
                        stroke="var(--muted-foreground)"
                        fontSize={11} // Slightly smaller for long names
                        tickLine={false}
                        axisLine={false}
                        width={130} // Ensure space for labels
                        interval={0}
                    />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--muted)', opacity: 0.4 }} />
                    <Bar
                        dataKey="count"
                        radius={[0, 4, 4, 0]} // Round right corners
                        barSize={20}
                        animationDuration={1500}
                    >
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={getBarColor(entry.count, maxVal)} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}
