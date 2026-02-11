'use server';

import { createClient } from '@/lib/supabase/server';

// ─────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────
export interface ExitDriverMetrics {
    /** Row 1: KPI Cards */
    topCompetitorDraw: {
        reason: string
        count: number
        total: number
    }
    brainDrain: {
        count: number
        total: number
        rate: number
    }
    conflictExits: {
        count: number
        total: number
        rate: number
    }

    /** Row 2: Charts */
    pushPull: {
        push: { name: string; value: number }[]
        pull: { name: string; value: number }[]
    }
    destination: { name: string; value: number }[]

    /** Row 3: Money vs Culture bar */
    moneyVsCulture: {
        financial: number
        environment: number
        total: number
    }
}

// ─────────────────────────────────────────────────────────
// Classification Maps
// ─────────────────────────────────────────────────────────

/** Push factors: reasons they dislike current job (internal) */
const PUSH_REASONS = [
    'Compensation', 'Career Growth', 'Management',
    'Work-Life Balance', 'Workload', 'Health',
    'Differences with Superior', 'Differences with Co-Employees',
    'Family Reasons',
];

/** Pull factors: reasons the new opportunity is attractive (external) */
const PULL_REASONS = [
    'Another Job (Local)', 'Another Job (Abroad)', 'Another Job',
    'Business', 'Study',
];

/** Financial reasons */
const FINANCIAL_REASONS = ['Compensation', 'rate_of_pay', 'benefits'];

/** Environment/culture reasons */
const ENVIRONMENT_REASONS = ['Career Growth', 'Management', 'Workload', 'Work-Life Balance',
    'Differences with Superior', 'Differences with Co-Employees'];

/** Conflict-related */
const CONFLICT_REASONS = ['Differences with Superior', 'Differences with Co-Employees', 'Management'];

