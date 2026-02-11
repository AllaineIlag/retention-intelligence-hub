import { TrendsContent } from "./content";

export default function TrendsPage() {
    return (
        <div className="space-y-6 animate-in fade-in duration-700 p-2">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Turnover & Retention Trends</h2>
                    <p className="text-muted-foreground">Analyze attrition rates and retention metrics over time.</p>
                </div>
            </div>
            <TrendsContent />
        </div>
    );
}
