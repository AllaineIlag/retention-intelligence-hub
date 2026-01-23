import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { ExitFormWizard } from '@/components/exit-form/exit-form-wizard';
import { getOrCreateResignation, getReferenceData, getResignationReasons, getQuestions } from './actions';

export default async function ExitFormPage() {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
    }

    // Parallel data fetching
    const [resignation, referenceData, reasons, questions] = await Promise.all([
        getOrCreateResignation(),
        getReferenceData(),
        getResignationReasons(),
        getQuestions() // Fetch questions from DB
    ]);

    return (
        <ExitFormWizard
            resignation={resignation}
            referenceData={referenceData}
            reasons={reasons}
            questions={questions}
        />
    )
}
