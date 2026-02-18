'use server';

import { createClient } from '@/lib/supabase/server';
import { differenceInMonths, parseISO } from 'date-fns';


export interface ButterflyData {
    push: { name: string; value: number }[];
    pull: { name: string; value: number }[];
}

const PUSH_REASONS = [
    'management',
    'work-life balance',
    'workload',
    'culture',
    'environment',
    'career growth',
    'lack of growth',
    'stagnation',
    'personal',
    'family',
    'health',
    'compensation',
    'pay',
    'benefits'
];

const PULL_REASONS = [
    'better opportunity',
    'another job',
    'relocation',
    'business',
    'study',
    'higher pay' // Sometimes ambiguous, but often "pulled by higher pay"
];

// Helper to categorize ambiguous terms
const categorizeReason = (reason: string): 'push' | 'pull' | 'neutral' => {
    const r = reason.toLowerCase();

    // Explicit overrides
    if (r.includes('higher pay')) return 'pull';
    if (r.includes('better opportunity')) return 'pull';
    if (r.includes('relocation')) return 'pull';
    if (r.includes('another job')) return 'pull';

    if (r.includes('career growth')) return 'push'; // Usually implies "Lack of" in exit context
    if (r.includes('management')) return 'push';
    if (r.includes('work-life')) return 'push';
    if (r.includes('culture')) return 'push';
    if (r.includes('personal')) return 'push'; // Grouping personal as "internal/push" for now

    return 'neutral';
};

export async function getButterflyData(): Promise<ButterflyData> {
    const supabase = await createClient();

    const { data: results, error } = await supabase
        .from('exit_interview_results')
        .select('response_value')
        .eq('question_key', 'reason_for_leaving');

    if (error || !results) return { push: [], pull: [] };

    const pushCounts: Record<string, number> = {};
    const pullCounts: Record<string, number> = {};

    results.forEach(r => {
        let reasons: string[] = [];
        let val = r.response_value;

        // Ensure we're dealing with a string or array
        if (typeof val === 'string') {
            val = val.trim();
            if (val.startsWith('[')) {
                try {
                    const parsed = JSON.parse(val);
                    if (Array.isArray(parsed)) reasons = parsed;
                    else reasons = [String(parsed)];
                } catch {
                    reasons = [val];
                }
            } else if (val.includes(',')) {
                // Handle CSV format just in case
                reasons = val.split(',').map((s: string) => s.trim());
            } else {
                reasons = [val];
            }
        } else if (Array.isArray(val)) {
            reasons = val.map(String); // Force strings
        } else if (val) {
            reasons = [String(val)];
        }

        reasons.forEach(reason => {
            const clean = reason.trim().replace(/^"|"$/g, '');
            if (!clean) return;

            const category = categorizeReason(clean);

            if (category === 'push') {
                pushCounts[clean] = (pushCounts[clean] || 0) + 1;
            } else if (category === 'pull') {
                pullCounts[clean] = (pullCounts[clean] || 0) + 1;
            }
        });
    });

    return {
        push: Object.entries(pushCounts).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value),
        pull: Object.entries(pullCounts).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value).slice(0, 5) // Limit Pull to top 5
    };
}
