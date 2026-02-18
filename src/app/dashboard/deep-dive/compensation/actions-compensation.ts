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

export interface PayBenefitsMatrixData {
    martyrs: number;      // Low Pay, Low Benefits
    hostages: number;     // Low Pay, High Benefits
    mercenaries: number;  // High Pay, Low Benefits
    aristocrats: number;  // High Pay, High Benefits
    total: number;
}

export async function getPayBenefitsMatrix(): Promise<PayBenefitsMatrixData> {
    const supabase = await createClient();

    // Fetch Rate of Pay and Benefits for all resignations
    const { data: results, error } = await supabase
        .from('exit_interview_results')
        .select('resignation_id, question_key, response_value')
        .in('question_key', ['rate_of_pay', 'benefits']);

    if (error || !results) {
        return { martyrs: 0, hostages: 0, mercenaries: 0, aristocrats: 0, total: 0 };
    }

    const byResignation = new Map<string, { pay?: 'low' | 'high', benefits?: 'low' | 'high' }>();

    results.forEach(r => {
        let val = r.response_value;
        if (Array.isArray(val)) val = val[0];
        val = String(val).trim().replace(/^"|"$/g, '');

        const tier = classify(val); // returns 'low', 'fair', 'high'
        if (!tier) return;

        // Map 'fair' to 'high' for 2x2 matrix (Golden Handcuffs logic)
        // Adjust logic here if strict 3x3 is needed, but user asked for 2x2.
        const binaryTier = tier === 'low' ? 'low' : 'high';

        if (!byResignation.has(r.resignation_id)) {
            byResignation.set(r.resignation_id, {});
        }
        const entry = byResignation.get(r.resignation_id)!;

        if (r.question_key === 'rate_of_pay') entry.pay = binaryTier;
        if (r.question_key === 'benefits') entry.benefits = binaryTier;
    });

    let martyrs = 0;
    let hostages = 0;
    let mercenaries = 0;
    let aristocrats = 0;

    byResignation.forEach(entry => {
        if (entry.pay && entry.benefits) {
            if (entry.pay === 'low' && entry.benefits === 'low') martyrs++;
            else if (entry.pay === 'low' && entry.benefits === 'high') hostages++;
            else if (entry.pay === 'high' && entry.benefits === 'low') mercenaries++;
            else if (entry.pay === 'high' && entry.benefits === 'high') aristocrats++;
        }
    });

    return {
        martyrs,
        hostages,
        mercenaries,
        aristocrats,
        total: martyrs + hostages + mercenaries + aristocrats
    };
}
