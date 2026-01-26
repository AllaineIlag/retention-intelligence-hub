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
        <div className="flex h-[calc(100vh-100px)] gap-6">
            {/* LEFT: Question List (Sidebar) */}
            <div className="w-1/3 bg-white rounded-xl shadow-sm border border-slate-100 flex flex-col overflow-hidden">
                <div className="p-4 border-b border-slate-100 bg-slate-50/50">
                    <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                        <MessageSquare className="w-4 h-4 text-indigo-500" />
                        Interview Topics
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">Select a topic to review/correct.</p>
                </div>

                <div className="flex-1 overflow-y-auto">
                    <div className="p-3 space-y-2">
                        {responses.map((response, index) => (
                            <button
                                key={response.id}
                                onClick={() => setSelectedResponseId(response.id)}
                                className={`w-full text-left p-3 rounded-lg text-sm transition-all border ${selectedResponseId === response.id
                                    ? 'bg-indigo-50 border-indigo-200 shadow-sm'
                                    : 'bg-white border-transparent hover:bg-slate-50 hover:border-slate-200'
                                    }`}
                            >
                                <div className="flex justify-between items-start mb-1">
                                    <span className={`font-medium ${selectedResponseId === response.id ? 'text-indigo-900' : 'text-slate-700'}`}>
                                        Q{index + 1}
                                    </span>
                                    {response.is_corrected && (
                                        <CheckCircle className="w-4 h-4 text-green-500" />
                                    )}
                                </div>
                                <p className={`line-clamp-2 text-xs ${selectedResponseId === response.id ? 'text-indigo-700' : 'text-slate-500'}`}>
                                    {response.question?.text}
                                </p>
                            </button>
                        ))}
                    </div>
                </div>

                <div className="p-4 border-t border-slate-100 bg-slate-50">
                    <Button
                        className="w-full bg-slate-900 hover:bg-black text-white"
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
