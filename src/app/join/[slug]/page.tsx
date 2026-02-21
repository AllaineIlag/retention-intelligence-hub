'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Lock, Users } from 'lucide-react';
import { useActionState, useTransition } from 'react'; // next/navigation doesn't have useActionState, react does
import { loginWithInvite } from '../actions';
import { useParams } from 'next/navigation';

export default function InvitePage() {
    const params = useParams();
    const slug = params.slug as string;
    const [isPending, startTransition] = useTransition();

    const teamName = slug === 'hr-team' ? 'HR Team' :
        slug === 'exit-process' ? 'Exit Process' :
            slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

    const handleLogin = () => {
        startTransition(async () => {
            await loginWithInvite(slug);
        });
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-brand-background p-4 font-sans">
            <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />
            <div className="relative z-10 w-full max-w-md">
                <Card className="border-brand-border bg-brand-card/80 backdrop-blur-xl shadow-2xl">
                    <CardHeader className="space-y-3 text-center">
                        <div className="flex justify-center">
                            <div className="rounded-2xl bg-gradient-to-br from-brand-primary/20 to-brand-secondary/20 p-4 ring-1 ring-brand-border">
                                <Users className="h-8 w-8 text-brand-primary" />
                            </div>
                        </div>
                        <CardTitle className="text-2xl font-bold tracking-tight text-white">
                            Join {teamName}
                        </CardTitle>
                        <CardDescription className="text-zinc-400">
                            You have been invited to join the <strong>{teamName}</strong> workspace on Retention Intelligence Hub.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <Button
                                onClick={handleLogin}
                                disabled={isPending}
                                className="w-full bg-white text-black hover:bg-zinc-200 h-11 font-medium transition-all"
                            >
                                {isPending ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Connecting...
                                    </>
                                ) : (
                                    <>
                                        <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
                                            <path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"></path>
                                        </svg>
                                        Sign in with Google
                                    </>
                                )}
                            </Button>
                            <p className="text-center text-xs text-zinc-500">
                                By joining, you agree to our Terms of Service and Privacy Policy.
                            </p>
                            <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-white/10" />
                                </div>
                                <div className="relative flex justify-center text-xs">
                                    <span className="bg-brand-card px-2 text-zinc-500">or</span>
                                </div>
                            </div>
                            <p className="text-center text-xs text-zinc-500">
                                Already have an account?{' '}
                                <a
                                    href="/login"
                                    className="text-brand-primary hover:text-brand-secondary font-medium transition-colors underline-offset-4 hover:underline"
                                >
                                    Sign in here →
                                </a>
                            </p>
                        </div>

                    </CardContent>
                    <CardFooter className="justify-center border-t border-white/5 py-4">
                        <div className="flex items-center text-xs text-zinc-500">
                            <Lock className="mr-1 h-3 w-3" />
                            Secure Invitation
                        </div>
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
}
