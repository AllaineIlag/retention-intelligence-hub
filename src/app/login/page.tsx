'use client';

import { Suspense, useActionState, useEffect, useState, useTransition } from 'react';
import { loginWithPassword, sendOtp, verifyOtp } from './actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { AlertCircle, CheckCircle2, Loader2, ArrowRight, Lock } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useRouter, useSearchParams } from 'next/navigation';
import {
    InputOTP,
    InputOTPGroup,
    InputOTPSlot,
} from '@/components/ui/input-otp';

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
    const [otpState, otpAction, isOtpPending] = useActionState(sendOtp, initialState);
    const [passwordState, passwordAction, isPasswordPending] = useActionState(loginWithPassword, initialState);

    const [step, setStep] = useState<'email' | 'otp'>('email');
    const [loginMethod, setLoginMethod] = useState<'otp' | 'password'>('otp');
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');

    const [isVerifying, startVerify] = useTransition();
    const router = useRouter();
    const searchParams = useSearchParams();

    // Handle initial state message from URL
    const [urlMessage, setUrlMessage] = useState('');

    useEffect(() => {
        const msg = searchParams.get('message');
        if (msg) setUrlMessage(msg);
    }, [searchParams]);

    // When sendOtp succeeds, move to OTP step
    useEffect(() => {
        if (otpState.success && step === 'email') {
            setStep('otp');
        }
    }, [otpState, step]);

    // Handle Password Login Success
    useEffect(() => {
        if (passwordState.success && passwordState.redirectUrl) {
            router.push(passwordState.redirectUrl);
        }
    }, [passwordState, router]);


    const handleVerify = () => {
        if (!otp || otp.length !== 6) return;

        startVerify(async () => {
            const result = await verifyOtp(email, otp);
            if (result.success && result.redirectUrl) {
                router.push(result.redirectUrl);
            } else {
                setUrlMessage(result.message || 'Verification failed');
            }
        });
    };

    return (
        <Card className="w-full max-w-md border-white/10 bg-[#0f0f11]/80 backdrop-blur-xl shadow-2xl relative z-10">
            <CardHeader className="space-y-3 text-center">
                <div className="flex justify-center">
                    <div className="rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 p-4 ring-1 ring-white/10">
                        <Lock className="h-8 w-8 text-indigo-400" />
                    </div>
                </div>
                <CardTitle className="2xl font-bold tracking-tight text-white">
                    {step === 'email' ? 'Welcome Back' : 'Enter One-Time Password'}
                </CardTitle>
                <CardDescription className="text-zinc-400">
                    {step === 'email'
                        ? 'Sign in to access the Retention Intelligence Hub'
                        : `We sent a code to ${email}`}
                </CardDescription>
            </CardHeader>
            <CardContent>
                {step === 'email' ? (
                    <div className="space-y-4">
                        {/* Toggle Method */}
                        <div className="flex justify-center space-x-4 text-sm mb-2">
                            <button
                                type="button"
                                onClick={() => setLoginMethod('otp')}
                                className={`pb-1 border-b-2 transition-colors ${loginMethod === 'otp' ? 'border-indigo-500 text-white' : 'border-transparent text-zinc-500 hover:text-zinc-300'}`}
                            >
                                Send Code
                            </button>
                            <button
                                type="button"
                                onClick={() => setLoginMethod('password')}
                                className={`pb-1 border-b-2 transition-colors ${loginMethod === 'password' ? 'border-indigo-500 text-white' : 'border-transparent text-zinc-500 hover:text-zinc-300'}`}
                            >
                                Password
                            </button>
                        </div>

                        <form action={loginMethod === 'otp' ? otpAction : passwordAction} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-zinc-300">Email Address</Label>
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    placeholder="name@company.com"
                                    required
                                    className="border-white/10 bg-white/5 text-white placeholder:text-zinc-500 focus:border-indigo-500/50 focus:ring-indigo-500/20"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>

                            {loginMethod === 'password' && (
                                <div className="space-y-2">
                                    <Label htmlFor="password" className="text-zinc-300">Password</Label>
                                    <Input
                                        id="password"
                                        name="password"
                                        type="password"
                                        placeholder="••••••••"
                                        required
                                        className="border-white/10 bg-white/5 text-white placeholder:text-zinc-500 focus:border-indigo-500/50 focus:ring-indigo-500/20"
                                    />
                                </div>
                            )}

                            {/* Error/Success Alerts */}
                            {(otpState.message || passwordState.message || urlMessage) && (
                                <Alert variant={(otpState.success || passwordState.success) ? 'default' : 'destructive'}
                                    className={`border-none ${(otpState.success || passwordState.success) ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                                    {(otpState.success || passwordState.success) ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                                    <AlertTitle>{(otpState.success || passwordState.success) ? 'Success' : 'Error'}</AlertTitle>
                                    <AlertDescription>
                                        {otpState.message || passwordState.message || urlMessage}
                                    </AlertDescription>
                                </Alert>
                            )}


                            <Button
                                type="submit"
                                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium h-10 transition-all"
                                disabled={isOtpPending || isPasswordPending}
                            >
                                {(isOtpPending || isPasswordPending) ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        {loginMethod === 'otp' ? 'Sending Code...' : 'Signing In...'}
                                    </>
                                ) : (
                                    <>
                                        {loginMethod === 'otp' ? 'Send Code' : 'Sign In'}
                                        <ArrowRight className="ml-2 h-4 w-4" />
                                    </>
                                )}
                            </Button>
                        </form>
                    </div>
                ) : (
                    <div className="space-y-6">
                        <div className="flex justify-center">
                            <InputOTP
                                maxLength={6}
                                value={otp}
                                onChange={(value) => setOtp(value)}
                            >
                                <InputOTPGroup className="gap-2">
                                    <InputOTPSlot index={0} className="h-12 w-10 border-white/10 bg-white/5 text-white text-lg rounded-md" />
                                    <InputOTPSlot index={1} className="h-12 w-10 border-white/10 bg-white/5 text-white text-lg rounded-md" />
                                    <InputOTPSlot index={2} className="h-12 w-10 border-white/10 bg-white/5 text-white text-lg rounded-md" />
                                    <InputOTPSlot index={3} className="h-12 w-10 border-white/10 bg-white/5 text-white text-lg rounded-md" />
                                    <InputOTPSlot index={4} className="h-12 w-10 border-white/10 bg-white/5 text-white text-lg rounded-md" />
                                    <InputOTPSlot index={5} className="h-12 w-10 border-white/10 bg-white/5 text-white text-lg rounded-md" />
                                </InputOTPGroup>
                            </InputOTP>
                        </div>

                        {urlMessage && (
                            <Alert variant="destructive" className="bg-red-500/10 text-red-400 border-none">
                                <AlertCircle className="h-4 w-4" />
                                <AlertDescription>{urlMessage}</AlertDescription>
                            </Alert>
                        )}

                        <Button
                            onClick={handleVerify}
                            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white h-10"
                            disabled={isVerifying || otp.length < 6}
                        >
                            {isVerifying ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Verifying...
                                </>
                            ) : (
                                'Verify Code'
                            )}
                        </Button>

                        <div className="text-center">
                            <button
                                onClick={() => { setStep('email'); setUrlMessage(''); }}
                                className="text-xs text-zinc-500 hover:text-white transition-colors"
                            >
                                Wrong email? Go back
                            </button>
                        </div>
                    </div>
                )}
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
