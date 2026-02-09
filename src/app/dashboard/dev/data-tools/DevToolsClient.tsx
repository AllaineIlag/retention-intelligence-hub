'use client';

import { useState } from 'react';
import { seedData, clearData } from '@/app/actions/dev-tools';
import Link from 'next/link';
import { Loader2, Trash2, Database, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function DevToolsClient() {
    const [status, setStatus] = useState<'success' | 'error' | null>(null);
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [monthsBack, setMonthsBack] = useState(3); // Default 3 months

    const handleSeed = async () => {
        setLoading(true);
        setStatus(null);
        setMessage('Seeding data... this may take a moment.');

        try {
            const result = await seedData(monthsBack);
            if (result.success) {
                setStatus('success');
                setMessage(`Successfully seeded profiles, resignations, and interviews for the past ${monthsBack} months!`);
            } else {
                setStatus('error');
                setMessage('Error seeding data: ' + result.error);
            }
        } catch (err) {
            setStatus('error');
            setMessage('An unexpected error occurred.');
        } finally {
            setLoading(false);
        }
    };

    const handleClear = () => {
        if (!confirm('Are you sure you want to delete ALL resignations and interviews? This cannot be undone.')) return;

        setMessage('Clearing data...');
        setStatus(null);
        setLoading(true);

        clearData()
            .then((result) => {
                if (result.success) {
                    setStatus('success');
                    setMessage('Successfully cleared all resignations and interviews.');
                } else {
                    setStatus('error');
                    setMessage('Error clearing data: ' + result.error);
                }
            })
            .catch(() => {
                setStatus('error');
                setMessage('An unexpected error occurred.');
            })
            .finally(() => {
                setLoading(false);
            });
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-black text-white p-4">
            <div className="w-full max-w-2xl space-y-8">
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20">
                            <Database className="w-8 h-8 text-blue-400" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
                                Developer Data Tools
                            </h1>
                            <p className="text-gray-400">
                                Utilities to populate or clear the database for testing.
                            </p>
                        </div>
                    </div>

                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-yellow-500/10 text-yellow-500 text-sm font-mono border border-yellow-500/20">
                        <AlertCircle className="w-4 h-4" />
                        <span>FOR DEVELOPMENT USE ONLY</span>
                    </div>
                </div>

                <div className="grid gap-6 p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl shadow-2xl">

                    {/* Seed Section */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                                <Database className="w-5 h-5 text-blue-400" />
                                Seed Database
                            </h3>
                        </div>

                        <div className="p-6 rounded-2xl bg-white/5 border border-white/5 hover:border-white/10 transition-colors space-y-6">
                            <div className="space-y-1">
                                <p className="text-gray-300">
                                    Generate random resignations (~100/month) linked to existing profiles.
                                </p>
                                <p className="text-sm text-gray-500">
                                    Will auto-generate dummy profiles if fewer than 5000 exist.
                                </p>
                            </div>

                            <div className="flex items-center gap-4">
                                <div className="flex-1">
                                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2 block">Time Range</label>
                                    <select
                                        value={monthsBack}
                                        onChange={(e) => setMonthsBack(Number(e.target.value))}
                                        className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all appearance-none cursor-pointer hover:bg-black/70"
                                    >
                                        <option value={3}>Past 3 Months (Quarter)</option>
                                        <option value={6}>Past 6 Months (Half Year)</option>
                                        <option value={12}>Past 1 Year (Annual)</option>
                                        <option value={24}>Past 2 Years</option>
                                    </select>
                                </div>
                                <div className="flex-none pt-6">
                                    <button
                                        onClick={handleSeed}
                                        disabled={loading}
                                        className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-all shadow-lg shadow-blue-900/20 active:scale-95"
                                    >
                                        {loading && status === null ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
                                        {loading && status === null ? 'Generating...' : 'Seed Data'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="h-px bg-white/10 w-full" />

                    {/* Clear Section */}
                    <div className="space-y-4">
                        <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                            <Trash2 className="w-5 h-5 text-red-400" />
                            Clear Database
                        </h3>

                        <div className="flex items-center justify-between p-6 rounded-2xl bg-red-900/10 border border-red-500/10 hover:border-red-500/20 transition-colors">
                            <div className="space-y-1">
                                <p className="text-red-200">
                                    Remove all resignations, interviews, and responses.
                                </p>
                                <p className="text-sm text-red-400/60">
                                    Does NOT delete user profiles to preserve access.
                                </p>
                            </div>
                            <button
                                onClick={handleClear}
                                disabled={loading}
                                className="px-6 py-3 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg font-medium transition-all active:scale-95"
                            >
                                Clear Data
                            </button>
                        </div>
                    </div>

                    {/* Navigation */}
                    <div className="pt-4 text-center">
                        <Link href="/dashboard" className="text-blue-400 hover:text-blue-300 text-sm hover:underline underline-offset-4 transition-colors">
                            ← Return to Dashboard
                        </Link>
                    </div>
                </div>

                {/* Status Message */}
                {message && (
                    <div className={`flex items-start gap-3 p-4 rounded-xl border backdrop-blur-md animate-in fade-in slide-in-from-bottom-4 ${status === 'success'
                        ? 'bg-green-500/10 border-green-500/20 text-green-400'
                        : status === 'error'
                            ? 'bg-red-500/10 border-red-500/20 text-red-400'
                            : 'bg-blue-500/10 border-blue-500/20 text-blue-400'
                        }`}>
                        {status === 'success' && <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" />}
                        {status === 'error' && <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />}
                        {status === null && <Loader2 className="w-5 h-5 flex-shrink-0 mt-0.5 animate-spin" />}
                        <p className="leading-relaxed">{message}</p>
                    </div>
                )}
            </div>
        </div>
    );
}
