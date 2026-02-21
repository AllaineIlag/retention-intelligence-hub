import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';


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
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[calc(50%+18px)] text-center pointer-events-none">
                <div className="text-2xl font-bold text-foreground">{total}</div>
                <div className="text-xs text-muted-foreground uppercase tracking-wider">Total</div>
            </div>
        </div>
    );
}
