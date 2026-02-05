'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { CorrectionCard } from './CorrectionCard';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

import { CheckCircle, AlertCircle, MessageSquare, ThumbsUp } from 'lucide-react';
import { finalizeInterview } from '@/app/actions/interview-ops';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

interface InterviewSessionProps {
    resignation: any;
    responses: any[];
}

export function InterviewSession({ resignation, responses }: InterviewSessionProps) {
    const router = useRouter();
    const [selectedResponseId, setSelectedResponseId] = useState<string | null>(
        responses.length > 0 ? responses[0].id : null
    );
    const [finishing, setFinishing] = useState(false);

    const selectedResponse = responses.find(r => r.id === selectedResponseId);

    const handleFinalize = async () => {
        if (!confirm('Are you sure you want to finalize this interview? This will lock the record.')) return;

        setFinishing(true);
        const result = await finalizeInterview(resignation.id);

        if (result.error) {
            toast.error('Error', {
                description: result.error
            });
            setFinishing(false);
        } else {
            toast.success('Complete', {
                description: 'Interview finalized successfully.'
            });
            router.push('/dashboard');
        }
    };

    return (
        <div className="flex flex-col lg:flex-row h-full min-h-[calc(100vh-140px)] gap-6">
            {/* LEFT: Question List (Sidebar) */}
            <div className="w-full lg:w-1/3 bg-black/20 rounded-2xl border border-white/5 flex flex-col overflow-hidden backdrop-blur-md shrink-0">
                <div className="p-5 border-b border-white/5 bg-white/[0.02]">
                    <h3 className="font-bold text-white flex items-center gap-2 tracking-tight">
                        <MessageSquare className="w-4 h-4 text-indigo-400" />
                        Interview Topics
                    </h3>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest mt-1 opacity-60">Select topic to review</p>
                </div>

                <div className="flex-1 overflow-y-auto">
                    <div className="p-3 space-y-2">
                        {responses.map((response, index) => (
                            <button
                                key={response.id}
                                onClick={() => setSelectedResponseId(response.id)}
                                className={`w-full text-left p-4 rounded-xl text-sm transition-all border relative overflow-hidden group ${selectedResponseId === response.id
                                    ? 'bg-indigo-500/10 border-indigo-500/30'
                                    : 'bg-transparent border-transparent hover:bg-white/5'
                                    }`}
                            >
                                <div className="flex justify-between items-start mb-1">
                                    <span className={`font-bold tracking-tight ${selectedResponseId === response.id ? 'text-indigo-400' : 'text-gray-400'}`}>
                                        STEP {index + 1}
                                    </span>
                                    {response.is_corrected ? (
                                        <CheckCircle className="w-4 h-4 text-emerald-400" />
                                    ) : (
                                        <div className="w-1 h-1 rounded-full bg-white/20 mt-2" />
                                    )}
                                </div>
                                <p className={`line-clamp-1 text-xs leading-relaxed ${selectedResponseId === response.id ? 'text-indigo-200/70' : 'text-muted-foreground/60'}`}>
                                    {response.question?.text}
                                </p>
                                {selectedResponseId === response.id && (
                                    <motion.div
                                        layoutId="active-pill"
                                        className="absolute left-0 top-1/2 -translate-y-1/2 h-8 w-1 rounded-r-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.6)]"
                                    />
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="p-5 border-t border-white/5 bg-white/[0.01]">
                    <Button
                        className="w-full bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/20 font-bold"
                        onClick={handleFinalize}
                        disabled={finishing}
                    >
                        {finishing ? 'Finalizing...' : <><ThumbsUp className="w-4 h-4 mr-2" /> Finalize & Seal Case</>}
                    </Button>
                </div>
            </div>

            {/* RIGHT: Active Correction Card */}
            <div className="flex-1 flex flex-col">
                {selectedResponse ? (
                    <motion.div
                        key={selectedResponse.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.2 }}
                        className="flex-1"
                    >
                        <CorrectionCard
                            response={selectedResponse}
                            onSave={() => router.refresh()} // Refresh to update sidebar badges
                        />
                    </motion.div>
                ) : (
                    <div className="flex-1 flex items-center justify-center text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                        <p className="flex items-center gap-2">
                            <AlertCircle className="w-5 h-5" />
                            Select a question to begin
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
