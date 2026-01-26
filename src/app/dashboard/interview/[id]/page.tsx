import { getInterviewDetails } from '@/app/actions/interview-ops';
import { InterviewSession } from '@/components/interview/InterviewSession';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/server';
import { ArrowLeft, UserCircle, Lock } from 'lucide-react';
import Link from 'next/link';
import { redirect } from 'next/navigation';

export default async function InterviewPage({ params }: { params: { id: string } }) {
    const { id } = await params;
    const { resignation, responses, error } = await getInterviewDetails(id);

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
                    <div className="flex items-center gap-2 text-slate-500 text-sm mb-1">
                        <Link href="/dashboard" className="hover:text-indigo-600 transition-colors flex items-center gap-1">
                            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
                        </Link>
                        <span>/</span>
                        <span>Live Interview</span>
                    </div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
                        <UserCircle className="w-8 h-8 text-indigo-600" />
                        Interview: {
                            role === 'lead'
                                ? (resignation.employee?.full_name || resignation.employee?.email)
                                : (resignation.employee?.role ? `${resignation.employee.role} #${resignation.employee?.id?.slice(0, 8)}` : 'Employee')
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
                    <Badge variant="outline" className="text-slate-600 border-slate-300">
                        {resignation.employee?.role || 'Employee'}
                    </Badge>
                    <Badge className={`
            ${resignation.status === 'completed' ? 'bg-green-100 text-green-700 hover:bg-green-200' : ''}
            ${resignation.status === 'scheduled' ? 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200' : ''}
            ${resignation.status === 'pending' ? 'bg-amber-100 text-amber-700 hover:bg-amber-200' : ''}
          `}>
                        Status: {resignation.status?.toUpperCase()}
                    </Badge>
                </div>
            </div>

            {resignation.status === 'completed' ? (
                <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center text-green-800">
                    <h3 className="font-bold text-lg">This interview is complete.</h3>
                    <p className="mb-4">No further edits can be made.</p>
                    <Button asChild variant="outline" className="border-green-300 hover:bg-green-100">
                        <Link href="/dashboard">Return to Dashboard</Link>
                    </Button>
                </div>
            ) : (
                <InterviewSession
                    resignation={resignation}
                    responses={responses || []}
                />
            )}
        </div>
    );
}
