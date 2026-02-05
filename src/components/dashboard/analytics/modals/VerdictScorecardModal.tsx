'use client';

import { ThumbsUp, ThumbsDown, Minus } from 'lucide-react';

interface VerdictScorecardModalProps {
    score: number; // e.g., 65
    verdict: string; // e.g., "Good"
    details: {
        promoters: number;
        detractors: number;
        passives: number;
        total: number;
    };
}

export function VerdictScorecardModal({ score, verdict, details }: VerdictScorecardModalProps) {
    return (
        <div className="space-y-8">
            {/* Header Stats */}
            <div className="grid grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex flex-col items-center justify-center text-center">
                    <ThumbsUp className="h-6 w-6 text-emerald-400 mb-2" />
                    <span className="text-2xl font-bold text-white">{details.promoters}</span>
                    <span className="text-xs uppercase tracking-widest text-emerald-400 font-medium">Promoters</span>
                </div>
                <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 flex flex-col items-center justify-center text-center">
                    <ThumbsDown className="h-6 w-6 text-rose-400 mb-2" />
                    <span className="text-2xl font-bold text-white">{details.detractors}</span>
                    <span className="text-xs uppercase tracking-widest text-rose-400 font-medium">Detractors</span>
                </div>
                <div className="p-4 rounded-xl bg-gray-500/10 border border-gray-500/20 flex flex-col items-center justify-center text-center">
                    <Minus className="h-6 w-6 text-gray-400 mb-2" />
                    <span className="text-2xl font-bold text-white">{details.passives}</span>
                    <span className="text-xs uppercase tracking-widest text-gray-400 font-medium">Passives</span>
                </div>
            </div>

            {/* Analysis Text */}
            <div className="space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground border-b border-white/5 pb-2">Analysis</h3>
                <div className="space-y-4 text-sm text-gray-300 leading-relaxed">
                    <p>
                        The <span className="text-white font-medium">Employee Net Promoter Score (eNPS)</span> is currently tracking at
                        <span className="text-white font-bold mx-1">{score}</span>, which is considered <span className="text-white font-bold">{verdict}</span>.
                    </p>
                    <p>
                        This indicates that while the majority of departing employees are leaving on good terms, there is a significant
                        minority ({Math.round((details.detractors / details.total) * 100)}%) who would actively discourage peers from joining.
                    </p>
                </div>
            </div>

            {/* Action Items */}
            <div className="space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground border-b border-white/5 pb-2">Recommended Actions</h3>
                <ul className="space-y-3">
                    <li className="flex items-start gap-3 text-sm text-gray-300">
                        <div className="h-1.5 w-1.5 rounded-full bg-indigo-500 mt-2 shrink-0" />
                        <span>Investigate the specific "Detractor" exit interviews for recurring themes in "Reason for Leaving".</span>
                    </li>
                    <li className="flex items-start gap-3 text-sm text-gray-300">
                        <div className="h-1.5 w-1.5 rounded-full bg-indigo-500 mt-2 shrink-0" />
                        <span>Address the {details.passives} "Passive" respondents — these are retainable employees who felt indifferent.</span>
                    </li>
                </ul>
            </div>
        </div>
    );
}
