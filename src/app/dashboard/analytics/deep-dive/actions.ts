'use server';

import { createClient } from '@/lib/supabase/server';

// ─────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────
export interface SentimentBucket {
    category: string
    low: number    // "Very low", "Poor", "None", "Very heavy", "Heavy"
    fair: number   // "Average", "Fair", "Moderate", "Manageable"
    high: number   // "High", "Good", "Exceptional", "Competitive", "Satisfactory", "Excellent", "Light"
}

export interface PayVsBenefits {
    label: string
    pay: number
    benefits: number
}

export interface ScatterPoint {
    workloadScore: number
    recommendationScore: number
    name: string
}

export interface PromoterReality {
    promoters: number  // score >= 50
    detractors: number // score < 50
    avgScore: number
    total: number
}

export interface UnhappyRow {
    name: string
    payRating: string
    workloadRating: string
    superiorName: string
    recommendationScore: number
}

export interface DeepDiveMetrics {
    sentiment: SentimentBucket[]
    payVsBenefits: PayVsBenefits[]
    scatter: ScatterPoint[]
    promoter: PromoterReality
    unhappyList: UnhappyRow[]
}

// ─────────────────────────────────────────────────────────
// Sentiment classification maps
// ─────────────────────────────────────────────────────────
const LOW_VALUES = new Set([
    'Very low', 'Uncompetitive', 'None', 'Poor', 'Very heavy', 'Heavy',
]);
const FAIR_VALUES = new Set([
    'Average', 'Fair', 'Moderate', 'Manageable',
]);
const HIGH_VALUES = new Set([
    'High', 'Competitive', 'Good', 'Exceptional', 'Satisfactory', 'Excellent', 'Light',
]);

function classify(val: string): 'low' | 'fair' | 'high' | null {
    if (LOW_VALUES.has(val)) return 'low';
    if (FAIR_VALUES.has(val)) return 'fair';
    if (HIGH_VALUES.has(val)) return 'high';
    return null;
}

// Workload to numeric (for scatter — lower = less load = better)
function workloadToScore(val: string): number {
    switch (val) {
        case 'Light': return 1;
        case 'Manageable': return 2;
        case 'Moderate': return 3;
        case 'Heavy': return 4;
        case 'Very heavy': return 5;
        default: return 3;
    }
}

// Pay ordinal to numeric (for grouped bar comparison)
function payToScore(val: string): number {
    switch (val) {
        case 'Very low': return 1;
        case 'Uncompetitive': return 2;
        case 'Average': return 3;
        case 'Competitive': return 4;
        case 'High': return 5;
        default: return 3;
    }
}

function benefitsToScore(val: string): number {
    switch (val) {
        case 'None': return 1;
        case 'Poor': return 2;
        case 'Average': return 3;
        case 'Good': return 4;
        case 'Exceptional': return 5;
        default: return 3;
    }
}

