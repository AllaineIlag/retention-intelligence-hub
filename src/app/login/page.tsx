'use client';

import { Suspense, useActionState, useEffect, useState, useTransition } from 'react';
import { loginWithPassword, loginWithGoogle } from './actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { AlertCircle, Loader2, ArrowRight, Lock } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useRouter, useSearchParams } from 'next/navigation';

// Define the shape of our form state
interface FormState {
    success: boolean;
    message: string;
}

const initialState: FormState = {
    success: false,
    message: '',
};

function LoginForm() {
    const [passwordState, passwordAction, isPasswordPending] = useActionState(loginWithPassword, initialState);

    // We only need Google and Password now, no steps required unless we want to keep the "forgot password" flow later.
    // For now, simpler is better.

    const [isVerifying, startVerify] = useTransition();
    const router = useRouter();
    const searchParams = useSearchParams();

    // Handle initial state message from URL
    const [urlMessage, setUrlMessage] = useState('');

    useEffect(() => {
        const msg = searchParams.get('message');
        if (msg) setUrlMessage(msg);
    }, [searchParams]);

    // Handle Password Login Success
    useEffect(() => {
        if (passwordState.success && passwordState.redirectUrl) {
            router.push(passwordState.redirectUrl);
        }
    }, [passwordState, router]);

    return (
        <Card className="w-full max-w-md border-white/10 bg-[#0f0f11]/80 backdrop-blur-xl shadow-2xl relative z-10">
            <CardHeader className="space-y-3 text-center">
                <div className="flex justify-center">
                    <div className="rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 p-4 ring-1 ring-white/10">
                        <Lock className="h-8 w-8 text-indigo-400" />
                    </div>
                </div>
                <CardTitle className="2xl font-bold tracking-tight text-white">
                    Welcome Back
                </CardTitle>
                <CardDescription className="text-zinc-400">
                    Sign in to access the Retention Intelligence Hub
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">

                    {/* Google Login - Primary */}
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => startVerify(async () => {
                            await loginWithGoogle();
                        })}
                        disabled={isPasswordPending || isVerifying}
                        className="w-full border-white/10 bg-white/5 text-white hover:bg-white/10 hover:text-white h-11 relative"
                    >
                        {isVerifying ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                            <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
                                <path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"></path>
                            </svg>
                        )}
                        Sign in with Google
                    </Button>

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-white/10" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-[#0f0f11] px-2 text-zinc-500">Or use password</span>
                        </div>
                    </div>

                    {/* Password Form */}
                    <form action={passwordAction} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-zinc-300">Email Address</Label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                placeholder="name@company.com"
                                required
                                className="border-white/10 bg-white/5 text-white placeholder:text-zinc-500 focus:border-indigo-500/50 focus:ring-indigo-500/20"
                            />
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="password" className="text-zinc-300">Password</Label>
                            </div>
                            <Input
                                id="password"
                                name="password"
                                type="password"
                                placeholder="••••••••"
                                required
                                className="border-white/10 bg-white/5 text-white placeholder:text-zinc-500 focus:border-indigo-500/50 focus:ring-indigo-500/20"
                            />
                        </div>

                        {/* Error Message for Password Login */}
                        {!passwordState.success && passwordState.message && (
                            <Alert variant="destructive" className="bg-red-500/10 text-red-400 border-none p-2">
                                <AlertCircle className="h-4 w-4" />
                                <AlertDescription className="ml-2 text-xs">{passwordState.message}</AlertDescription>
                            </Alert>
                        )}

                        {urlMessage && (
                            <Alert className="bg-indigo-500/10 text-indigo-300 border-indigo-500/20 p-2">
                                <AlertCircle className="h-4 w-4 text-indigo-400" />
                                <AlertDescription className="ml-2 text-xs">{urlMessage}</AlertDescription>
                            </Alert>
                        )}

                        <Button
                            type="submit"
                            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium h-10 transition-all"
                            disabled={isPasswordPending || isVerifying}
                        >
                            {isPasswordPending ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Signing In...
                                </>
                            ) : (
                                <>
                                    Sign In with Password
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </>
                            )}
                        </Button>
                    </form>
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
        <div className="flex min-h-screen items-center justify-center bg-[#0a0a0a] p-4 font-sans">
            <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />
            <Suspense fallback={
                <div className="flex items-center justify-center text-white">
                    <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
                </div>
            }>
                <LoginForm />
            </Suspense>
        </div>
    );
}
