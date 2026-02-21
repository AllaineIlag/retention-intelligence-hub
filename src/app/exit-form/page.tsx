import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import {
    getResignation,
    getExitResponse,
    getUserProfile,
    getQuestions
} from './actions';

export const dynamic = 'force-dynamic';

import { ExitFormWizard } from '@/components/exit-form-wizard';

export default async function ExitFormPage() {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
    }

    // Fetch all necessary data parallel for speed (The Gloious Evolution)
    const [resignationRes, profileRes, questionsRes] = await Promise.all([
        getResignation(), // Updated call
        getUserProfile(),
        getQuestions()
    ]);

    if (!resignationRes.success || !resignationRes.data) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background text-zinc-400">
                <div className="text-center space-y-4">
                    <h1 className="text-2xl font-bold text-white">No Active Exit Process</h1>
                    <p>{resignationRes.error || "You do not have an assigned resignation case."}</p>
                    <p className="text-sm">Please contact your HR representative if you believe this is an error.</p>
                </div>
            </div>
        );
    }

    const resignationId = resignationRes.data.id;
    const responseRes = await getExitResponse(resignationId);

    if (!responseRes.success) {
        return <div>Error loading exit response record: {responseRes.error}</div>;
    }

    const resignation = resignationRes.data;

    // Terminal state: interview is done. Show a completion screen, not the form.
    if (resignation.status === 'completed') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background px-4">
                <div className="text-center space-y-6 max-w-md">
                    <div className="flex items-center justify-center w-16 h-16 rounded-full bg-green-500/10 border border-green-500/30 mx-auto">
                        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-400">
                            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
                        </svg>
                    </div>
                    <div className="space-y-2">
                        <h1 className="text-2xl font-bold text-white">Thank you.</h1>
                        <p className="text-zinc-400 leading-relaxed">
                            Your exit interview has been completed.<br />
                            Your responses have been recorded.
                        </p>
                        <p className="text-xs text-zinc-600 pt-2">— HR Team</p>
                    </div>
                </div>
            </div>
        );
    }

    let isLocked = false;

    if (resignation.status === 'locked' || resignation.status === 'pending_interview') {
        isLocked = true;
    } else if (resignation.status === 'scheduled' && resignation.scheduled_interview_date) {
        const interviewDate = new Date(resignation.scheduled_interview_date);
        // Relaxing the 24h lock to allow "Same Day" completion for testing/urgent cases.
        // Lock only when the interview actually starts.
        const lockThreshold = interviewDate;

        if (new Date() >= lockThreshold) {
            isLocked = true;
        }
    }


    return (
        <div className="min-h-screen bg-background/50 dark:bg-background py-12 px-4 sm:px-6 lg:px-8">
            <ExitFormWizard
                user={user}
                resignation={resignationRes.data}
                profile={profileRes.data}
                questions={questionsRes.data || []}
                initialResponse={responseRes.data || null}
                readOnly={isLocked}
            />
        </div>
    );
}
