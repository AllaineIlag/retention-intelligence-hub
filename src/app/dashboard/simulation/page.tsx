'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, Database, Trash2, ShieldAlert } from 'lucide-react';
import { useState, useTransition } from 'react';
import { seedDatabase, purgeDatabase } from './actions';

export default function SimulationPage() {
    const [isPending, startTransition] = useTransition();
    const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

    const handleSeed = () => {
        if (!confirm('WARNING: This will insert 1,200 fake records into the database. Proceed?')) return;

        startTransition(async () => {
            const res = await seedDatabase();
            setResult(res);
        });
    };

    const handlePurge = () => {
        if (!confirm('WARNING: This will DELETE ALL simulated records. This cannot be undone. Proceed?')) return;

        startTransition(async () => {
            const res = await purgeDatabase();
            setResult(res);
        });
    };

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-[#0a0a0a] p-8 text-white">
            <div className="w-full max-w-2xl space-y-8">
                <div className="text-center space-y-2">
                    <h1 className="text-3xl font-bold tracking-tight text-red-500">Simulation Control</h1>
                    <p className="text-zinc-400">Restricted Access: Simulation & Stress Testing Module</p>
                </div>

                <Card className="border-red-900/30 bg-red-950/10 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-red-400">
                            <ShieldAlert className="h-5 w-5" />
                            Danger Zone
                        </CardTitle>
                        <CardDescription className="text-red-300/70">
                            These actions directly modify the database. Simulated data is tagged with
                            <code className="mx-1 rounded bg-black/50 px-1 py-0.5 text-xs text-red-200">@sim.retention.com</code>
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {result && (
                            <Alert variant={result.success ? "default" : "destructive"}
                                className={`border-none ${result.success ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                                <AlertTitle>{result.success ? 'Success' : 'Error'}</AlertTitle>
                                <AlertDescription>{result.message}</AlertDescription>
                            </Alert>
                        )}

                        <div className="grid gap-4 md:grid-cols-2">
                            <Button
                                onClick={handleSeed}
                                disabled={isPending}
                                className="h-32 flex-col gap-4 border-2 border-emerald-500/20 bg-emerald-500/10 hover:bg-emerald-500/20 hover:border-emerald-500/40 text-emerald-400 transition-all"
                            >
                                {isPending ? <Loader2 className="h-8 w-8 animate-spin" /> : <Database className="h-8 w-8" />}
                                <div className="space-y-1">
                                    <div className="font-bold">Seed Database</div>
                                    <div className="text-xs opacity-70">Generate 1,200 Records</div>
                                </div>
                            </Button>

                            <Button
                                onClick={handlePurge}
                                disabled={isPending}
                                className="h-32 flex-col gap-4 border-2 border-red-500/20 bg-red-500/10 hover:bg-red-500/20 hover:border-red-500/40 text-red-400 transition-all"
                            >
                                {isPending ? <Loader2 className="h-8 w-8 animate-spin" /> : <Trash2 className="h-8 w-8" />}
                                <div className="space-y-1">
                                    <div className="font-bold">Purge Data</div>
                                    <div className="text-xs opacity-70">Delete Simulated Records</div>
                                </div>
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                <div className="text-center text-xs text-zinc-600">
                    AUTHORIZED PERSONNEL ONLY • ID: SWAIN-PRO-SIM-01
                </div>
            </div>
        </div>
    );
}