// ─────────────────────────────────────────────────────────
// Server Action
// ─────────────────────────────────────────────────────────
export async function getExitDriverMetrics(): Promise<ExitDriverMetrics> {
    const supabase = await createClient();
    const defaults: ExitDriverMetrics = {
        topCompetitorDraw: { reason: 'N/A', count: 0, total: 0 },
        brainDrain: { count: 0, total: 0, rate: 0 },
        conflictExits: { count: 0, total: 0, rate: 0 },
        pushPull: { push: [], pull: [] },
        destination: [],
        moneyVsCulture: { financial: 0, environment: 0, total: 0 },
    };

    // 1. Get all completed resignation IDs
    const { data: resignations, error: resError } = await supabase
        .from('resignations')
        .select('id')
        .in('status', ['completed', 'approved', 'verified', 'scheduled']);

    if (resError || !resignations?.length) return defaults;

    const resignationIds = resignations.map(r => r.id);
    const totalExits = resignationIds.length;

    // 2. Fetch all exit questionnaire results for these resignations
    const { data: results, error: resultsError } = await supabase
        .from('exit_questionnaire_results')
        .select('question_key, response_value')
        .in('resignation_id', resignationIds);

    if (resultsError || !results?.length) return defaults;

    // ──────── REASON FOR LEAVING analysis ────────
    const reasonResults = results.filter(r => r.question_key === 'reason_for_leaving');
    const allReasons: string[] = [];
    reasonResults.forEach(r => {
        const vals = Array.isArray(r.response_value) ? r.response_value : [String(r.response_value)];
        vals.forEach((v: string) => allReasons.push(v));
    });

    // Push vs Pull
    const pushCounts: Record<string, number> = {};
    const pullCounts: Record<string, number> = {};

    allReasons.forEach(reason => {
        if (PUSH_REASONS.some(p => reason.includes(p))) {
            pushCounts[reason] = (pushCounts[reason] || 0) + 1;
        }
        if (PULL_REASONS.some(p => reason.includes(p))) {
            pullCounts[reason] = (pullCounts[reason] || 0) + 1;
        }
    });

    const pushData = Object.entries(pushCounts)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value);

    const pullData = Object.entries(pullCounts)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value);

    // Brain Drain: "Another Job (Abroad)" count
    const brainDrainCount = allReasons.filter(r => r === 'Another Job (Abroad)').length;

    // Conflict Exits
    const conflictCount = allReasons.filter(r => CONFLICT_REASONS.some(c => r.includes(c))).length;

    // ──────── WHY MORE DESIRABLE analysis (Top Competitor Draw) ────────
    const desirableResults = results.filter(r => r.question_key === 'why_more_desirable');
    const desirableCounts: Record<string, number> = {};
    desirableResults.forEach(r => {
        const vals = Array.isArray(r.response_value) ? r.response_value : [String(r.response_value)];
        vals.forEach((v: string) => {
            desirableCounts[v] = (desirableCounts[v] || 0) + 1;
        });
    });

    let topReason = 'N/A';
    let topCount = 0;
    const totalDesirable = Object.values(desirableCounts).reduce((a, b) => a + b, 0);
    Object.entries(desirableCounts).forEach(([reason, count]) => {
        if (count > topCount) {
            topCount = count;
            topReason = reason;
        }
    });

    // If no why_more_desirable data, fall back to top reason_for_leaving
    if (topCount === 0 && allReasons.length > 0) {
        const reasonCounts: Record<string, number> = {};
        allReasons.forEach(r => { reasonCounts[r] = (reasonCounts[r] || 0) + 1; });
        Object.entries(reasonCounts).forEach(([reason, count]) => {
            if (count > topCount) {
                topCount = count;
                topReason = reason;
            }
        });
    }

    // ──────── DESTINATION BREAKDOWN ────────
    const countryResults = results.filter(r => r.question_key === 'reason_for_leaving_country');
    const countryCounts: Record<string, number> = {};
    countryResults.forEach(r => {
        const val = Array.isArray(r.response_value) ? r.response_value[0] : String(r.response_value);
        if (val) countryCounts[val] = (countryCounts[val] || 0) + 1;
    });

    // Also include Local Job, Business, Study from reason_for_leaving
    const localCount = allReasons.filter(r => r === 'Another Job (Local)').length;
    const businessCount = allReasons.filter(r => r === 'Business').length;
    const studyCount = allReasons.filter(r => r.toLowerCase().includes('study')).length;

    const destinationSlices: { name: string; value: number }[] = [];
    if (localCount > 0) destinationSlices.push({ name: 'Local Job', value: localCount });
    if (brainDrainCount > 0) destinationSlices.push({ name: 'Abroad', value: brainDrainCount });
    if (businessCount > 0) destinationSlices.push({ name: 'Business', value: businessCount });
    if (studyCount > 0) destinationSlices.push({ name: 'Study', value: studyCount });

    // Add specific countries if available
    Object.entries(countryCounts).forEach(([name, value]) => {
        destinationSlices.push({ name: `Abroad (${name})`, value });
    });

    destinationSlices.sort((a, b) => b.value - a.value);

    // ──────── MONEY vs CULTURE ────────
    // Financial = responses about Compensation (from reason_for_leaving) + rate_of_pay + benefits low ratings
    const financialFromReasons = allReasons.filter(r => r === 'Compensation').length;
    const rateResults = results.filter(r => r.question_key === 'rate_of_pay');
    const benefitResults = results.filter(r => r.question_key === 'benefits');

    // Low ratings (1-2 out of 5) = dissatisfied = contributing factor
    const lowRateCount = rateResults.filter(r => {
        const v = Number(r.response_value);
        return !isNaN(v) && v <= 2;
    }).length;
    const lowBenefitCount = benefitResults.filter(r => {
        const v = Number(r.response_value);
        return !isNaN(v) && v <= 2;
    }).length;

    const financialScore = financialFromReasons + lowRateCount + lowBenefitCount;

    // Environment = Career Growth, Management, Workload, Work-Life Balance from reasons
    const envFromReasons = allReasons.filter(r => ENVIRONMENT_REASONS.some(e => r.includes(e))).length;
    const workloadResults = results.filter(r => r.question_key === 'workload');
    const careerResults = results.filter(r => r.question_key === 'career_growth');

    const lowWorkloadCount = workloadResults.filter(r => {
        const v = Number(r.response_value);
        return !isNaN(v) && v <= 2;
    }).length;
    const lowCareerCount = careerResults.filter(r => {
        const v = Number(r.response_value);
        return !isNaN(v) && v <= 2;
    }).length;

    const environmentScore = envFromReasons + lowWorkloadCount + lowCareerCount;
    const totalMvC = financialScore + environmentScore;

    return {
        topCompetitorDraw: {
            reason: topReason,
            count: topCount,
            total: totalDesirable || totalExits,
        },
        brainDrain: {
            count: brainDrainCount,
            total: totalExits,
            rate: totalExits > 0 ? Math.round((brainDrainCount / totalExits) * 100) : 0,
        },
        conflictExits: {
            count: conflictCount,
            total: totalExits,
            rate: totalExits > 0 ? Math.round((conflictCount / totalExits) * 100) : 0,
        },
        pushPull: { push: pushData, pull: pullData },
        destination: destinationSlices,
        moneyVsCulture: {
            financial: financialScore,
            environment: environmentScore,
            total: totalMvC,
        },
    };
}
