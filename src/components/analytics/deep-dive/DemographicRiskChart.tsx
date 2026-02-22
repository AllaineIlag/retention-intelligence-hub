import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, Label } from 'recharts';


interface DemographicRiskData {
    name: string;
    value: number;
    fill: string;
}

interface DemographicRiskChartProps {
    data: DemographicRiskData[];
}

const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="rounded-xl border border-border bg-popover/90 p-3 shadow-xl backdrop-blur-md">
                <p className="mb-2 text-[10px] font-semibold text-muted-foreground uppercase">{payload[0].name}</p>
                <div className="flex items-center gap-2 text-xs">
                    <span className="font-medium text-muted-foreground">Exits:</span>
                    <span className="font-bold text-foreground">{payload[0].value}</span>
                </div>
            </div>
        );
    }
    return null;
};

export function DemographicRiskChart({ data }: DemographicRiskChartProps) {
    const total = data.reduce((sum, item) => sum + item.value, 0);

    return (
        <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                        stroke="none"
                    >
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                        <Label
                            content={({ viewBox }) => {
                                const { cx, cy } = viewBox as any;
                                return (
                                    <text x={cx} y={cy} textAnchor="middle" dominantBaseline="middle">
                                        <tspan x={cx} dy="-0.2em" className="text-3xl font-bold fill-foreground">{total}</tspan>
                                        <tspan x={cx} dy="1.5em" className="text-[10px] font-semibold fill-muted-foreground uppercase tracking-widest">Total</tspan>
                                    </text>
                                );
                            }}
                            position="center"
                        />
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend
                        verticalAlign="bottom"
                        height={36}
                        iconType="circle"
                        formatter={(value, entry: any) => (
                            <span className="text-muted-foreground text-xs ml-1">{value}</span>
                        )}
                    />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
}
