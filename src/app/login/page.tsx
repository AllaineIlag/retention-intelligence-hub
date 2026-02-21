'use client';

import { Suspense, useEffect, useState, useTransition } from 'react';
import { loginWithGoogle } from './actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, Loader2, Lock, ShieldX } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useSearchParams } from 'next/navigation';

function LoginForm() {
    const [isVerifyingGoogle, startVerifyGoogle] = useTransition();
    const searchParams = useSearchParams();
    const [urlMessage, setUrlMessage] = useState('');
    const [isForbidden, setIsForbidden] = useState(false);

    useEffect(() => {
        const error = searchParams.get('error');
        const msg = searchParams.get('message');
        if (error === 'forbidden') {
            setIsForbidden(true);
        }
        if (msg) setUrlMessage(msg);
    }, [searchParams]);

    return (
        <Card className="w-full max-w-md border-white/10 bg-[#0f0f11]/80 backdrop-blur-xl shadow-2xl relative z-10">
            <CardHeader className="space-y-3 text-center">
                <div className="flex justify-center">
                    <div className={`rounded-2xl p-4 ring-1 ring-white/10 ${isForbidden ? 'bg-gradient-to-br from-red-500/20 to-rose-500/20' : 'bg-gradient-to-br from-blue-500/20 to-sky-500/20'}`}>
                        {isForbidden
                            ? <ShieldX className="h-8 w-8 text-red-400" />
                            : <Lock className="h-8 w-8 text-blue-400" />
                        }
                    </div>
                </div>
                <CardTitle className="text-2xl font-bold tracking-tight text-white">
                    {isForbidden ? 'Access Denied' : 'Welcome'}
                </CardTitle>
                <CardDescription className="text-zinc-400">
                    {isForbidden
                        ? 'Your account is not authorized to access this system.'
                        : 'Sign in to access the Retention Intelligence Hub'
                    }
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">

                    {/* FORBIDDEN NOTICE */}
                    {isForbidden && (
                        <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-5 text-center space-y-3">
                            <p className="text-sm text-red-300 font-medium leading-relaxed">
                                This system is private and restricted to authorized company personnel only.
                            </p>
                            <p className="text-xs text-zinc-400 leading-relaxed">
                                If you are part of the company and believe this is an error, please contact your HR department for an authorized invitation link.
                            </p>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => setIsForbidden(false)}
                                className="mt-2 border-white/10 bg-white/5 text-zinc-300 hover:bg-white/10 text-xs"
                            >
                                Try a different account
                            </Button>
                        </div>
                    )}

                    {/* GOOGLE LOGIN */}
                    {!isForbidden && (
                        <div className="space-y-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => startVerifyGoogle(async () => {
                                    await loginWithGoogle();
                                })}
                                disabled={isVerifyingGoogle}
                                className="w-full border-white/10 bg-white/5 text-white hover:bg-white/10 hover:text-white h-12 relative text-base font-medium transition-all hover:scale-[1.02] active:scale-[0.98]"
                            >
                                {isVerifyingGoogle ? (
                                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                ) : (
                                    <svg className="mr-3 h-5 w-5" aria-hidden="true" focusable="false" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
                                        <path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"></path>
                                    </svg>
                                )}
                                Continue with Google
                            </Button>

                            {urlMessage && (
                                <Alert className="bg-brand-card p-4 rounded-full border border-brand-border/50 group-hover:border-brand-primary/50 transition-colors shadow-2xl">
                                    <Lock className="w-8 h-8 text-brand-primary" />
                                    <AlertDescription className="ml-2 text-xs">{urlMessage}</AlertDescription>
                                </Alert>
                            )}

                            <p className="text-[12px] text-zinc-500 text-center px-6">
                                Only authorized emails are permitted for system access.
                            </p>
                        </div>
                    )}
                </div>
            </CardContent>
            <CardFooter className="justify-center border-t border-white/5 py-4">
                <p className="text-xs text-zinc-500">
                    Protected by Retention Intelligence System
                </p>
            </CardFooter>
        </Card>
    );
}

export default function LoginPage() {
    return (
        <div className="relative min-h-screen flex items-center justify-center bg-brand-background p-4 overflow-hidden selection:bg-brand-primary/30">
            <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />
            <Suspense fallback={
                <div className="flex items-center justify-center text-white">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                </div>
            }>
                <LoginForm />
            </Suspense>
        </div>
    );
}
