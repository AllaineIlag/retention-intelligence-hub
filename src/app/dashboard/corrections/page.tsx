import { CorrectionLogTable } from '@/components/dashboard/audit/CorrectionLogTable';
import { getCorrectionHistory } from '@/app/actions/audit-actions';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export default async function CorrectionsPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) redirect('/login');

    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

    if (profile?.role !== 'lead') {
        redirect('/dashboard');
    }

    const { data: corrections } = await getCorrectionHistory();

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <CorrectionLogTable corrections={corrections || []} />
        </div>
    );
}
