export default function LiveInterviewsPage() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4">
            <div className="p-4 rounded-full bg-indigo-500/10 text-indigo-400">
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
                    <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
                    <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                    <line x1="12" x2="12" y1="19" y2="22" />
                </svg>
            </div>
            <h2 className="text-2xl font-bold tracking-tight">Live Interview Workspace</h2>
            <p className="text-muted-foreground max-w-sm">
                This sector will host the active interview interface, real-time transcription, and note-taking tools.
            </p>
        </div>
    );
}
