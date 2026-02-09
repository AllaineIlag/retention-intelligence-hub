
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
    // TEMPORARY: Static mock data to bypass fetch error {} as requested by USER
    const mockInterviews = [
        {
            id: 'mock-1',
            status: 'scheduled' as const,
            created_at: new Date().toISOString(),
            scheduled_interview_date: new Date(Date.now() + 86400000).toISOString(),
            employee: {
                id: 'emp-1',
                full_name: 'Sarah Connor',
                email: 's.connor@cyberdyne.com',
                role: 'Resistance Lead',
                department: 'Operations',
                avatar_url: null
            }
        },
        {
            id: 'mock-2',
            status: 'pending' as const,
            created_at: new Date().toISOString(),
            scheduled_interview_date: null,
            employee: {
                id: 'emp-2',
                full_name: 'John Doe',
                email: 'j.doe@example.com',
                role: 'Senior Developer',
                department: 'Engineering',
                avatar_url: null
            }
        }
    ];

    return <InterviewsTable data={mockInterviews} />;
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
