import { BarChart3, Users, TrendingUp, AlertTriangle } from 'lucide-react';

export default function DashboardPage() {
    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                <p className="text-muted-foreground">
                    Welcome to the Retention Intelligence Hub.
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatCard
                    title="Total Employees"
                    value="142"
                    icon={<Users className="h-4 w-4 text-muted-foreground" />}
                    description="+12 from last month"
                />
                <StatCard
                    title="Retention Rate"
                    value="94.2%"
                    icon={<TrendingUp className="h-4 w-4 text-emerald-500" />}
                    description="+2.1% from last quarter"
                />
                <StatCard
                    title="Active Resignations"
                    value="8"
                    icon={<AlertTriangle className="h-4 w-4 text-amber-500" />}
                    description="3 pending interviews"
                />
                <StatCard
                    title="Exit Interviews"
                    value="24"
                    icon={<BarChart3 className="h-4 w-4 text-indigo-500" />}
                    description="This month"
                />
            </div>

            {/* Placeholder for charts */}
            <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-xl border bg-card p-6">
                    <h3 className="font-semibold mb-4">Turnover Trends</h3>
                    <div className="h-[200px] flex items-center justify-center text-muted-foreground">
                        Chart placeholder
                    </div>
                </div>
                <div className="rounded-xl border bg-card p-6">
                    <h3 className="font-semibold mb-4">Top Exit Reasons</h3>
                    <div className="h-[200px] flex items-center justify-center text-muted-foreground">
                        Chart placeholder
                    </div>
                </div>
            </div>
        </div>
    );
}

function StatCard({
    title,
    value,
    icon,
    description,
}: {
    title: string;
    value: string;
    icon: React.ReactNode;
    description: string;
}) {
    return (
        <div className="rounded-xl border bg-card p-6">
            <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">{title}</span>
                {icon}
            </div>
            <div className="mt-2">
                <span className="text-2xl font-bold">{value}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">{description}</p>
        </div>
    );
}
