import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import {
    getResignation, // Updated import
    getExitResponse,
    getUserProfile,
    getQuestions
} from './actions';
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
    let isLocked = false;

    if (resignation.status === 'locked') {
        isLocked = true;
    } else if (resignation.status === 'scheduled' && resignation.scheduled_interview_date) {
        const interviewDate = new Date(resignation.scheduled_interview_date);
        const lockThreshold = new Date(interviewDate.getTime() - (24 * 60 * 60 * 1000));

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
                initialResponse={responseRes.data}
                readOnly={isLocked}
            />
        </div>
    );
}
