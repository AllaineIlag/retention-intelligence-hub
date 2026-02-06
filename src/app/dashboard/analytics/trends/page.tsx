import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function TrendsPage() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Turnover & Retention Trends</h2>
                    <p className="text-muted-foreground">Analyze attrition rates and retention metrics over time.</p>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="rounded-3xl border-none bg-[#0a0a0a]">
                    <CardHeader>
                        <CardTitle className="text-sm font-medium text-muted-foreground">Active Resignations</CardTitle>
                        <div className="text-2xl font-bold text-foreground">0</div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-xs text-muted-foreground">Pending processing</div>
                    </CardContent>
                </Card>
            </div>

            <Card className="rounded-3xl border-none bg-[#0a0a0a] min-h-[400px] flex items-center justify-center">
                <div className="text-muted-foreground">Trend Analysis Charts - Coming Soon</div>
            </Card>
        </div>
    );
}
