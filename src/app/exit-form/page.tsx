import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export default async function ExitFormPage() {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
    }

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-6">
            <div className="max-w-2xl w-full space-y-8">
                <div className="text-center">
                    <h1 className="text-3xl font-bold tracking-tight">Exit Interview Form</h1>
                    <p className="mt-2 text-muted-foreground">
                        We value your feedback. Please complete this form before your departure.
                    </p>
                </div>

                <div className="rounded-xl border bg-card p-8 text-center">
                    <p className="text-muted-foreground">
                        The exit form wizard will be implemented in Phase 3.
                    </p>
                    <p className="mt-4 text-sm text-muted-foreground">
                        Logged in as: <span className="font-medium">{user.email}</span>
                    </p>
                </div>
            </div>
        </div>
    );
}
