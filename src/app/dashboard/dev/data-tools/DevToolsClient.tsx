'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import { seedData, clearData, SeedConfig } from '@/app/actions/dev-tools';
import Link from 'next/link';
import { Loader2, Trash2, Database, AlertCircle, CheckCircle2, Cpu, Clock, Terminal, ChevronRight } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function DevToolsClient() {
    const [status, setStatus] = useState<'success' | 'error' | null>(null);
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [logs, setLogs] = useState<string[]>([]);
    const logsEndRef = useRef<HTMLDivElement>(null);

    // Simulation Parameters
    const [headcount] = useState(5000); // Fixed
    const [attritionRate] = useState(2); // Fixed Monthly %
    const [timeSpan, setTimeSpan] = useState(12); // Months back
    const [volatility, setVolatility] = useState(0.5); // ±%
    const [sentimentScore, setSentimentScore] = useState(65); // 0-100
    const [completedRatio, setCompletedRatio] = useState(85);
    const [cancelledRatio, setCancelledRatio] = useState(5);

    // Computed Values
    const projection = useMemo(() => {
        const baseExitsPerMonth = headcount * (attritionRate / 100);
        const totalExits = Math.round(baseExitsPerMonth * timeSpan); // Use timeSpan
        const completed = Math.round(totalExits * (completedRatio / 100));
        const cancelled = Math.round(totalExits * (cancelledRatio / 100));
        const active = totalExits - completed - cancelled;

        return { totalExits, completed, cancelled, active };
    }, [headcount, attritionRate, timeSpan, completedRatio, cancelledRatio]);

    // Auto-scroll logs
    useEffect(() => {
        if (logsEndRef.current) {
            logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [logs]);

    const addLog = (text: string) => {
        setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${text}`]);
    };

    const handleSeed = async () => {
        const config: SeedConfig = {
            headcount,
            attritionRate,
            volatility,
            sentimentScore,
            monthsBack: timeSpan,
            ratios: {
                completed: completedRatio,
                cancelled: cancelledRatio
            }
        };

        if (!confirm(`TACTICAL SEED INITIATED\n\nTime Span: ${timeSpan} Months\nProjected: ~${projection.totalExits} records\nVolatility: ±${volatility}%\nSentiment: ${sentimentScore}%\n\nContinue?`)) return;

        setLoading(true);
        setStatus(null);
        setLogs([]);
        setMessage('');

        // Simulation Logs
        addLog('Initialising Tactical Seeding Protocol...');
        await new Promise(r => setTimeout(r, 600));
        addLog(`Analyzing Time Span: ${timeSpan} Months...`);
        await new Promise(r => setTimeout(r, 600));
        addLog(`Generating ${projection.totalExits} synthetic personnel records...`);
        addLog(`Applying Volatility Matrix (±${volatility}%)...`);
        await new Promise(r => setTimeout(r, 800));
        addLog('Injecting Sentiment Bias...');
        addLog('Writing to Secure Database Sectors...');

        try {
            const result = await seedData(config);
            if (result.success) {
                setStatus('success');
                addLog('SUCCESS: Data Injection Complete.');
                setMessage(`Successfully seeded ~${projection.totalExits} records across a ${timeSpan}-month timeline.`);
            } else {
                setStatus('error');
                addLog(`ERROR: ${result.error}`);
                setMessage('Protocol error: ' + result.error);
            }
        } catch (err) {
            setStatus('error');
            addLog('CRITICAL FAILURE: System Exception.');
            setMessage('An unexpected system failure occurred.');
        } finally {
            setLoading(false);
        }
    };

    const handleClear = async () => {
        if (!confirm('PROTOCOL: DARK-RESET\nAll simulated records will be annihilated. Continue?')) return;

        setMessage('');
        setStatus(null);
        setLoading(true);
        setLogs([]);

        addLog('Initiating Dark-Reset Protocol...');
        await new Promise(r => setTimeout(r, 500));
        addLog('Scanning for Synthetic Signatures (@sim.retention.com)...');
        await new Promise(r => setTimeout(r, 700));
        addLog('Identifying Dependent Intelligence Records...');
        addLog('Preparing Cascade Deletion Sequence...');
        await new Promise(r => setTimeout(r, 600));
        addLog('Executing Purge...');

        try {
            const result = await clearData();
            if (result.success) {
                setStatus('success');
                addLog('SUCCESS: Sectors Sanitized.');
                const countMsg = result.count ? ` (${result.count} targets neutralized)` : '';
                setMessage('Protocol Scouring successful. Sectors cleared.' + countMsg);
            } else {
                setStatus('error');
                addLog(`FAILURE: ${result.error}`);
                setMessage('Scouring failure: ' + result.error);
            }
        } catch (err) {
            setStatus('error');
            addLog('CRITICAL FAILURE: System Exception.');
            setMessage('An unexpected error occurred during purging.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex h-full w-full items-center justify-center bg-[#050505] text-white overflow-hidden p-4 relative">

            {/* Terminal Overlay */}
            {loading && (
                <div className="absolute inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-8 animate-in fade-in duration-300">
                    <div className="w-full max-w-2xl bg-[#0c0c0c] border border-green-900/50 rounded-lg shadow-2xl p-6 font-mono text-sm relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-green-500/50 to-transparent opacity-50"></div>
                        <div className="flex items-center gap-2 mb-4 border-b border-green-900/30 pb-2">
                            <Terminal className="w-4 h-4 text-green-500" />
                            <span className="text-green-600 uppercase tracking-widest text-xs">Tactical Command // Execution Log</span>
                        </div>
                        <div className="space-y-2 h-64 overflow-y-auto w-full custom-scrollbar">
                            {logs.map((log, i) => (
                                <div key={i} className="text-green-400/90 flex gap-2">
                                    <span className="opacity-50 select-none">{'>'}</span>
                                    <span>{log}</span>
                                </div>
                            ))}
                            <div className="animate-pulse text-green-500">_</div>
                            <div ref={logsEndRef}></div>
                        </div>
                    </div>
                </div>
            )}

            <div className="w-full max-w-4xl space-y-8">
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="p-3 rounded-xl bg-red-600/10 border border-red-500/20">
                            <Cpu className="w-8 h-8 text-red-500" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-black tracking-tighter uppercase italic text-red-600">
                                Tactical Dev Tools
                            </h1>
                            <p className="text-zinc-500 font-mono text-xs uppercase tracking-widest">
                                High-Fidelity Database Simulation Suite
                            </p>
                        </div>
                    </div>

                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-yellow-500/10 text-yellow-500 text-[10px] font-mono border border-yellow-500/20 uppercase tracking-widest">
                        <AlertCircle className="w-3 h-3" />
                        <span>LEVEL 4 CLEARANCE REQUIRED</span>
                    </div>
                </div>

                <div className="grid gap-6 md:grid-cols-12 p-8 rounded-3xl bg-zinc-900/40 border border-zinc-800 backdrop-blur-xl shadow-2xl">

                    {/* Left: Configuration */}
                    <div className="md:col-span-8 space-y-8 pr-6 md:border-r border-zinc-800/50">
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-bold text-zinc-100 uppercase tracking-tight flex items-center gap-2">
                                    <Database className="w-4 h-4 text-red-500" />
                                    Seeding Configuration
                                </h3>

                                <div className="flex items-center gap-2">
                                    <Clock className="w-3 h-3 text-zinc-500" />
                                    <Select value={timeSpan.toString()} onValueChange={(v) => setTimeSpan(parseInt(v))}>
                                        <SelectTrigger className="w-[140px] h-8 bg-zinc-900 border-zinc-700 text-xs font-mono uppercase">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="3">3 Months</SelectItem>
                                            <SelectItem value="6">6 Months</SelectItem>
                                            <SelectItem value="12">12 Months</SelectItem>
                                            <SelectItem value="24">24 Months</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            {/* Static Anchors Grid */}
                            <div className="grid grid-cols-2 gap-8">
                                <div className="space-y-2 opacity-50 cursor-not-allowed">
                                    <div className="flex justify-between items-center">
                                        <Label className="text-zinc-500 text-xs uppercase tracking-wider">Company Headcount</Label>
                                    </div>
                                    <div className="text-2xl font-mono text-zinc-300">5,000</div>
                                    <div className="text-[10px] text-zinc-600 uppercase tracking-widest">Fixed Anchor</div>
                                </div>
                                <div className="space-y-2 opacity-50 cursor-not-allowed">
                                    <div className="flex justify-between items-center">
                                        <Label className="text-zinc-500 text-xs uppercase tracking-wider">Base Attrition</Label>
                                    </div>
                                    <div className="text-2xl font-mono text-zinc-300">2.0%</div>
                                    <div className="text-[10px] text-zinc-600 uppercase tracking-widest">Monthly Constant</div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-8">
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <Label className="text-zinc-400 text-xs uppercase tracking-wider">Monthly Volatility</Label>
                                        <span className="text-red-400 font-mono text-sm">±{volatility}%</span>
                                    </div>
                                    <Slider value={[volatility]} onValueChange={([v]) => setVolatility(v)} max={5} min={0} step={0.1} />
                                </div>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <Label className="text-zinc-400 text-xs uppercase tracking-wider">Sentiment Bias</Label>
                                        <span className="text-emerald-400 font-mono text-sm">{sentimentScore}%</span>
                                    </div>
                                    <Slider value={[sentimentScore]} onValueChange={([v]) => setSentimentScore(v)} max={100} min={0} step={5} />
                                </div>
                            </div>

                            {/* Pipeline Splits */}
                            <div className="space-y-6 pt-4 border-t border-zinc-800/50">
                                <div className="grid grid-cols-2 gap-8">
                                    <div className="space-y-4">
                                        <Label className="text-zinc-500 text-[10px] uppercase tracking-widest">Completed Ratio</Label>
                                        <Slider value={[completedRatio]} onValueChange={([v]) => setCompletedRatio(v)} max={95} min={50} step={1} />
                                        <div className="text-right text-xs font-mono text-zinc-400">{completedRatio}%</div>
                                    </div>
                                    <div className="space-y-4">
                                        <Label className="text-zinc-500 text-[10px] uppercase tracking-widest">Cancelled Ratio</Label>
                                        <Slider value={[cancelledRatio]} onValueChange={([v]) => setCancelledRatio(v)} max={20} min={1} step={1} />
                                        <div className="text-right text-xs font-mono text-zinc-400">{cancelledRatio}%</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right: Summary & Actions */}
                    <div className="md:col-span-4 space-y-6 flex flex-col justify-between">
                        <div className="p-4 rounded-2xl bg-red-950/20 border border-red-500/20 space-y-4">
                            <h4 className="text-[10px] uppercase font-black text-red-500 tracking-[0.2em]">Projection Summary</h4>
                            <div className="space-y-3">
                                <div className="flex justify-between items-end">
                                    <span className="text-zinc-500 text-[10px] uppercase">{timeSpan}-Month Exits</span>
                                    <span className="text-xl font-bold text-white leading-none">~{projection.totalExits}</span>
                                </div>
                                <div className="space-y-1.5 pt-2 border-t border-red-500/10">
                                    <div className="flex justify-between text-[10px] font-mono uppercase tracking-tighter">
                                        <span className="text-zinc-500">Completed</span>
                                        <span className="text-red-400">{projection.completed}</span>
                                    </div>
                                    <div className="flex justify-between text-[10px] font-mono uppercase tracking-tighter">
                                        <span className="text-zinc-500">Cancelled</span>
                                        <span className="text-red-400">{projection.cancelled}</span>
                                    </div>
                                    <div className="flex justify-between text-[10px] font-mono uppercase tracking-tighter">
                                        <span className="text-zinc-500">In-Pipeline</span>
                                        <span className="text-red-400">{projection.active}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <button
                                onClick={handleSeed}
                                disabled={loading}
                                className="w-full h-14 bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white rounded-xl font-black uppercase tracking-widest transition-all active:scale-95 flex items-center justify-center gap-2 text-sm shadow-lg shadow-red-900/20"
                            >
                                {loading && status === null ? <Loader2 className="w-5 h-5 animate-spin" /> : <Database className="w-4 h-4" />}
                                {loading && status === null ? 'Generating...' : 'Initiate Seed'}
                            </button>

                            <button
                                onClick={handleClear}
                                disabled={loading}
                                className="w-full h-10 border border-zinc-800 bg-transparent hover:bg-red-500/10 text-zinc-500 hover:text-red-400 disabled:opacity-50 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2"
                            >
                                <Trash2 className="w-3 h-3" />
                                Scour Database
                            </button>
                        </div>
                    </div>

                    {/* Footer Nav */}
                    <div className="md:col-span-12 pt-6 flex justify-center border-t border-zinc-800/50">
                        <Link href="/dashboard" className="text-zinc-600 hover:text-red-500 text-[10px] font-mono uppercase tracking-widest transition-colors flex items-center gap-2">
                            System Interface
                        </Link>
                    </div>
                </div>

                {/* Status Message */}
                {message && !loading && (
                    <div className={`p-4 rounded-xl border backdrop-blur-md animate-in fade-in slide-in-from-bottom-4 flex items-center gap-3 ${status === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' :
                        status === 'error' ? 'bg-red-500/10 border-red-500/20 text-red-400' :
                            'bg-zinc-800/50 border-zinc-700 text-zinc-400'
                        }`}>
                        {status === 'success' ? <CheckCircle2 className="w-4 h-4" /> : status === 'error' ? <AlertCircle className="w-4 h-4" /> : <Loader2 className="w-4 h-4 animate-spin" />}
                        <p className="text-xs font-mono uppercase tracking-tight">{message}</p>
                    </div>
                )}
            </div>
        </div>
    );
}
