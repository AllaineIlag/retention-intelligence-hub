'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, Mail, CheckCircle2, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export default function PendingApprovalPage() {
    const router = useRouter();
    const [status, setStatus] = useState<'pending' | 'active' | 'loading'>('loading');

    const checkStatus = useCallback(async () => {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            router.replace('/login');
            return;
        }

        const { data: profile } = await supabase
            .from('profiles')
            .select('status')
            .eq('id', user.id)
            .single();

        if (profile?.status === 'active') {
            setStatus('active');
            // Brief delay to show the success state before redirecting
            setTimeout(() => {
                router.replace('/dashboard');
            }, 2000);
        } else {
            setStatus('pending');
        }
    }, [router]);

    useEffect(() => {
        checkStatus();

        // Realtime: react instantly when the Lead approves/rejects this user
        const supabase = createClient();

        let userId: string | null = null;

        supabase.auth.getUser().then(({ data: { user } }) => {
            if (!user) return;
            userId = user.id;

            supabase
                .channel('my-profile-status')
                .on(
                    'postgres_changes',
                    { event: 'UPDATE', schema: 'public', table: 'profiles', filter: `id=eq.${user.id}` },
                    () => { checkStatus(); }
                )
                .subscribe();
        });

        return () => {
            supabase.removeAllChannels();
        };
    }, [checkStatus]);

    if (status === 'loading') {
        return (
            <div className="flex min-h-screen items-center justify-center bg-[#0a0a0a]">
                <Loader2 className="h-8 w-8 text-zinc-500 animate-spin" />
            </div>
        );
    }

    if (status === 'active') {
        return (
            <div className="flex min-h-screen items-center justify-center bg-[#0a0a0a] p-4 font-sans">
                <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />
                <div className="relative z-10 w-full max-w-md">
                    <Card className="border-green-500/20 bg-[#0f0f11]/80 backdrop-blur-xl shadow-2xl">
                        <CardHeader className="space-y-4 text-center">
                            <div className="flex justify-center">
                                <div className="rounded-2xl bg-gradient-to-br from-green-500/20 to-emerald-500/20 p-4 ring-1 ring-green-500/20">
                                    <CheckCircle2 className="h-8 w-8 text-green-400" />
                                </div>
                            </div>
                            <CardTitle className="text-2xl font-bold tracking-tight text-white">
                                Access Approved!
                            </CardTitle>
                            <CardDescription className="text-zinc-400 text-sm leading-relaxed">
                                Your account has been approved. Redirecting you to the dashboard...
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                <div className="flex items-center justify-between text-xs text-zinc-500">
                                    <span>Status</span>
                                    <span className="flex items-center gap-1.5 text-green-400">
                                        <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                                        Approved
                                    </span>
                                </div>
                                <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                                    <div className="h-full w-full rounded-full bg-gradient-to-r from-green-500 to-emerald-500 transition-all duration-1000" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-[#0a0a0a] p-4 font-sans">
            <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />
            <div className="relative z-10 w-full max-w-md">
                <Card className="border-white/10 bg-[#0f0f11]/80 backdrop-blur-xl shadow-2xl">
                    <CardHeader className="space-y-4 text-center">
                        <div className="flex justify-center">
                            <div className="rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 p-4 ring-1 ring-white/10">
                                <Clock className="h-8 w-8 text-amber-400" />
                            </div>
                        </div>
                        <CardTitle className="text-2xl font-bold tracking-tight text-white">
                            Awaiting Approval
                        </CardTitle>
                        <CardDescription className="text-zinc-400 text-sm leading-relaxed">
                            Your account has been created and is pending approval from the Retention Lead.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4 space-y-3">
                            <div className="flex items-start gap-3">
                                <Mail className="h-5 w-5 text-indigo-400 mt-0.5 shrink-0" />
                                <p className="text-sm text-zinc-300 leading-relaxed">
                                    You will receive an <strong className="text-white">email notification</strong> once your access has been approved. Please check your inbox.
                                </p>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between text-xs text-zinc-500">
                                <span>Status</span>
                                <span className="flex items-center gap-1.5">
                                    <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
                                    Pending
                                </span>
                            </div>
                            <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                                <div className="h-full w-1/3 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 animate-pulse" />
                            </div>
                        </div>
                        <p className="text-center text-xs text-zinc-600">
                            If this takes too long, please contact your Retention Lead directly.
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
