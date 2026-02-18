'use server';

import { createClient } from '@/lib/supabase/server';

export interface PromoterMetrics {
    promoters: number;
    detractors: number;
    avgScore: number;
    total: number;
}

export async function getPromoterMetrics(): Promise<PromoterMetrics> {
    const supabase = await createClient();

    const { data: results, error } = await supabase
        .from('exit_interview_results')
        .select('response_value')
        .eq('question_key', 'recommendation');

    if (error || !results) return { promoters: 0, detractors: 0, avgScore: 0, total: 0 };

    let promoters = 0;
    let detractors = 0;
    let totalScore = 0;
    let count = 0;

    results.forEach(r => {
        const val = Number(r.response_value);
        if (!isNaN(val)) {
            totalScore += val;
            count++;
            if (val >= 50) promoters++;
            else detractors++;
        }
    });

    return {
        promoters,
        detractors,
        avgScore: count > 0 ? Math.round(totalScore / count) : 0,
        total: count
    };
}
