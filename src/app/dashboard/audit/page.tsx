import { AuditLogTable } from '@/components/dashboard/audit/AuditLogTable';
import { getAuditLogs } from '@/app/actions/audit-actions';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export default async function AuditPage() {
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

    const { data: logs } = await getAuditLogs({});

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <AuditLogTable logs={logs || []} />
        </div>
    );
}
