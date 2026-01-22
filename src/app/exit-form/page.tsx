import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { ExitFormWizard } from '@/components/exit-form/exit-form-wizard';
import { Toaster } from '@/components/ui/sonner';
import { BarChart3 } from 'lucide-react';
import Link from 'next/link';
import type { ExitFormData } from './actions';

export default async function ExitFormPage() {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
    }

    // Check for existing pending resignation
    let { data: resignation } = await supabase
        .from('resignations')
        .select('*')
        .eq('employee_id', user.id)
        .eq('status', 'pending')
        .single();

    // If no pending resignation, create one
    if (!resignation) {
        const { data: newResignation, error: createError } = await supabase
            .from('resignations')
            .insert({ employee_id: user.id, status: 'pending' })
            .select()
            .single();

        if (createError) {
            return (
                <div className="min-h-screen bg-background flex items-center justify-center p-6">
                    <div className="max-w-md text-center">
                        <h1 className="text-2xl font-bold text-destructive mb-2">Error</h1>
                        <p className="text-muted-foreground">{createError.message}</p>
                    </div>
                </div>
            );
        }
        resignation = newResignation;
    }

    // Check if already completed
    if (resignation.status === 'completed') {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center p-6">
                <div className="max-w-md text-center space-y-4">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10 mx-auto">
                        <svg
                            className="h-8 w-8 text-emerald-500"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M5 13l4 4L19 7"
                            />
                        </svg>
                    </div>
                    <h1 className="text-2xl font-bold">Exit Form Completed</h1>
                    <p className="text-muted-foreground">
                        You have already submitted your exit interview form. Thank you for your feedback.
                    </p>
                </div>
            </div>
        );
    }

    // Get existing exit response if any (for resuming)
    const { data: existingResponse } = await supabase
        .from('exit_responses')
        .select('*')
        .eq('resignation_id', resignation.id)
        .single();

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <header className="border-b border-white/5 bg-[#0d0d0d]">
                <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-600 to-indigo-500 shadow-lg shadow-indigo-500/20">
                            <BarChart3 className="h-4 w-4 text-white" />
                        </div>
                        <span className="font-bold text-lg">
                            Retention<span className="text-indigo-500">Hub</span>
                        </span>
                    </Link>
                    <span className="text-sm text-muted-foreground">{user.email}</span>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-4xl mx-auto px-6 py-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold tracking-tight">Exit Interview Form</h1>
                    <p className="mt-2 text-muted-foreground">
                        We value your feedback. Please complete all sections before your departure.
                    </p>
                </div>

                <ExitFormWizard
                    resignationId={resignation.id}
                    existingData={(existingResponse as Partial<ExitFormData>) || undefined}
                />
            </main>

            <Toaster richColors position="top-center" />
        </div>
    );
}
