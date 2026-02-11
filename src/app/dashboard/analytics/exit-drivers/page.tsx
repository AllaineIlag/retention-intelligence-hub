import { ExitDriversContent } from "./content";

export default function ExitDriversPage() {
    return (
        <div className="space-y-6 animate-in fade-in duration-700 p-2">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Exit Drivers</h2>
                    <p className="text-muted-foreground">Identify the maximum-impact factors contributing to attrition.</p>
                </div>
            </div>
            <ExitDriversContent />
        </div>
    );
}
