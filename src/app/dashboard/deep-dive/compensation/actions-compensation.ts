'use server';

import { createClient } from '@/lib/supabase/server';

export interface PayVsBenefits {
    label: string;
    pay: number;
    benefits: number;
}

const LOW_VALUES = new Set(['Very low', 'Uncompetitive', 'None', 'Poor']);
const FAIR_VALUES = new Set(['Average', 'Fair', 'Moderate']);
const HIGH_VALUES = new Set(['High', 'Competitive', 'Good', 'Exceptional', 'Excellent']);

function classify(val: string): 'low' | 'fair' | 'high' | null {
    if (LOW_VALUES.has(val)) return 'low';
    if (FAIR_VALUES.has(val)) return 'fair';
    if (HIGH_VALUES.has(val)) return 'high';
    return null;
}

export async function getCompensationMetrics(): Promise<PayVsBenefits[]> {
    const supabase = await createClient();

    // Fetch responses for pay and benefits
    const { data: results, error } = await supabase
        .from('exit_interview_results')
        .select('question_key, response_value')
        .in('question_key', ['rate_of_pay', 'benefits']);

    if (error || !results) {
        return [];
    }

    const payDistribution: Record<string, number> = {};
    const benefitsDistribution: Record<string, number> = {};

    results.forEach(r => {
        let val = r.response_value;
        if (Array.isArray(val)) val = val[0];
        val = String(val).trim().replace(/^"|"$/g, '');

        const tier = classify(val);
        if (tier) {
            if (r.question_key === 'rate_of_pay') {
                payDistribution[tier] = (payDistribution[tier] || 0) + 1;
            } else {
                benefitsDistribution[tier] = (benefitsDistribution[tier] || 0) + 1;
            }
        }
    });

    return [
        { label: 'Low', pay: payDistribution['low'] || 0, benefits: benefitsDistribution['low'] || 0 },
        { label: 'Fair', pay: payDistribution['fair'] || 0, benefits: benefitsDistribution['fair'] || 0 },
        { label: 'High', pay: payDistribution['high'] || 0, benefits: benefitsDistribution['high'] || 0 },
    ];
}
