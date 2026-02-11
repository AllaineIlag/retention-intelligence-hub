import { DeepDiveContent } from "./content";

export default function DeepDivePage() {
    return (
        <div className="space-y-6 animate-in fade-in duration-700 p-2">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Satisfaction Deep Dive</h2>
                    <p className="text-muted-foreground">Detailed breakdown of exit survey responses and sentiment.</p>
                </div>
            </div>
            <DeepDiveContent />
        </div>
    );
}
