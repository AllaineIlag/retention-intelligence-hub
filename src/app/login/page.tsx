'use client';

import { Suspense, useEffect, useState, useTransition } from 'react';
import { loginWithGoogle } from './actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, Loader2, ShieldX, Info } from 'lucide-react';
import Image from 'next/image';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useSearchParams } from 'next/navigation';
import { ThemeToggle } from '@/components/dashboard/theme-toggle';

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
        <Card className="w-full max-w-md border-border bg-card/80 backdrop-blur-xl shadow-2xl relative z-10">
            <CardHeader className="space-y-4 text-center pb-6">
                <div className="flex justify-center mb-2">
                    {isForbidden ? (
                        <div className="rounded-2xl p-4 ring-1 ring-border bg-destructive/10">
                            <ShieldX className="h-8 w-8 text-destructive" />
                        </div>
                    ) : (
                        <div className="flex items-center justify-center p-3 rounded-2xl bg-accent/30 border border-border shadow-sm">
                            <Image src="/tdk-logo.png" alt="TDK Logo" width={64} height={46} className="object-contain" priority />
                        </div>
                    )}
                </div>
                <div className="space-y-1">
                    <CardTitle className="text-2xl font-bold tracking-tight text-foreground">
                        {isForbidden ? 'Access Denied' : 'Welcome Back'}
                    </CardTitle>
                    <CardDescription className="text-muted-foreground font-medium">
                        {isForbidden
                            ? 'Your account is not authorized to access this system.'
                            : 'Sign in to access the Retention Intelligence Hub'
                        }
                    </CardDescription>
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">

                    {/* FORBIDDEN NOTICE */}
                    {isForbidden && (
                        <div className="rounded-xl border border-destructive/20 bg-destructive/10 p-5 text-center space-y-3">
                            <p className="text-sm text-destructive font-semibold leading-relaxed">
                                This system is private and restricted to authorized company personnel only.
                            </p>
                            <p className="text-xs text-muted-foreground leading-relaxed italic">
                                If you are part of the company and believe this is an error, please contact your HR department for an authorized invitation link.
                            </p>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => setIsForbidden(false)}
                                className="mt-2 border-border/50 bg-accent/30 text-accent-foreground hover:bg-accent/50 text-xs"
                            >
                                Try a different account
                            </Button>
                        </div>
                    )}

                    {/* GOOGLE LOGIN */}
                    {!isForbidden && (
                        <div className="space-y-5">
                            {urlMessage && (
                                <Alert className="bg-sky-500/10 border-sky-500/20 text-sky-400 flex items-center p-3 rounded-lg shadow-sm">
                                    <Info className="w-4 h-4 shrink-0" />
                                    <div className="ml-3">
                                        <AlertDescription className="text-xs font-medium leading-relaxed">
                                            {urlMessage}
                                        </AlertDescription>
                                    </div>
                                </Alert>
                            )}

                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => startVerifyGoogle(async () => {
                                    await loginWithGoogle();
                                })}
                                disabled={isVerifyingGoogle}
                                className="w-full bg-primary text-primary-foreground border-transparent hover:bg-primary/90 h-11 relative text-[15px] font-medium transition-all shadow-md"
                            >
                                {isVerifyingGoogle ? (
                                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                ) : (
                                    <svg className="mr-3 h-5 w-5" aria-hidden="true" focusable="false" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
                                        <path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"></path>
                                    </svg>
                                )}
                                Sign in with Google
                            </Button>

                            <div className="pt-2">
                                <p className="text-[12px] text-muted-foreground text-center px-6 leading-tight">
                                    Only authorized emails are permitted for system access.
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </CardContent>
            <CardFooter className="justify-center border-t border-border/10 py-4">
                <p className="text-xs text-muted-foreground/60 transition-opacity hover:opacity-100 italic">
                    Protected by Retention Intelligence System
                </p>
            </CardFooter>
        </Card>
    );
}

export default function LoginPage() {
    return (
        <div className="relative min-h-screen flex items-center justify-center bg-background p-4 overflow-hidden selection:bg-primary/30 text-foreground transition-colors duration-300">
            <div className="absolute top-4 right-4 z-50">
                <ThemeToggle />
            </div>
            <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,var(--color-background),transparent)] opacity-40 dark:opacity-100" />
            <Suspense fallback={
                <div className="flex flex-col items-center justify-center gap-4 text-foreground">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="text-sm font-medium animate-pulse">Initializing Security...</p>
                </div>
            }>
                <LoginForm />
            </Suspense>
        </div>
    );
}
