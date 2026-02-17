'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { CorrectionCard } from './CorrectionCard';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { format, parseISO } from 'date-fns';

import {
    CheckCircle,
    AlertCircle,
    MessageSquare,
    ThumbsUp,
    User,
    ClipboardList,
    Briefcase,
    Calendar,
    MapPin,
    Shield
} from 'lucide-react';
import { finalizeInterview } from '@/app/actions/interview-ops';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

interface InterviewSessionProps {
    resignation: any;
    responses: any[];
    verifiedResults: any[];
}

export function InterviewSession({ resignation, responses, verifiedResults }: InterviewSessionProps) {
    const router = useRouter();
    const [selectedResponseId, setSelectedResponseId] = useState<string | null>(
        responses.length > 0 ? responses[0].id : null
    );
    const [finishing, setFinishing] = useState(false);

    const selectedResponse = responses.find(r => r.id === selectedResponseId);
    const selectedIndex = responses.findIndex(r => r.id === selectedResponseId);
    const isLastQuestion = selectedIndex === responses.length - 1;

    // Employee details from the resignation join
    const employee = (resignation as any).employee_details || {};

    const handleFinalize = async () => {
        if (!confirm('Are you sure you want to finalize this interview? This will lock the record permanently.')) return;

        setFinishing(true);
        const result = await finalizeInterview(resignation.id);

        if (result.error) {
            toast.error('Error', { description: result.error });
            setFinishing(false);
        } else {
            toast.success('Complete', { description: 'Interview finalized successfully.' });
            router.push('/dashboard');
        }
    };

    // Helper: Get answer preview for sidebar
    const getAnswerPreview = (response: any): string => {
        if (response.response_text) return response.response_text;
        if (response.selected_options?.length > 0) return response.selected_options.join(', ');
        if (response.rating) return `Rating: ${response.rating}`;
        if (response.original_answer) return response.original_answer;
        return '(No answer)';
    };

    // Navigate to next question
    const handleNext = () => {
        if (selectedIndex < responses.length - 1) {
            setSelectedResponseId(responses[selectedIndex + 1].id);
        }
    };

    return (
        <div className="flex flex-col lg:flex-row h-full min-h-[calc(100vh-140px)] gap-6">
            {/* LEFT: Sidebar with Tabs */}
            <div className="w-full lg:w-[380px] bg-black/20 rounded-2xl border border-white/5 flex flex-col overflow-hidden backdrop-blur-md shrink-0">
                <Tabs defaultValue="questionnaire" className="flex flex-col h-full">
                    <div className="p-4 border-b border-white/5 bg-white/[0.02]">
                        <TabsList className="w-full bg-black/30 p-1">
                            <TabsTrigger value="personal" className="flex-1 text-xs font-bold data-[state=active]:bg-indigo-600 data-[state=active]:text-white gap-1.5">
                                <User className="w-3.5 h-3.5" />
                                Personal Info
                            </TabsTrigger>
                            <TabsTrigger value="questionnaire" className="flex-1 text-xs font-bold data-[state=active]:bg-indigo-600 data-[state=active]:text-white gap-1.5">
                                <ClipboardList className="w-3.5 h-3.5" />
                                Questionnaire
                            </TabsTrigger>
                        </TabsList>
                    </div>

                    {/* Personal Info Tab */}
                    <TabsContent value="personal" className="flex-1 overflow-y-auto m-0 p-0">
                        <div className="p-5 space-y-4">
                            <PersonalInfoItem
                                icon={<User className="w-4 h-4 text-indigo-400" />}
                                label="Full Name"
                                value={employee.full_name || 'N/A'}
                            />
                            <PersonalInfoItem
                                icon={<Briefcase className="w-4 h-4 text-cyan-400" />}
                                label="Position"
                                value={employee.current_position || 'N/A'}
                            />
                            <PersonalInfoItem
                                icon={<MapPin className="w-4 h-4 text-amber-400" />}
                                label="Department"
                                value={employee.department || 'N/A'}
                            />
                            <PersonalInfoItem
                                icon={<Shield className="w-4 h-4 text-emerald-400" />}
                                label="Employee Number"
                                value={employee.employee_number || 'N/A'}
                            />
                            <PersonalInfoItem
                                icon={<Calendar className="w-4 h-4 text-purple-400" />}
                                label="Date Hired"
                                value={employee.date_hired ? format(parseISO(employee.date_hired), 'MMMM d, yyyy') : 'N/A'}
                            />
                            <PersonalInfoItem
                                icon={<User className="w-4 h-4 text-rose-400" />}
                                label="Immediate Superior"
                                value={employee.immediate_superior || 'N/A'}
                            />
                            <PersonalInfoItem
                                icon={<Calendar className="w-4 h-4 text-red-400" />}
                                label="Resignation Date"
                                value={employee.resignation_date ? format(parseISO(employee.resignation_date), 'MMMM d, yyyy') : 'N/A'}
                            />
                            {resignation.scheduled_interview_date && (
                                <PersonalInfoItem
                                    icon={<Calendar className="w-4 h-4 text-indigo-400" />}
                                    label="Interview Date"
                                    value={format(parseISO(resignation.scheduled_interview_date), 'MMMM d, yyyy')}
                                />
                            )}
                        </div>
                    </TabsContent>

                    {/* Exit Questionnaires Tab */}
                    <TabsContent value="questionnaire" className="flex-1 overflow-y-auto m-0 p-0">
                        <div className="p-3 space-y-1">
                            {responses.map((response, index) => {
                                const isVerified = verifiedResults.some(v => v.question_key === response.question?.question_key);
                                const isSelected = selectedResponseId === response.id;

                                return (
                                    <button
                                        key={response.id}
                                        onClick={() => setSelectedResponseId(response.id)}
                                        className={`w-full text-left p-3.5 rounded-xl text-sm transition-all border relative overflow-hidden group ${isSelected
                                            ? 'bg-indigo-500/10 border-indigo-500/30'
                                            : 'bg-transparent border-transparent hover:bg-white/5'
                                            }`}
                                    >
                                        <div className="flex justify-between items-start gap-2 mb-1.5">
                                            <span className={`font-semibold text-xs leading-tight line-clamp-2 ${isSelected ? 'text-indigo-300' : 'text-gray-300'}`}>
                                                {response.question?.question_text || `Question ${index + 1}`}
                                            </span>
                                            {isVerified ? (
                                                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                                            ) : (
                                                <div className="w-1.5 h-1.5 rounded-full bg-white/20 shrink-0 mt-1.5" />
                                            )}
                                        </div>
                                        <p className={`line-clamp-1 text-[11px] leading-relaxed ${isSelected ? 'text-indigo-200/50' : 'text-muted-foreground/40'}`}>
                                            {getAnswerPreview(response)}
                                        </p>

                                        {isSelected && (
                                            <motion.div
                                                layoutId="active-pill"
                                                className="absolute left-0 top-1/2 -translate-y-1/2 h-8 w-1 rounded-r-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.6)]"
                                            />
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </TabsContent>
                </Tabs>
            </div>

            {/* RIGHT: Active Correction Card */}
            <div className="flex-1 flex flex-col gap-4">
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
                            verifiedResult={verifiedResults.find(v => v.question_key === selectedResponse.question?.question_key)}
                            resignationId={resignation.id}
                            onSave={() => router.refresh()}
                            onNext={!isLastQuestion ? handleNext : undefined}
                        />
                    </motion.div>
                ) : (
                    <div className="flex-1 flex items-center justify-center text-muted-foreground bg-black/10 rounded-2xl border border-dashed border-white/10">
                        <p className="flex items-center gap-2">
                            <AlertCircle className="w-5 h-5" />
                            Select a question to begin
                        </p>
                    </div>
                )}

                {/* Finalize Button — only visible when viewing the last question */}
                {isLastQuestion && selectedResponse && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="pt-2"
                    >
                        <Button
                            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/20 font-bold py-6 text-base"
                            onClick={handleFinalize}
                            disabled={finishing}
                        >
                            {finishing ? 'Finalizing...' : <><ThumbsUp className="w-5 h-5 mr-2" /> Finalize & Seal Case</>}
                        </Button>
                    </motion.div>
                )}
            </div>
        </div>
    );
}

// --- Sub-components ---

function PersonalInfoItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
    return (
        <div className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-colors">
            <div className="mt-0.5">{icon}</div>
            <div className="min-w-0">
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground/60 font-bold">{label}</p>
                <p className="text-sm text-white font-medium truncate">{value}</p>
            </div>
        </div>
    );
}
