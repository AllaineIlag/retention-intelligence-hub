'use client';

import { login } from './actions';
import { BarChart3, Mail, ArrowRight, Loader2 } from 'lucide-react';
import { useActionState, useEffect } from 'react';
import { toast } from "sonner";
import { motion } from 'framer-motion';

const initialState = {
    message: '',
    success: false
};

const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
};

export default function LoginPage() {
    const [state, formAction, isPending] = useActionState(login, initialState);

    useEffect(() => {
        if (state?.message) {
            if (state.success) {
                toast.success(state.message)
            } else if (state.message !== '') {
                toast.error(state.message)
            }
        }
    }, [state])

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-[#0a0a0a] text-white selection:bg-indigo-500/30">
            {/* Background Ambience */}
            <div className="absolute inset-0 -z-10 overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/20 via-[#0a0a0a] to-[#0a0a0a]" />
                <div className="absolute top-0 left-1/2 -translate-x-1/2 h-[500px] w-[500px] rounded-full bg-indigo-600/10 blur-[100px] animate-pulse" />
            </div>

            <motion.div
                initial="hidden"
                animate="visible"
                variants={fadeInUp}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className="w-full max-w-md space-y-8 px-4"
            >
                {/* Logo/Header */}
                <div className="flex flex-col items-center text-center">
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-600 shadow-lg shadow-indigo-500/30"
                    >
                        <BarChart3 className="h-7 w-7 text-white" />
                    </motion.div>
                    <motion.h2
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="text-3xl font-bold tracking-tight text-white"
                    >
                        Welcome back
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                        className="mt-2 text-sm text-gray-400"
                    >
                        Sign in to access your retention intelligence dashboard
                    </motion.p>
                </div>

                {/* Login Form */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                    className="group rounded-2xl border border-white/5 bg-white/[0.02] p-8 shadow-2xl transition-all hover:bg-white/[0.04] backdrop-blur-sm"
                >
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
                                    className="block w-full rounded-lg border border-white/10 bg-black/20 px-4 py-3 pl-11 text-sm text-white placeholder-gray-500 transition-all focus:border-indigo-500 focus:bg-white/[0.02] focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                />
                                <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-500" />
                            </div>
                        </div>

                        {state?.message && !state.success && (
                            <p className="text-sm text-red-400 text-center">{state.message}</p>
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
                </motion.div>

                {/* Footer */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.6 }}
                    className="flex flex-col items-center gap-4 text-center text-xs text-gray-500"
                >
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
                </motion.div>
            </motion.div>
        </div>
    );
}
