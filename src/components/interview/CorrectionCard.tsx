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
        <Card className="w-full border-l-4 border-l-indigo-500 shadow-sm">
            <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium text-slate-800 flex justify-between items-center">
                    <span>{response.question?.text || 'Question'}</span>
                    {response.is_corrected && (
                        <Badge variant="secondary" className="bg-indigo-100 text-indigo-700">
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            Corrected
                        </Badge>
                    )}
                </CardTitle>
            </CardHeader>

            <CardContent className="space-y-4">
                {/* Original Answer (Read Only) */}
                <div className="bg-slate-50 p-3 rounded-md border border-slate-100">
                    <Label className="text-xs text-slate-500 uppercase tracking-wider font-semibold">
                        Employee's Original Answer
                    </Label>
                    <p className="mt-1 text-slate-700 font-medium">{originalDisplay}</p>
                </div>

                {/* Correction Input */}
                <div className="space-y-2">
                    <Label htmlFor="correction" className="text-indigo-900 font-semibold">
                        Corrected/Verified Reality
                    </Label>
                    <Textarea
                        id="correction"
                        placeholder="Enter the factual reality if different from above..."
                        value={correctedAnswer}
                        onChange={(e) => setCorrectedAnswer(e.target.value)}
                        className="bg-white border-indigo-100 focus:border-indigo-400 focus:ring-indigo-400 min-h-[80px]"
                    />
                </div>

                {/* Notes */}
                <div className="space-y-2">
                    <Label htmlFor="notes" className="text-slate-600">
                        Interviewer Notes (Internal)
                    </Label>
                    <Textarea
                        id="notes"
                        placeholder="Context, nuance, or details of the conversation..."
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        className="text-sm bg-slate-50 border-slate-200 min-h-[60px]"
                    />
                </div>
            </CardContent>

            <CardFooter className="pt-2 flex justify-end">
                <Button
                    onClick={handleSave}
                    disabled={loading}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white transition-all"
                >
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {response.is_corrected ? 'Update Correction' : 'Save Correction'}
                </Button>
            </CardFooter>
        </Card>
    );
}
