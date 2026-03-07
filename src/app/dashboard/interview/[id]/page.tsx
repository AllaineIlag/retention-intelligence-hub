import { getInterviewDetails } from '@/app/actions/interview-ops';
import { InterviewSession } from '@/components/interview/InterviewSession';
import { InterviewReportDossier } from '@/components/interview/InterviewReportDossier';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/server';
import { UserCircle, Lock } from 'lucide-react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { cn } from '@/lib/utils';

export default async function InterviewPage({ params }: { params: { id: string } }) {
    const { id } = await params;
    const { resignation, responses, verifiedResults, error } = await getInterviewDetails(id);

    // Map details for UI consistency
    const dir = resignation
        ? (Array.isArray((resignation as any).company_directory)
            ? (resignation as any).company_directory[0]
            : (resignation as any).company_directory)
        : null;

    const details = resignation ? {
        full_name: dir?.full_name,
        position: dir?.position,
        department: dir?.department,
        date_hired: dir?.date_hired,
        email: resignation.personal_email || dir?.email,
        role: 'employee', // Mock default since role is no longer strictly tied for anonymization in the same way without profiles
    } : null;



    // Fetch current user role for anonymization
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user?.id)
        .single();

    const role = (profile?.role as 'lead' | 'interviewer' | 'employee') || 'interviewer';

    if (error || !resignation) {
        return (
            <div className="p-8 text-center bg-red-50 rounded-lg border border-red-200 text-red-700">
                <h2 className="text-xl font-bold mb-2">Error Loading Interview</h2>
                <p>{error || 'Resignation not found.'}</p>
                <Link href="/dashboard" className="mt-4 inline-block underline hover:text-red-900">
                    Return to Dashboard
                </Link>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-6 max-w-6xl space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>

                    <h1 className="text-3xl font-bold text-foreground tracking-tight flex items-center gap-3">
                        <UserCircle className="w-8 h-8 text-primary" />
                        Interviewee: {
                            role === 'lead'
                                ? (details?.full_name || details?.email)
                                : (details?.role ? `${details.role} #${(resignation as any).employee_id?.slice(0, 8)}` : 'Employee')
                        }

                    </h1>
                    {role !== 'lead' && (
                        <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                            <Lock className="w-3 h-3" />
                            Anonymized Mode
                        </p>
                    )}
                </div>

                <div className="flex items-center gap-3">
                    <Badge variant="outline" className="text-muted-foreground border-border">
                        {details?.role || 'Employee'}
                    </Badge>

                    <Badge variant="outline" className={cn(
                        "font-semibold",
                        resignation.status === 'completed' && "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
                        resignation.status === 'scheduled' && "bg-primary/10 text-primary border-primary/20",
                        resignation.status === 'pending_interview' && "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
                        resignation.status === 'pending_exit_form' && "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
                        resignation.status === 'cancelled' && "bg-destructive/10 text-destructive border-destructive/20"
                    )}>
                        Status: {resignation.status?.replace(/_/g, ' ').toUpperCase()}
                    </Badge>
                </div>
            </div>

            {resignation.status === 'completed' ? (
                <InterviewReportDossier
                    resignation={resignation}
                    verifiedResults={verifiedResults || []}
                    responses={responses || []}
                />
            ) : (
                <InterviewSession
                    resignation={resignation}
                    responses={responses || []}
                    verifiedResults={verifiedResults || []}
                />
            )}
        </div>
    );
}
