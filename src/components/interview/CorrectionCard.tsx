'use client';

import { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Loader2, CheckCircle2 } from 'lucide-react';
import { saveCorrection } from '@/app/actions/interview-ops';
import { toast } from 'sonner';

interface CorrectionCardProps {
    response: any; // Using any for now to avoid deep type wrestling, but ideally proper type
    onSave?: () => void;
}

export function CorrectionCard({ response, onSave }: CorrectionCardProps) {
    const [loading, setLoading] = useState(false);
    const [correctedAnswer, setCorrectedAnswer] = useState(response.corrected_answer || '');
    const [note, setNote] = useState(response.interviewer_note || '');

    // Determine original display value
    let originalDisplay = '';
    if (response.original_answer) {
        originalDisplay = response.original_answer;
    } else if (response.response_text) {
        originalDisplay = response.response_text;
    } else if (response.selected_options && response.selected_options.length > 0) {
        originalDisplay = response.selected_options.join(', ');
    } else if (response.rating) {
        originalDisplay = `Rating: ${response.rating}`;
    } else {
        originalDisplay = '(No answer provided)';
    }

    const handleSave = async () => {
        setLoading(true);
        try {
            const result = await saveCorrection(response.id, {
                corrected_answer: correctedAnswer,
                interviewer_note: note,
            });

            if (result.error) {
                toast.error('Error', {
                    description: result.error,
                });
            } else {
                toast.success('Saved', {
                    description: 'Correction saved successfully.',
                });
                if (onSave) onSave();
            }
        } catch (error) {
            toast.error('Error', {
                description: 'Unexpected error occurred.',
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className="w-full border-none bg-black/20 backdrop-blur-md shadow-2xl ring-1 ring-white/5 overflow-hidden">
            <CardHeader className="pb-4 bg-white/[0.02] border-b border-white/5">
                <CardTitle className="text-xl font-bold text-white flex justify-between items-center tracking-tight">
                    <span>{response.question?.text || 'Question'}</span>
                    {response.is_corrected && (
                        <Badge variant="secondary" className="bg-indigo-500/10 text-indigo-400 border-indigo-500/20 px-3 py-1">
                            <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
                            Verified Reality
                        </Badge>
                    )}
                </CardTitle>
            </CardHeader>

            <CardContent className="space-y-6 pt-6">
                {/* Original Answer (Read Only) */}
                <div className="bg-white/[0.02] p-4 rounded-xl border border-white/5 relative group">
                    <div className="absolute inset-0 bg-indigo-500/[0.02] opacity-0 group-hover:opacity-100 transition-opacity rounded-xl" />
                    <Label className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold opacity-60">
                        Employee's Original Perception
                    </Label>
                    <p className="mt-2 text-indigo-100/90 font-medium leading-relaxed">{originalDisplay}</p>
                </div>

                {/* Correction Input */}
                <div className="space-y-3">
                    <Label htmlFor="correction" className="text-xs font-bold uppercase tracking-wider text-indigo-400">
                        Interviewer's Validated Truth
                    </Label>
                    <Textarea
                        id="correction"
                        placeholder="Enter the factual reality if different from above..."
                        value={correctedAnswer}
                        onChange={(e) => setCorrectedAnswer(e.target.value)}
                        className="bg-black/40 border-white/10 focus:border-indigo-500/50 focus:ring-indigo-500/20 min-h-[100px] text-white rounded-xl transition-all"
                    />
                </div>

                {/* Notes */}
                <div className="space-y-3">
                    <Label htmlFor="notes" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
                        Strategic Nuance (Internal Notes)
                    </Label>
                    <Textarea
                        id="notes"
                        placeholder="Context, nuance, or details of the conversation..."
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        className="text-sm bg-black/20 border-white/5 focus:border-white/20 focus:ring-0 min-h-[80px] text-gray-300 rounded-xl transition-all"
                    />
                </div>
            </CardContent>

            <CardFooter className="pt-2 pb-6 flex justify-end px-6 bg-white/[0.01] border-t border-white/5">
                <Button
                    onClick={handleSave}
                    disabled={loading}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white transition-all shadow-lg shadow-indigo-500/10 px-8 font-bold"
                >
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {response.is_corrected ? 'Update Verification' : 'Seal Verification'}
                </Button>
            </CardFooter>
        </Card>
    );
}
