export default function CorrectionsPage() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4">
            <div className="p-4 rounded-full bg-emerald-500/10 text-emerald-400">
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-10 w-10"
                >
                    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
                    <path d="M15 2H9a1 1 0 0 0-1 1v2a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V3a1 1 0 0 0-1-1Z" />
                    <path d="m9 14 2 2 4-4" />
                </svg>
            </div>
            <h2 className="text-2xl font-bold tracking-tight">Correction Requests</h2>
            <p className="text-muted-foreground max-w-sm">
                This sector will manage post-interview corrections, data amendments, and audit logs for modified records.
            </p>
        </div>
    );
}
