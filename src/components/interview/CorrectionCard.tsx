'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { CheckCircle2, Loader2, ArrowRight, Save } from 'lucide-react';
import { saveVerifiedAnswer } from '@/app/actions/interview-ops';
import { toast } from 'sonner';

interface CorrectionCardProps {
    response: any;
    verifiedResult?: any;
    resignationId: string;
    onSave?: () => void;
    onNext?: () => void;
}

export function CorrectionCard({ response, verifiedResult, resignationId, onSave, onNext }: CorrectionCardProps) {
    const question = response.question;
    const questionType = question?.question_type || 'text';
    const options: Array<{ value: string; label: string }> = question?.options || [];

    // Determine the initial correction value
    const getInitialValue = useCallback((): string | string[] => {
        // Priority: verified result > original answer
        if (verifiedResult?.response_value != null) {
            const val = verifiedResult.response_value;
            // Multi-select: might be stored as array or comma-separated
            if (questionType === 'multi') {
                if (Array.isArray(val)) return val;
                if (typeof val === 'string') return val.split(', ').filter(Boolean);
                return [];
            }
            return typeof val === 'string' ? val : String(val);
        }

        // Fallback to original
        if (questionType === 'multi') {
            return response.selected_options || [];
        }
        if (response.selected_options?.length > 0) return response.selected_options[0];
        if (response.response_text) return response.response_text;
        if (response.rating) return response.rating.toString();
        if (response.original_answer) return response.original_answer;
        return '';
    }, [verifiedResult, response, questionType]);

    const [value, setValue] = useState<string | string[]>(getInitialValue);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(!!verifiedResult);
    const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Reset state when response changes (navigating between questions)
    useEffect(() => {
        setValue(getInitialValue());
        setSaved(!!verifiedResult);
    }, [response.id, verifiedResult, getInitialValue]);

    // Original display
    const getOriginalDisplay = (): string => {
        if (response.original_answer) return response.original_answer;
        if (response.response_text) return response.response_text;
        if (response.selected_options?.length > 0) return response.selected_options.join(', ');
        if (response.rating) return `Rating: ${response.rating}`;
        return '(No answer provided)';
    };

    // Save handler
    const doSave = useCallback(async (newValue: string | string[]) => {
        const key = response.question?.question_key;
        if (!key) return;

        setSaving(true);
        setSaved(false);

        // Normalize value for storage
        const storeValue = Array.isArray(newValue) ? newValue.join(', ') : newValue;

        const result = await saveVerifiedAnswer(resignationId, key, storeValue);

        if (result.error) {
            toast.error('Save failed', { description: result.error });
        } else {
            setSaved(true);
            if (onSave) onSave();
        }
        setSaving(false);
    }, [resignationId, response.question?.question_key, onSave]);

    // Debounced save for text input
    const handleTextChange = (newValue: string) => {
        setValue(newValue);
        setSaved(false);

        if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
        saveTimeoutRef.current = setTimeout(() => doSave(newValue), 1000);
    };

    // Immediate save for select/checkbox
    const handleSelectChange = (newValue: string) => {
        setValue(newValue);
        doSave(newValue);
    };

    const handleMultiToggle = (optionValue: string, checked: boolean) => {
        const current = Array.isArray(value) ? value : [];
        const updated = checked
            ? [...current, optionValue]
            : current.filter(v => v !== optionValue);
        setValue(updated);
        doSave(updated);
    };

    // Manual save for text (on button click)
    const handleManualSave = () => {
        if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
        doSave(value);
    };

    return (
        <Card className="w-full h-full border-none bg-black/20 backdrop-blur-md shadow-2xl ring-1 ring-white/5 overflow-hidden flex flex-col">
            <CardHeader className="pb-4 bg-white/[0.02] border-b border-white/5">
                <div className="flex justify-between items-start gap-3">
                    <CardTitle className="text-lg font-bold text-white tracking-tight leading-snug">
                        {question?.question_text || 'Question'}
                    </CardTitle>
                    <div className="shrink-0 flex items-center gap-2">
                        {saving && (
                            <Badge variant="secondary" className="bg-amber-500/10 text-amber-400 border-amber-500/20 px-2 py-0.5 text-[10px]">
                                <Loader2 className="w-3 h-3 mr-1 animate-spin" /> Saving
                            </Badge>
                        )}
                        {saved && !saving && (
                            <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 px-2 py-0.5 text-[10px]">
                                <CheckCircle2 className="w-3 h-3 mr-1" /> Saved
                            </Badge>
                        )}
                    </div>
                </div>
            </CardHeader>

            <CardContent className="space-y-6 pt-6 flex-1 flex flex-col">
                {/* Original Answer (Read Only) */}
                <div className="bg-white/[0.02] p-4 rounded-xl border border-white/5">
                    <Label className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold opacity-60">
                        Employee's Original Answer
                    </Label>
                    <p className="mt-2 text-indigo-100/90 font-medium leading-relaxed text-sm">
                        {getOriginalDisplay()}
                    </p>
                </div>

                {/* Interviewer's Correction — Dynamic by question_type */}
                <div className="space-y-3 flex-1">
                    <Label className="text-xs font-bold uppercase tracking-wider text-indigo-400">
                        Verified Answer
                    </Label>

                    {/* Single Select → Dropdown */}
                    {(questionType === 'single' || questionType === 'conditional') && options.length > 0 && (
                        <Select
                            value={typeof value === 'string' ? value : ''}
                            onValueChange={handleSelectChange}
                        >
                            <SelectTrigger className="bg-black/40 border-white/10 focus:border-indigo-500/50 text-white rounded-xl h-12">
                                <SelectValue placeholder="Select an option..." />
                            </SelectTrigger>
                            <SelectContent className="bg-zinc-900 border-white/10">
                                {options.map((opt) => (
                                    <SelectItem
                                        key={opt.value}
                                        value={opt.value}
                                        className="text-white focus:bg-indigo-600 focus:text-white"
                                    >
                                        {opt.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    )}

                    {/* Multi Select → Checkboxes */}
                    {questionType === 'multi' && options.length > 0 && (
                        <div className="space-y-2 bg-black/20 rounded-xl p-4 border border-white/5">
                            {options.map((opt) => {
                                const checked = Array.isArray(value) && value.includes(opt.value);
                                return (
                                    <label
                                        key={opt.value}
                                        className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-white/5 transition-colors cursor-pointer group"
                                    >
                                        <Checkbox
                                            checked={checked}
                                            onCheckedChange={(c) => handleMultiToggle(opt.value, !!c)}
                                            className="border-white/20 data-[state=checked]:bg-indigo-600 data-[state=checked]:border-indigo-600"
                                        />
                                        <span className="text-sm text-white/80 group-hover:text-white transition-colors">{opt.label}</span>
                                    </label>
                                );
                            })}
                        </div>
                    )}

                    {/* Text / No options → Textarea */}
                    {(questionType === 'text' || options.length === 0) && questionType !== 'multi' && (
                        <div className="space-y-2">
                            <Textarea
                                placeholder="Enter the verified answer..."
                                value={typeof value === 'string' ? value : ''}
                                onChange={(e) => handleTextChange(e.target.value)}
                                className="bg-black/40 border-white/10 focus:border-indigo-500/50 focus:ring-indigo-500/20 min-h-[120px] text-white rounded-xl transition-all"
                            />
                            <div className="flex justify-end">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={handleManualSave}
                                    disabled={saving || saved}
                                    className="text-xs text-muted-foreground hover:text-indigo-400"
                                >
                                    <Save className="w-3 h-3 mr-1" />
                                    {saving ? 'Saving...' : saved ? 'Saved' : 'Save Now'}
                                </Button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Next button */}
                {onNext && (
                    <div className="pt-2">
                        <Button
                            variant="outline"
                            onClick={onNext}
                            className="w-full border-white/10 hover:bg-white/5 text-white/80 hover:text-white py-5"
                        >
                            Next Question <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
