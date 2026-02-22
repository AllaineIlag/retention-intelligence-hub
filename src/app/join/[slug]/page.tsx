'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Lock, Users } from 'lucide-react';
import { useActionState, useTransition } from 'react'; // next/navigation doesn't have useActionState, react does
import { loginWithInvite } from '../actions';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import { ThemeToggle } from '@/components/dashboard/theme-toggle';

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
        <div className="flex min-h-screen items-center justify-center bg-background p-4 font-sans relative overflow-hidden text-foreground selection:bg-primary/30 transition-colors duration-300">
            <div className="absolute top-4 right-4 z-50">
                <ThemeToggle />
            </div>
            <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,var(--color-background),transparent)] opacity-40 dark:opacity-100" />
            <div className="relative z-10 w-full max-w-md">
                <Card className="border-border bg-card/80 backdrop-blur-xl shadow-2xl relative z-10">
                    <CardHeader className="space-y-4 text-center pb-6">
                        <div className="flex justify-center mb-2">
                            <div className="flex items-center justify-center p-3 rounded-2xl bg-accent/30 border border-border shadow-sm">
                                <Image src="/tdk-logo.png" alt="TDK Logo" width={64} height={46} className="object-contain" priority />
                            </div>
                        </div>
                        <div className="space-y-1">
                            <CardTitle className="text-2xl font-bold tracking-tight text-foreground">
                                Join {teamName}
                            </CardTitle>
                            <CardDescription className="text-muted-foreground font-medium">
                                You have been invited to join the <strong className="text-foreground tracking-tight">{teamName}</strong> workspace on Retention Intelligence Hub.
                            </CardDescription>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <Button
                                onClick={handleLogin}
                                disabled={isPending}
                                className="w-full bg-primary text-primary-foreground border-transparent hover:bg-primary/90 h-11 relative text-[15px] font-medium transition-all shadow-md"
                            >
                                {isPending ? (
                                    <>
                                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                        Connecting...
                                    </>
                                ) : (
                                    <>
                                        <svg className="mr-3 h-5 w-5" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
                                            <path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"></path>
                                        </svg>
                                        Sign in with Google
                                    </>
                                )}
                            </Button>
                            <div className="pt-2">
                                <p className="text-center text-xs text-muted-foreground px-6 leading-relaxed">
                                    By joining, you agree to our <span className="underline cursor-pointer hover:text-foreground">Terms of Service</span> and <span className="underline cursor-pointer hover:text-foreground">Privacy Policy</span>.
                                </p>
                            </div>
                            <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-border/10" />
                                </div>
                                <div className="relative flex justify-center text-xs">
                                    <span className="bg-card px-2 text-muted-foreground font-medium">or</span>
                                </div>
                            </div>
                            <p className="text-center text-xs text-muted-foreground">
                                Already have an account?{' '}
                                <a
                                    href="/login"
                                    className="text-primary hover:text-primary/80 font-medium transition-colors underline-offset-4 hover:underline"
                                >
                                    Sign in here →
                                </a>
                            </p>
                        </div>

                    </CardContent>
                    <CardFooter className="justify-center border-t border-border/10 py-4">
                        <div className="flex items-center text-xs text-muted-foreground/60 italic">
                            <Lock className="mr-1.5 h-3 w-3" />
                            Secure Invitation Perimeter
                        </div>
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
}
