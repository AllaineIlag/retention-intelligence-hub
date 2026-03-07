'use client';

import { Suspense, useEffect, useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, Loader2, ShieldX, Info } from 'lucide-react';
import Image from 'next/image';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useSearchParams } from 'next/navigation';
import { ThemeToggle } from '@/components/dashboard/theme-toggle';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { login } from './actions';

function LoginForm() {
    const [isLoading, startLogin] = useTransition();
    const searchParams = useSearchParams();
    const [urlMessage, setUrlMessage] = useState('');
    const [error, setError] = useState('');
    const [isForbidden, setIsForbidden] = useState(false);

    useEffect(() => {
        const errorParam = searchParams.get('error');
        const msg = searchParams.get('message');
        if (errorParam === 'forbidden') {
            setIsForbidden(true);
        }
        if (msg) setUrlMessage(msg);
    }, [searchParams]);

    async function handleSubmit(formData: FormData) {
        setError('');
        startLogin(async () => {
            const result = await login(formData);
            if (result && !result.success) {
                setError(result.message);
            }
        });
    }

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
                        {isForbidden ? 'Access Denied' : 'Account Login'}
                    </CardTitle>
                    <CardDescription className="text-muted-foreground font-medium">
                        {isForbidden
                            ? 'Your account is not authorized to access this system.'
                            : 'Enter credentials to access the Retention Intelligence Hub'
                        }
                    </CardDescription>
                </div>
            </CardHeader>
            <CardContent>
                <form action={handleSubmit} className="space-y-4">
                    {/* FORBIDDEN NOTICE */}
                    {isForbidden && (
                        <div className="rounded-xl border border-destructive/20 bg-destructive/10 p-5 text-center space-y-3">
                            <p className="text-sm text-destructive font-semibold leading-relaxed">
                                This system is private and restricted to authorized company personnel only.
                            </p>
                            <p className="text-xs text-muted-foreground leading-relaxed italic">
                                If you are part of the company and believe this is an error, please contact your HR department for authorized credentials.
                            </p>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => setIsForbidden(false)}
                                className="mt-2 border-border/50 bg-accent/30 text-accent-foreground hover:bg-accent/50 text-xs"
                            >
                                Back to Login
                            </Button>
                        </div>
                    )}

                    {!isForbidden && (
                        <div className="space-y-4">
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

                            {error && (
                                <Alert variant="destructive" className="bg-destructive/10 border-destructive/20 text-destructive flex items-center p-3 rounded-lg shadow-sm">
                                    <AlertCircle className="w-4 h-4 shrink-0" />
                                    <div className="ml-3">
                                        <AlertDescription className="text-xs font-medium leading-relaxed">
                                            {error}
                                        </AlertDescription>
                                    </div>
                                </Alert>
                            )}

                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-sm font-semibold text-foreground/80">Corporate Email</Label>
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    placeholder="name@company.com"
                                    required
                                    autoComplete="email"
                                    className="bg-background/50 border-border/50 focus:border-primary/50 transition-colors"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="password" className="text-sm font-semibold text-foreground/80">Password</Label>
                                <Input
                                    id="password"
                                    name="password"
                                    type="password"
                                    required
                                    placeholder="••••••••"
                                    autoComplete="current-password"
                                    className="bg-background/50 border-border/50 focus:border-primary/50 transition-colors"
                                />
                            </div>

                            <Button
                                type="submit"
                                disabled={isLoading}
                                className="w-full bg-primary text-primary-foreground border-transparent hover:bg-primary/90 h-11 relative text-[15px] font-medium transition-all shadow-md mt-2"
                            >
                                {isLoading ? (
                                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                ) : (
                                    'Login'
                                )}
                            </Button>

                            <div className="pt-2">
                                <p className="text-[12px] text-muted-foreground text-center px-6 leading-tight">
                                    Access is restricted to verified employees. Contact an Administrator for credentials.
                                </p>
                            </div>
                        </div>
                    )}
                </form>
            </CardContent>
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
