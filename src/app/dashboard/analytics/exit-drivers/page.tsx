import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ExitDriversPage() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Exit Drivers</h2>
                    <p className="text-muted-foreground">Identify maximum impact factors contributing to attrition.</p>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <Card className="rounded-3xl border-none bg-[#0a0a0a] min-h-[400px] flex items-center justify-center">
                    <div className="text-muted-foreground">Primary Driver Analysis - Coming Soon</div>
                </Card>
                <Card className="rounded-3xl border-none bg-[#0a0a0a] min-h-[400px] flex items-center justify-center">
                    <div className="text-muted-foreground">Top Exit Reasons - Coming Soon</div>
                </Card>
            </div>
        </div>
    );
}