// ─────────────────────────────────────────────────────────
// Server Action
// ─────────────────────────────────────────────────────────
export async function getDeepDiveMetrics(): Promise<DeepDiveMetrics> {
    const supabase = await createClient();

    const defaults: DeepDiveMetrics = {
        sentiment: [],
        payVsBenefits: [],
        scatter: [],
        promoter: { promoters: 0, detractors: 0, avgScore: 0, total: 0 },
        unhappyList: [],
    };

    // 1. Get completed resignations with employee details
    const { data: resignations, error: resError } = await supabase
        .from('resignations')
        .select(`
      id,
      employee_details!inner (
        full_name,
        immediate_superior
      )
    `)
        .eq('status', 'completed');

    if (resError || !resignations?.length) return defaults;

    const resignationIds = resignations.map((r: any) => r.id);
    const employeeMap = new Map<string, { name: string; superior: string }>();
    resignations.forEach((r: any) => {
        employeeMap.set(r.id, {
            name: r.employee_details?.full_name || 'Unknown',
            superior: r.employee_details?.immediate_superior || 'N/A',
        });
    });

    // 2. Fetch all responses for these resignations
    const { data: results, error: resultsError } = await supabase
        .from('exit_interview_results')
        .select('resignation_id, question_key, response_value')
        .in('resignation_id', resignationIds)
        .in('question_key', ['rate_of_pay', 'benefits', 'career_growth', 'workload', 'recommendation']);

    if (resultsError || !results?.length) return defaults;

    // ──────── Group by resignation_id ────────
    const byResignation = new Map<string, Record<string, string>>();
    results.forEach(r => {
        if (!byResignation.has(r.resignation_id)) byResignation.set(r.resignation_id, {});
        const val = Array.isArray(r.response_value) ? r.response_value[0] : String(r.response_value);
        byResignation.get(r.resignation_id)![r.question_key] = val;
    });

    // ──────── 1. Sentiment Distribution (stacked bar) ────────
    const sentimentKeys = ['rate_of_pay', 'benefits', 'career_growth', 'workload'];
    const sentimentLabels: Record<string, string> = {
        rate_of_pay: 'Pay',
        benefits: 'Benefits',
        career_growth: 'Growth',
        workload: 'Workload',
    };

    const sentiment: SentimentBucket[] = sentimentKeys.map(key => {
        const bucket: SentimentBucket = { category: sentimentLabels[key], low: 0, fair: 0, high: 0 };
        byResignation.forEach(responses => {
            const val = responses[key];
            if (!val) return;
            const tier = classify(val);
            if (tier) bucket[tier]++;
        });
        return bucket;
    });

    // ──────── 2. Pay vs Benefits (grouped bar) ────────
    const payBenefitsLabels = ['Very Low', 'Low', 'Average', 'Good', 'Excellent'];
    const payDistribution: Record<string, number> = {};
    const benefitsDistribution: Record<string, number> = {};

    byResignation.forEach(responses => {
        const payVal = responses['rate_of_pay'];
        const benVal = responses['benefits'];
        if (payVal) {
            const tier = classify(payVal);
            if (tier) {
                payDistribution[tier] = (payDistribution[tier] || 0) + 1;
            }
        }
        if (benVal) {
            const tier = classify(benVal);
            if (tier) {
                benefitsDistribution[tier] = (benefitsDistribution[tier] || 0) + 1;
            }
        }
    });

    const payVsBenefits: PayVsBenefits[] = [
        { label: 'Low', pay: payDistribution['low'] || 0, benefits: benefitsDistribution['low'] || 0 },
        { label: 'Fair', pay: payDistribution['fair'] || 0, benefits: benefitsDistribution['fair'] || 0 },
        { label: 'High', pay: payDistribution['high'] || 0, benefits: benefitsDistribution['high'] || 0 },
    ];

    // ──────── 3. Scatter Plot (Workload vs Recommendation) ────────
    const scatter: ScatterPoint[] = [];
    byResignation.forEach((responses, resId) => {
        const wVal = responses['workload'];
        const rVal = responses['recommendation'];
        if (wVal && rVal) {
            scatter.push({
                workloadScore: workloadToScore(wVal),
                recommendationScore: Number(rVal),
                name: employeeMap.get(resId)?.name || 'Unknown',
            });
        }
    });

    // ──────── 4. Promoter Reality (Gauge) ────────
    let promoters = 0;
    let detractors = 0;
    let totalScore = 0;
    let recCount = 0;

    byResignation.forEach(responses => {
        const rVal = responses['recommendation'];
        if (rVal !== undefined) {
            const score = Number(rVal);
            if (!isNaN(score)) {
                totalScore += score;
                recCount++;
                if (score >= 50) promoters++;
                else detractors++;
            }
        }
    });

    const promoter: PromoterReality = {
        promoters,
        detractors,
        avgScore: recCount > 0 ? Math.round(totalScore / recCount) : 0,
        total: recCount,
    };

    // ──────── 5. Unhappy List ────────
    const unhappyList: UnhappyRow[] = [];
    byResignation.forEach((responses, resId) => {
        const payVal = responses['rate_of_pay'];
        const workloadVal = responses['workload'];
        const recVal = responses['recommendation'];

        const payTier = payVal ? classify(payVal) : null;
        const workloadTier = workloadVal ? classify(workloadVal) : null;
        const recScore = recVal ? Number(recVal) : null;

        // Filter: only show if pay or workload is "low" tier
        if (payTier === 'low' || workloadTier === 'low') {
            const emp = employeeMap.get(resId);
            unhappyList.push({
                name: emp?.name || 'Unknown',
                payRating: payVal || 'N/A',
                workloadRating: workloadVal || 'N/A',
                superiorName: emp?.superior || 'N/A',
                recommendationScore: recScore ?? -1,
            });
        }
    });

    // Sort by recommendation score ascending (most unhappy first)
    unhappyList.sort((a, b) => a.recommendationScore - b.recommendationScore);

    return {
        sentiment,
        payVsBenefits,
        scatter,
        promoter,
        unhappyList,
    };
}
