
import { Suspense } from 'react';
import { getAllInterviews } from '@/app/actions/interview-ops';
import { InterviewsTable } from '@/components/dashboard/interviews-table';
import { Skeleton } from '@/components/ui/skeleton';
import { Mic2, Users } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default function InterviewsPage() {
    return (
        <div className="space-y-8 animate-in fade-in duration-700 max-w-7xl mx-auto">

            <Suspense fallback={<TableSkeleton />}>
                <InterviewsList />
            </Suspense>
        </div>
    );
}

async function InterviewsList() {
    const { data: interviews, error } = await getAllInterviews();

    if (error) {
        return (
            <div className="p-12 text-center rounded-xl border border-red-900/20 bg-red-900/5">
                <h3 className="text-lg font-medium text-red-400">Unable to load interviews</h3>
                <p className="text-red-400/60 mt-2">Please try refreshing the page.</p>
            </div>
        );
    }

    return <InterviewsTable data={interviews || []} />;
}

function TableSkeleton() {
    return (
        <div className="space-y-4">
            <div className="flex justify-between">
                <Skeleton className="h-10 w-72" />
                <div className="flex gap-2">
                    <Skeleton className="h-9 w-16" />
                    <Skeleton className="h-9 w-24" />
                    <Skeleton className="h-9 w-20" />
                </div>
            </div>
            <div className="rounded-xl border border-white/10 bg-[#0a0a0a]/50 p-6 space-y-6">
                {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Skeleton className="h-10 w-10 rounded-full" />
                            <div className="space-y-2">
                                <Skeleton className="h-4 w-40" />
                                <Skeleton className="h-3 w-24" />
                            </div>
                        </div>
                        <Skeleton className="h-6 w-20" />
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-9 w-28" />
                    </div>
                ))}
            </div>
        </div>
    );
}
