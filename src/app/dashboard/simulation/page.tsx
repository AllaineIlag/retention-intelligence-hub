import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Loader2, Database, Trash2, ShieldAlert, Cpu, Activity, Heart, GitMerge, Info } from 'lucide-react';
import { useState, useTransition, useMemo } from 'react';
import { seedDatabase, purgeDatabase, SeedConfig } from './actions';

export default function SimulationPage() {
    const [isPending, startTransition] = useTransition();
    const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

    // Simulation Parameters
    const [headcount, setHeadcount] = useState(5000);
    const [attritionRate, setAttritionRate] = useState(2); // Monthly %
    const [volatility, setVolatility] = useState(0.5); // ±%
    const [sentimentScore, setSentimentScore] = useState(65); // 0-100
    const [completedRatio, setCompletedRatio] = useState(85);
    const [cancelledRatio, setCancelledRatio] = useState(5);

    // Computed Values
    const projection = useMemo(() => {
        const baseExitsPerMonth = headcount * (attritionRate / 100);
        const totalExits = Math.round(baseExitsPerMonth * 12);
        const completed = Math.round(totalExits * (completedRatio / 100));
        const cancelled = Math.round(totalExits * (cancelledRatio / 100));
        const active = totalExits - completed - cancelled;

        return { totalExits, completed, cancelled, active };
    }, [headcount, attritionRate, completedRatio, cancelledRatio]);

    const handleSeed = () => {
        const config: SeedConfig = {
            headcount,
            attritionRate,
            volatility,
            sentimentScore,
            ratios: {
                completed: completedRatio,
                cancelled: cancelledRatio
            }
        };

        if (!confirm(`Tactic: OMEGA-SEED\n\nProjected: ${projection.totalExits} records\nVolatility: ±${volatility}%\nSentiment: ${sentimentScore}%\n\nCommence Simulation?`)) return;

        startTransition(async () => {
            const res = await seedDatabase(config);
            setResult(res);
        });
    };

    const handlePurge = () => {
        if (!confirm('PROTOCOL: DARK-RESET\nAll simulated records will be annihilated. Continue?')) return;

        startTransition(async () => {
            const res = await purgeDatabase();
            setResult(res);
        });
    };

    return (
        <div className="flex min-h-screen flex-col items-center bg-[#050505] p-8 text-white">
            <div className="w-full max-w-4xl space-y-8 pt-12">
                <div className="text-center space-y-2">
                    <h1 className="text-4xl font-black tracking-tighter text-red-600 uppercase italic">
                        The Simulation Chamber
                    </h1>
                    <p className="text-zinc-500 font-mono text-sm">LEVEL 4 CLEARANCE REQUIRED • HUB CORE V3</p>
                </div>

                <div className="grid gap-6 md:grid-cols-12">
                    {/* Left: Configuration */}
                    <Card className="md:col-span-8 border-zinc-800 bg-zinc-900/40 backdrop-blur-xl">
                        <CardHeader className="border-b border-zinc-800/50">
                            <CardTitle className="flex items-center gap-2 text-zinc-100">
                                <Cpu className="h-5 w-5 text-red-500" />
                                Tactical Configuration
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-8 pt-6">
                            {/* Headcount & Attrition (Anchors) */}
                            <div className="grid grid-cols-2 gap-8">
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <Label className="text-zinc-400">Company Headcount</Label>
                                        <span className="text-zinc-100 font-mono">{headcount.toLocaleString()}</span>
                                    </div>
                                    <Slider
                                        value={[headcount]}
                                        onValueChange={([v]) => setHeadcount(v)}
                                        max={10000}
                                        min={500}
                                        step={500}
                                        className="py-4"
                                    />
                                </div>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <Label className="text-zinc-400">Target Attrition (Mo)</Label>
                                        <span className="text-zinc-100 font-mono">{attritionRate}%</span>
                                    </div>
                                    <Slider
                                        value={[attritionRate]}
                                        onValueChange={([v]) => setAttritionRate(v)}
                                        max={10}
                                        min={0.5}
                                        step={0.5}
                                        className="py-4"
                                    />
                                </div>
                            </div>

                            {/* Volatility & Sentiment */}
                            <div className="grid grid-cols-2 gap-8">
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center gap-2">
                                            <Label className="text-zinc-400">Monthly Volatility</Label>
                                            <Info className="h-3 w-3 text-zinc-600" />
                                        </div>
                                        <span className="text-red-400 font-mono">±{volatility}%</span>
                                    </div>
                                    <Slider
                                        value={[volatility]}
                                        onValueChange={([v]) => setVolatility(v)}
                                        max={5}
                                        min={0}
                                        step={0.1}
                                        className="py-4"
                                    />
                                </div>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center gap-2">
                                            <Label className="text-zinc-400">Sentiment Bias</Label>
                                            <Heart className="h-3 w-3 text-emerald-500" />
                                        </div>
                                        <span className="text-emerald-400 font-mono">{sentimentScore}%</span>
                                    </div>
                                    <Slider
                                        value={[sentimentScore]}
                                        onValueChange={([v]) => setSentimentScore(v)}
                                        max={100}
                                        min={0}
                                        step={5}
                                        className="py-4"
                                    />
                                </div>
                            </div>

                            {/* Pipeline Split */}
                            <div className="space-y-6 pt-4 border-t border-zinc-800/50">
                                <Label className="text-xs uppercase tracking-widest text-zinc-500">Pipeline Distribution</Label>
                                <div className="grid grid-cols-3 gap-6">
                                    <div className="space-y-2">
                                        <Label className="text-zinc-500 text-[10px] uppercase">Completed (Bulk)</Label>
                                        <Slider
                                            value={[completedRatio]}
                                            onValueChange={([v]) => setCompletedRatio(v)}
                                            max={95} min={50} step={1}
                                        />
                                        <div className="text-right text-xs font-mono">{completedRatio}%</div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-zinc-500 text-[10px] uppercase">Cancelled (Small)</Label>
                                        <Slider
                                            value={[cancelledRatio]}
                                            onValueChange={([v]) => setCancelledRatio(v)}
                                            max={20} min={1} step={1}
                                        />
                                        <div className="text-right text-xs font-mono">{cancelledRatio}%</div>
                                    </div>
                                    <div className="flex flex-col justify-end text-right">
                                        <Label className="text-zinc-500 text-[10px] uppercase">Active Pipeline</Label>
                                        <div className="text-xl font-black text-amber-500 font-mono">
                                            {100 - completedRatio - cancelledRatio}%
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Right: Projection & Execution */}
                    <div className="md:col-span-4 space-y-6">
                        <Card className="border-red-900/30 bg-red-950/10 backdrop-blur-xl">
                            <CardHeader>
                                <CardTitle className="text-sm uppercase tracking-tighter text-red-400">Projection Output</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex justify-between items-end">
                                    <span className="text-zinc-500 text-xs">Total Simulated Records</span>
                                    <span className="text-3xl font-bold text-white leading-none">~{projection.totalExits}</span>
                                </div>
                                <div className="space-y-2 pt-4">
                                    <div className="flex justify-between text-xs">
                                        <span className="text-zinc-400 italic">Completed Interviews</span>
                                        <span className="text-zinc-100 font-mono">{projection.completed}</span>
                                    </div>
                                    <div className="flex justify-between text-xs">
                                        <span className="text-zinc-400 italic">Declined/Cancelled</span>
                                        <span className="text-zinc-100 font-mono">{projection.cancelled}</span>
                                    </div>
                                    <div className="flex justify-between text-xs">
                                        <span className="text-zinc-400 italic">Active Notice Period</span>
                                        <span className="text-zinc-100 font-mono">{projection.active}</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <div className="space-y-3">
                            <Button
                                onClick={handleSeed}
                                disabled={isPending}
                                className="w-full h-16 bg-red-600 hover:bg-red-700 text-white font-black uppercase tracking-widest gap-2"
                            >
                                {isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Database className="h-5 w-5" />}
                                Initiate Seed
                            </Button>

                            <Button
                                onClick={handlePurge}
                                disabled={isPending}
                                className="w-full h-12 variant-outline border-zinc-800 bg-transparent hover:bg-red-950/30 text-zinc-500 hover:text-red-400 gap-2 transition-colors"
                            >
                                <Trash2 className="h-4 w-4" />
                                Wipe Chamber
                            </Button>
                        </div>

                        {result && (
                            <Alert variant={result.success ? "default" : "destructive"}
                                className={`animate-in fade-in slide-in-from-top-4 border-none ${result.success ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                                <AlertTitle className="text-[10px] uppercase font-bold tracking-widest">{result.success ? 'Success' : 'Fatal Error'}</AlertTitle>
                                <AlertDescription className="text-xs">{result.message}</AlertDescription>
                            </Alert>
                        )}
                    </div>
                </div>

                <div className="flex items-center justify-center gap-6 text-[10px] text-zinc-700 font-mono uppercase tracking-[0.3em] pt-8">
                    <span>STATUS: ACTIVE</span>
                    <span className="h-1 w-1 rounded-full bg-zinc-800" />
                    <span>ENCRYPTION: AES-256</span>
                    <span className="h-1 w-1 rounded-full bg-zinc-800" />
                    <span>ID: SWAIN-PRO-SIM-01</span>
                </div>
            </div>
        </div>
    );
}

