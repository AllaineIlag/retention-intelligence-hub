'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CorrectionCard } from './CorrectionCard';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { format, parseISO } from 'date-fns';

import {
    CheckCircle,
    AlertCircle,
    MessageSquare,
    ThumbsUp,
    Pencil,
    User,
    ClipboardList,
    Briefcase,
    Calendar,
    MapPin,
    Shield
} from 'lucide-react';
import { finalizeInterview, saveVerifiedAnswer } from '@/app/actions/interview-ops';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { DatePicker } from '@/components/date-picker';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';
import {
    getDepartments,
    getPositions,
    getSupervisors,
    getBusinessUnits
} from '@/app/actions/settings-actions';

interface InterviewSessionProps {
    resignation: any;
    responses: any[];
    verifiedResults: any[];
}

// Match the exit form wizard's question sequence
const EXIT_FORM_QUESTION_ORDER = [
    'reason_for_leaving',
    'reason_for_leaving_country',
    'why_more_desirable',
    'why_more_desirable_other',
    'career_growth',
    'rate_of_pay',
    'benefits',
    'benefits_comment',
    'workload',
    'workload_comment',
    'recommendation',
    'recommendation_reason',
];

export function InterviewSession({ resignation, responses: rawResponses, verifiedResults }: InterviewSessionProps) {
    const router = useRouter();

    // Sort responses to match the exit form wizard sequence
    const responses = [...rawResponses].sort((a, b) => {
        const aKey = a.question?.question_key || '';
        const bKey = b.question?.question_key || '';
        const aIndex = EXIT_FORM_QUESTION_ORDER.indexOf(aKey);
        const bIndex = EXIT_FORM_QUESTION_ORDER.indexOf(bKey);
        // Unknown keys go to the end
        return (aIndex === -1 ? 999 : aIndex) - (bIndex === -1 ? 999 : bIndex);
    });

    const [selectedResponseId, setSelectedResponseId] = useState<string | null>(
        responses.length > 0 ? responses[0].id : null
    );
    const [selectedPersonalField, setSelectedPersonalField] = useState<string>('personal_full_name');
    const [activeTab, setActiveTab] = useState('questionnaire');
    const [finishing, setFinishing] = useState(false);
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);

    const selectedResponse = responses.find(r => r.id === selectedResponseId);
    const selectedIndex = responses.findIndex(r => r.id === selectedResponseId);
    const isLastQuestion = selectedIndex === responses.length - 1;

    // Employee details from the company_directory join
    const rawDir = (resignation as any).company_directory;
    const employee = (Array.isArray(rawDir) ? rawDir[0] : rawDir) || {};

    // Auto-advance if the currently selected question becomes skipped due to a verification change
    useEffect(() => {
        if (selectedResponse && isQuestionSkipped(selectedResponse)) {
            handleNext();
        }
    }, [verifiedResults, selectedResponseId]);

    const handleFinalize = async () => {
        setShowConfirmDialog(false);
        setFinishing(true);
        const result = await finalizeInterview(resignation.id);

        if (result.error) {
            toast.error('Error', { description: result.error });
            setFinishing(false);
        } else {
            toast.success('Complete', { description: 'Interview finalized successfully.' });
            router.push('/dashboard/interview/schedule');
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

    // Helper: Determine if a question should be skipped based on verified answers of previous questions
    const isQuestionSkipped = (response: any): boolean => {
        const key = response.question?.question_key;

        // 1. Country Question skip logic
        if (key === 'reason_for_leaving_country') {
            const reasonVerified = verifiedResults.find(v => v.question_key === 'reason_for_leaving');
            if (reasonVerified) {
                const val = reasonVerified.response_value;
                const asArray = Array.isArray(val) ? val : String(val).split(',').map(s => s.trim());
                return !asArray.some(v => v.includes('(Abroad)'));
            }
            // Fallback to original if not verified yet
            const reasonOriginal = rawResponses.find(r => r.question?.question_key === 'reason_for_leaving');
            const originalVal = reasonOriginal?.selected_options || [];
            return !originalVal.some((v: string) => v.includes('(Abroad)'));
        }

        // 2. Desirability "Other" skip logic
        if (key === 'why_more_desirable_other') {
            const whyVerified = verifiedResults.find(v => v.question_key === 'why_more_desirable');
            if (whyVerified) {
                const val = whyVerified.response_value;
                const asArray = Array.isArray(val) ? val : String(val).split(',').map(s => s.trim());
                return !asArray.includes('Other');
            }
            const whyOriginal = rawResponses.find(r => r.question?.question_key === 'why_more_desirable');
            const originalVal = whyOriginal?.selected_options || [];
            return !originalVal.includes('Other');
        }

        return false;
    };

    // Navigate to next question with auto-save and skip check
    const handleNext = async () => {
        let nextIndex = selectedIndex + 1;

        // Skip over questions that are no longer applicable
        while (nextIndex < responses.length) {
            if (!isQuestionSkipped(responses[nextIndex])) {
                break;
            }
            nextIndex++;
        }

        if (nextIndex < responses.length) {
            // Give a tiny moment for any debounced saves to start
            await new Promise(resolve => setTimeout(resolve, 100));
            setSelectedResponseId(responses[nextIndex].id);
        }
    };

    // Helper: Determine question status (confirmed / modified / unreviewed / skipped)
    const getQuestionStatus = (response: any): 'confirmed' | 'modified' | 'unreviewed' | 'skipped' => {
        if (isQuestionSkipped(response)) return 'skipped';

        const questionKey = response.question?.question_key;
        const verified = verifiedResults.find(v => v.question_key === questionKey);

        if (!verified) return 'unreviewed';

        // Get the original answer in a comparable form
        const original = response.selected_options?.length > 0
            ? response.selected_options
            : response.response_text || response.original_answer || '';

        const corrected = verified.response_value;

        // Use normalized comparison
        const origNorm = normalizeForComparison(original);
        const corrNorm = normalizeForComparison(corrected);

        return origNorm === corrNorm ? 'confirmed' : 'modified';
    };

    return (
        <div className="flex flex-col lg:flex-row h-full min-h-[calc(100vh-140px)] gap-6">
            {/* LEFT: Sidebar with Tabs */}
            <div className="w-full lg:w-[380px] bg-card/60 rounded-2xl border border-border flex flex-col overflow-hidden backdrop-blur-md shrink-0">
                <Tabs defaultValue="questionnaire" className="flex flex-col h-full" onValueChange={(v) => setActiveTab(v)}>
                    <div className="p-4 border-b border-border bg-muted/30">
                        <TabsList className="w-full bg-muted/50 p-1">
                            <TabsTrigger value="personal" className="flex-1 text-xs font-bold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground gap-1.5">
                                <User className="w-3.5 h-3.5" />
                                Personal Info
                            </TabsTrigger>
                            <TabsTrigger value="questionnaire" className="flex-1 text-xs font-bold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground gap-1.5">
                                <ClipboardList className="w-3.5 h-3.5" />
                                Questionnaire
                            </TabsTrigger>
                        </TabsList>
                    </div>

                    {/* Personal Info Tab */}
                    <TabsContent value="personal" className="flex-1 overflow-y-auto m-0 p-0">
                        <div className="p-3 space-y-1">
                            {PERSONAL_FIELDS.map((field) => (
                                <PersonalInfoSidebarItem
                                    key={field.key}
                                    field={field}
                                    employee={employee}
                                    resignation={resignation}
                                    verifiedResults={verifiedResults}
                                    isSelected={selectedPersonalField === field.key}
                                    onSelect={() => setSelectedPersonalField(field.key)}
                                />
                            ))}
                        </div>
                    </TabsContent>

                    {/* Exit Questionnaires Tab */}
                    <TabsContent value="questionnaire" className="flex-1 overflow-y-auto m-0 p-0">
                        <div className="p-3 space-y-1">
                            {responses.map((response, index) => {
                                const questionStatus = getQuestionStatus(response);
                                const isSelected = selectedResponseId === response.id;

                                return (
                                    <button
                                        key={response.id}
                                        onClick={() => setSelectedResponseId(response.id)}
                                        disabled={questionStatus === 'skipped'}
                                        className={`w-full text-left p-3.5 rounded-xl text-sm transition-all border relative overflow-hidden group ${isSelected
                                            ? 'bg-primary/10 border-primary/20 shadow-sm'
                                            : questionStatus === 'skipped'
                                                ? 'bg-transparent border-transparent opacity-40 grayscale cursor-not-allowed'
                                                : 'bg-transparent border-transparent hover:bg-muted/50'
                                            }`}
                                    >
                                        <div className="flex justify-between items-start gap-2 mb-1.5">
                                            <span className={`font-semibold text-xs leading-tight line-clamp-2 ${isSelected ? 'text-primary' :
                                                questionStatus === 'skipped' ? 'line-through text-muted-foreground' : 'text-foreground/80'
                                                }`}>
                                                {response.question?.question_text || `Question ${index + 1}`}
                                            </span>
                                            {questionStatus === 'skipped' ? (
                                                <div className="flex items-center gap-1">
                                                    <span className="text-[9px] text-foreground/40 font-bold uppercase tracking-tighter">N/A</span>
                                                </div>
                                            ) : questionStatus === 'modified' ? (
                                                <div className="flex items-center gap-1">
                                                    <Pencil className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                                                    <span className="text-[9px] text-amber-600/60 dark:text-amber-400/60 font-bold uppercase tracking-tighter">Edit</span>
                                                </div>
                                            ) : questionStatus === 'confirmed' ? (
                                                <div className="flex items-center gap-1">
                                                    <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5 shadow-[0_0_8px_rgba(16,185,129,0.2)]" />
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-1">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-foreground/20 shrink-0 mt-1.5 mr-1" />
                                                    <span className="text-[9px] text-foreground/20 font-bold uppercase tracking-tighter">Pending</span>
                                                </div>
                                            )}
                                        </div>
                                        <p className={`line-clamp-1 text-[11px] leading-relaxed ${isSelected ? 'text-primary/60' :
                                            questionStatus === 'skipped' ? 'text-muted-foreground/50' : 'text-muted-foreground'
                                            }`}>
                                            {questionStatus === 'skipped' ? 'Not Required' : getAnswerPreview(response)}
                                        </p>

                                        {isSelected && (
                                            <motion.div
                                                layoutId="active-pill"
                                                className="absolute left-0 top-1/2 -translate-y-1/2 h-8 w-1 rounded-r-full bg-primary shadow-[0_0_8px_hsl(var(--primary)/0.6)]"
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
                {activeTab === 'personal' && (
                    <PersonalInfoCorrectionCard
                        fieldKey={selectedPersonalField}
                        resignationId={resignation.id}
                        resignation={resignation}
                        employee={employee}
                        verifiedResults={verifiedResults}
                    />
                )}

                {activeTab === 'questionnaire' && (selectedResponse ? (
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
                    <div className="flex-1 flex items-center justify-center text-muted-foreground bg-muted/30 rounded-2xl border border-dashed border-border">
                        <p className="flex items-center gap-2 text-sm">
                            <AlertCircle className="w-5 h-5 opacity-50" />
                            Select a question to begin
                        </p>
                    </div>
                ))}

                {/* Finalize Button — only visible when viewing the last question */}
                {isLastQuestion && selectedResponse && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="pt-2"
                    >
                        <Button
                            className="bg-primary hover:bg-primary/90 text-primary-foreground h-11 px-6 rounded-xl shadow-lg shadow-primary/20 transition-all active:scale-[0.98]"
                            onClick={() => setShowConfirmDialog(true)}
                            disabled={finishing}
                        >
                            {finishing ? 'Finalizing...' : <><ThumbsUp className="w-5 h-5 mr-2" /> Finalize & Seal Case</>}
                        </Button>
                    </motion.div>
                )}
            </div>

            {/* Finalize Confirmation Dialog */}
            <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
                <AlertDialogContent className="bg-popover border border-border text-foreground max-w-md">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-lg font-bold text-foreground flex items-center gap-2">
                            <Shield className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                            Finalize & Seal Case
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-muted-foreground text-sm leading-relaxed">
                            This action will <span className="text-amber-600 dark:text-amber-400 font-semibold">permanently lock</span> all verified answers for this interview. No further edits will be possible.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="gap-2">
                        <AlertDialogCancel className="bg-muted hover:bg-accent text-foreground/70 hover:text-foreground border-border">
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleFinalize}
                            className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold"
                        >
                            <ThumbsUp className="w-4 h-4 mr-2" />
                            Yes, Seal It
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}

// --- Sub-components ---

// --- Constants & Config ---

const PERSONAL_FIELDS = [
    { key: 'personal_full_name', label: 'Full Name', icon: <User className="w-4 h-4 text-primary" />, rawKey: 'full_name', type: 'text' },
    { key: 'personal_employee_number', label: 'Employee Number', icon: <Shield className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />, rawKey: 'employee_number', type: 'text' },
    { key: 'personal_business_unit', label: 'Business Unit', icon: <Briefcase className="w-4 h-4 text-orange-600 dark:text-orange-400" />, rawKey: 'business_unit', type: 'business_unit' },
    { key: 'personal_current_position', label: 'Current Position', icon: <Briefcase className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />, rawKey: 'current_position', type: 'position' },
    { key: 'personal_position_hired', label: 'Position When Hired', icon: <Briefcase className="w-4 h-4 text-slate-500" />, rawKey: 'position_when_hired', type: 'position' },
    { key: 'personal_department', label: 'Department', icon: <MapPin className="w-4 h-4 text-amber-600 dark:text-amber-400" />, rawKey: 'department', type: 'department' },
    { key: 'personal_date_hired', label: 'Date Hired', icon: <Calendar className="w-4 h-4 text-purple-600 dark:text-purple-400" />, rawKey: 'date_hired', type: 'date' },
    { key: 'personal_immediate_superior', label: 'Immediate Superior', icon: <User className="w-4 h-4 text-rose-600 dark:text-rose-400" />, rawKey: 'immediate_superior', type: 'supervisor' },
    { key: 'personal_resignation_date', label: 'Resignation Date', icon: <Calendar className="w-4 h-4 text-red-600 dark:text-red-400" />, rawKey: 'resignation_date', type: 'date' },
];


// Helper for robust comparison
function normalizeForComparison(val: any): string {
    if (val === null || val === undefined) return '';
    const asString = Array.isArray(val) ? val.join(',') : String(val);
    return asString
        .split(',')
        .map(s => s.trim())
        .filter(Boolean)
        .sort()
        .join(', ');
}

function parseDateSafe(value: any): Date | undefined {
    if (!value) return undefined;
    // Try parseISO first if it's a string looking like ISO, otherwise new Date
    // Actually new Date() handles ISO fine usually. 
    // We just need to catch Invalid Date.
    const d = new Date(value);
    if (isNaN(d.getTime())) return undefined;
    return d;
}

function formatDisplayValue(value: any, type: string) {
    if (!value) return null;
    if (type === 'date') {
        const d = parseDateSafe(value);
        if (d) {
            try {
                return format(d, 'MMMM d, yyyy');
            } catch (e) {
                return value;
            }
        }
        return value;
    }
    return value;
}

function PersonalInfoSidebarItem({ field, employee, resignation, verifiedResults, isSelected, onSelect }: any) {
    const rawOriginal = employee[field.rawKey];
    const originalDisplay = formatDisplayValue(rawOriginal, field.type) || 'N/A';

    const verified = verifiedResults.find((v: any) => v.question_key === field.key);
    const verifiedRaw = verified?.response_value;
    const verifiedDisplay = formatDisplayValue(verifiedRaw, field.type);

    const normalizedOriginal = normalizeForComparison(rawOriginal);
    const normalizedVerified = normalizeForComparison(verifiedRaw);

    const isModified = verifiedRaw !== undefined && normalizedVerified !== normalizedOriginal;
    const isConfirmed = verifiedRaw !== undefined && normalizedVerified === normalizedOriginal;

    return (
        <button
            onClick={onSelect}
            className={`w-full text-left p-3.5 rounded-xl text-sm transition-all border relative overflow-hidden group ${isSelected
                ? 'bg-primary/10 border-primary/20 shadow-sm'
                : 'bg-transparent border-transparent hover:bg-muted/50'
                }`}
        >
            <div className="flex items-center gap-3">
                <div className="mt-0.5 shrink-0">{field.icon}</div>
                <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                        <p className={`text-[10px] uppercase tracking-widest font-bold ${isSelected ? 'text-primary' : 'text-muted-foreground/60'}`}>
                            {field.label}
                        </p>
                        <div className="flex items-center gap-1">
                            {isModified && <Pencil className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />}
                            {isConfirmed && <CheckCircle className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />}
                        </div>
                    </div>
                    <p className={`text-sm font-medium truncate ${isSelected ? 'text-foreground' : 'text-foreground/80'}`}>
                        {verifiedDisplay ?? originalDisplay}
                    </p>
                </div>
            </div>
            {isSelected && (
                <motion.div
                    layoutId="active-pill-personal"
                    className="absolute left-0 top-1/2 -translate-y-1/2 h-8 w-1 rounded-r-full bg-primary shadow-[0_0_8px_hsl(var(--primary)/0.6)]"
                />
            )}
        </button>
    );
}

function PersonalInfoCorrectionCard({ fieldKey, resignationId, employee, verifiedResults }: any) {
    const router = useRouter();
    const field = PERSONAL_FIELDS.find(f => f.key === fieldKey);
    if (!field) return null;

    const rawOriginal = employee[field.rawKey] || '';
    const verified = verifiedResults.find((v: any) => v.question_key === fieldKey);
    const verifiedValue = verified?.response_value;

    const [value, setValue] = useState(verifiedValue ?? rawOriginal);
    const [saving, setSaving] = useState(false);

    const [positions, setPositions] = useState<string[]>([]);
    const [departments, setDepartments] = useState<string[]>([]);
    const [businessUnits, setBusinessUnits] = useState<string[]>([]);
    const [supervisors, setSupervisors] = useState<string[]>([]);

    // Update local state when selection changes
    useEffect(() => {
        setValue(verifiedValue ?? rawOriginal);
    }, [fieldKey, verifiedValue, rawOriginal]);

    useEffect(() => {
        async function fetchSettings() {
            const [dRes, bRes, sRes, pRes] = await Promise.all([
                getDepartments(),
                getBusinessUnits(),
                getSupervisors(),
                getPositions()
            ]);
            if (dRes.success) setDepartments(dRes.data?.filter((d: any) => d.is_active).map((d: any) => d.name) || []);
            if (bRes.success) setBusinessUnits(bRes.data?.filter((b: any) => b.is_active).map((b: any) => b.name) || []);
            if (sRes.success) setSupervisors(sRes.data?.filter((s: any) => s.is_active).map((s: any) => s.name) || []);
            if (pRes.success) setPositions(pRes.data?.filter((p: any) => p.is_active).map((p: any) => p.name) || []);
        }
        fetchSettings();
    }, []);

    const handleSave = async () => {
        const trimmed = typeof value === 'string' ? value.trim() : value;
        if (trimmed === (verifiedValue ?? rawOriginal)) return;

        setSaving(true);
        const result = await saveVerifiedAnswer(resignationId, fieldKey, trimmed);
        if (result.error) {
            toast.error('Failed to save', { description: result.error });
            setValue(verifiedValue ?? rawOriginal);
        } else {
            toast.success('Saved', { description: `${field.label} updated.` });
            router.refresh();
        }
        setSaving(false);
    };

    // Render Input based on type
    const renderInput = () => {
        if (field.type === 'position') {
            return (
                <Select value={value} onValueChange={setValue}>
                    <SelectTrigger className="w-full bg-black/40 border-white/10 h-14 rounded-xl text-lg">
                        <SelectValue placeholder="Select position" />
                    </SelectTrigger>
                    <SelectContent>
                        {positions.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                    </SelectContent>
                </Select>
            );
        }
        if (field.type === 'business_unit') {
            return (
                <Select value={value} onValueChange={setValue}>
                    <SelectTrigger className="w-full bg-black/40 border-white/10 h-14 rounded-xl text-lg">
                        <SelectValue placeholder="Select business unit" />
                    </SelectTrigger>
                    <SelectContent>
                        {businessUnits.map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}
                    </SelectContent>
                </Select>
            );
        }
        if (field.type === 'department') {
            return (
                <Select value={value} onValueChange={setValue}>
                    <SelectTrigger className="w-full bg-black/40 border-white/10 h-14 rounded-xl text-lg">
                        <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                        {departments.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                    </SelectContent>
                </Select>
            );
        }
        if (field.type === 'supervisor') {
            return (
                <Select value={value} onValueChange={setValue}>
                    <SelectTrigger className="w-full bg-black/40 border-white/10 h-14 rounded-xl text-lg">
                        <SelectValue placeholder="Select supervisor" />
                    </SelectTrigger>
                    <SelectContent>
                        {supervisors.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectContent>
                </Select>
            );
        }
        if (field.type === 'date') {
            return (
                <div className="w-full">
                    <DatePicker
                        date={parseDateSafe(value)}
                        onChange={(date) => setValue(date?.toISOString() || '')}
                        id={`date-${fieldKey}`}
                    />
                </div>
            );
        }
        return (
            <input
                className="w-full bg-muted/40 border border-border rounded-xl px-4 py-4 text-lg text-foreground outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all placeholder:text-foreground/20"
                placeholder={`Enter correct ${field.label.toLowerCase()}...`}
                value={value}
                onChange={(e) => setValue(e.target.value)}
            />
        );
    };

    const originalDisplay = formatDisplayValue(rawOriginal, field.type);

    return (
        <motion.div
            key={fieldKey}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.2 }}
            className="flex-1 bg-card/60 backdrop-blur-xl border border-border rounded-2xl overflow-hidden flex flex-col shadow-xl"
        >
            {/* Header */}
            <div className="p-6 border-b border-border bg-muted/30">
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 rounded-lg bg-primary/10 border border-primary/20 text-primary">
                        {field.icon}
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-foreground tracking-tight">{field.label}</h2>
                        <p className="text-sm text-muted-foreground font-medium">Personal Information Correction</p>
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-8">
                {/* Original Answer */}
                <div className="space-y-3 opacity-80 hover:opacity-100 transition-opacity">
                    <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold pl-1">
                        Employee's Original Entry
                    </p>
                    <div className="p-4 rounded-xl bg-muted/30 border border-border text-lg text-foreground/90 font-medium leading-relaxed">
                        {originalDisplay || 'N/A'}
                    </div>
                </div>

                {/* Verified Answer Input */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <p className="text-[10px] uppercase tracking-widest text-primary font-bold pl-1 flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                            Verified Information
                        </p>
                        {value !== rawOriginal && (
                            <span className="text-[10px] bg-amber-500/10 text-amber-600 dark:text-amber-400 px-2 py-0.5 rounded-full border border-amber-500/20 font-bold">
                                MODIFIED
                            </span>
                        )}
                    </div>

                    <div className="relative group">
                        {renderInput()}
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        {value !== (verifiedValue ?? rawOriginal) && (
                            <Button
                                variant="ghost"
                                onClick={() => setValue(verifiedValue ?? rawOriginal)}
                                className="text-muted-foreground hover:text-foreground hover:bg-muted"
                            >
                                Cancel
                            </Button>
                        )}
                        <Button
                            onClick={handleSave}
                            disabled={saving || value === (verifiedValue ?? rawOriginal)}
                            className={cn(
                                "font-bold shadow-lg transition-all",
                                value !== (verifiedValue ?? rawOriginal)
                                    ? "bg-primary hover:bg-primary/90 text-primary-foreground shadow-primary/20"
                                    : "bg-muted text-muted-foreground"
                            )}
                        >
                            {saving ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <CheckCircle className="w-4 h-4 mr-2" />
                                    Save Correction
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}


