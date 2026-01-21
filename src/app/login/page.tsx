'use client';

import { login } from './actions';
import { BarChart3, Mail, ArrowRight, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useActionState, useEffect } from 'react';
import { toast } from "sonner";

const initialState = {
    message: '',
    success: false
};

export default function LoginPage() {
    const [state, formAction, isPending] = useActionState(login, initialState);

    useEffect(() => {
        if (state?.message) {
            if (state.success) {
                toast.success(state.message)
            } else if (state.message !== '') { // Only error if message exists and not success (though initialState has empty message)
                // If we have an error structure, or just use message for both
                // verification: check actions.ts error return
                toast.error(state.message)
            }
        }
    }, [state])

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-[#0a0a0a] text-white selection:bg-indigo-500/30">
            {/* Background Ambience */}
            <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/20 via-[#0a0a0a] to-[#0a0a0a]" />

            <div className="w-full max-w-md space-y-8 px-4">
                {/* Logo/Header */}
                <div className="flex flex-col items-center text-center">
                    <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-600 shadow-lg shadow-indigo-500/20">
                        <BarChart3 className="h-6 w-6 text-white" />
                    </div>
                    <h2 className="text-3xl font-bold tracking-tight text-white">Welcome back</h2>
                    <p className="mt-2 text-sm text-gray-400">
                        Sign in to access your retention intelligence dashboard
                    </p>
                </div>

                {/* Login Form */}
                <div className="group rounded-2xl border border-white/5 bg-white/[0.02] p-8 -md shadow-2xl transition-all hover:bg-white/[0.04]">
                    <form action={formAction} className="space-y-6">
                        <div>
                            <label htmlFor="email" className="block text-xs font-medium uppercase tracking-wider text-gray-400">
                                Email Address
                            </label>
                            <div className="mt-2 relative">
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    required
                                    placeholder="name@company.com"
                                    className="block w-full rounded-lg border border-white/10 bg-black/20 px-4 py-3 pl-11 text-sm text-white placeholder-gray-500 transition-colors focus:border-indigo-500 focus:bg-white/[0.02] focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                />
                                <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-500" />
                            </div>
                        </div>

                        {state?.message && (
                            <p className="text-sm text-amber-500 text-center">{state.message}</p>
                        )}

                        <button
                            type="submit"
                            disabled={isPending}
                            className="group relative flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 transition-all hover:bg-indigo-500 hover:scale-[1.02] hover:shadow-indigo-500/30 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-[#0a0a0a] disabled:opacity-50 disabled:pointer-events-none"
                        >
                            {isPending ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <>
                                    <span>Send Magic Link</span>
                                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                                </>
                            )}
                        </button>
                    </form>
                </div>

                {/* Footer */}
                <div className="flex flex-col items-center gap-4 text-center text-xs text-gray-500">
                    <div className="flex items-center gap-2 rounded-full border border-red-500/10 bg-red-500/5 px-3 py-1.5 text-red-500/80 backdrop-blur-sm transition-colors hover:border-red-500/20 hover:bg-red-500/10">
                        <span className="relative flex h-1.5 w-1.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-red-500"></span>
                        </span>
                        <span className="font-medium tracking-wide">AUTHORIZED PERSONNEL ONLY</span>
                    </div>
                    <p>
                        © {new Date().getFullYear()} <span className="font-medium text-gray-400">@League of Developer</span>. All rights reserved.
                    </p>
                </div>
            </div>
        </div>
    );
}
