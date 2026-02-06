import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function DeepDivePage() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Satisfaction Deep Dive</h2>
                    <p className="text-muted-foreground">Detailed breakdown of exit survey responses and sentiment.</p>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-1">
                <Card className="rounded-3xl border-none bg-[#0a0a0a] min-h-[500px] flex items-center justify-center">
                    <div className="text-muted-foreground">Survey Response Analytics - Coming Soon</div>
                </Card>
            </div>
        </div>
    );
}
