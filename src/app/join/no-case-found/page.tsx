'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, Lock } from 'lucide-react';
import Link from 'next/link';

export default function NoCaseFoundPage() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-[#0a0a0a] p-4 font-sans">
            <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />
            <div className="relative z-10 w-full max-w-md">
                <Card className="border-red-500/20 bg-[#0f0f11]/80 backdrop-blur-xl shadow-2xl">
                    <CardHeader className="space-y-3 text-center">
                        <div className="flex justify-center">
                            <div className="rounded-2xl bg-red-500/10 p-4 ring-1 ring-red-500/20">
                                <AlertCircle className="h-8 w-8 text-red-500" />
                            </div>
                        </div>
                        <CardTitle className="text-2xl font-bold tracking-tight text-white">
                            No Active Exit Case Found
                        </CardTitle>
                        <CardDescription className="text-zinc-400">
                            We couldn't find an active exit interview scheduled for this email address.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4 text-center">
                            <p className="text-sm text-zinc-300">
                                Please ensure you are signing in with the email address where you received the invitation.
                            </p>
                            <p className="text-sm text-zinc-500">
                                If you believe this is an error, please contact your HR representative.
                            </p>

                            <Button asChild className="w-full bg-white/5 hover:bg-white/10 text-white border border-white/10">
                                <Link href="/login">
                                    Return to Login
                                </Link>
                            </Button>
                        </div>
                    </CardContent>
                    <CardFooter className="justify-center border-t border-white/5 py-4">
                        <div className="flex items-center text-xs text-zinc-500">
                            <Lock className="mr-1 h-3 w-3" />
                            Retention Intelligence System
                        </div>
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
}
