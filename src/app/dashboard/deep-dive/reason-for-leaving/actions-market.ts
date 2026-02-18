'use server';

import { createClient } from '@/lib/supabase/server';
import { startOfMonth, subMonths, format, parseISO } from 'date-fns';

// ----------------------------------------------------------------------
// TYPES
// ----------------------------------------------------------------------

export interface MarketMetric {
    label: string;
    value: number | string;
    subValue?: string;
    items?: { label: string; value: number }[];
    insight?: string;
}

// ----------------------------------------------------------------------
// ACTIONS
// ----------------------------------------------------------------------

/**
 * 1. Competitor Draw (Why More Desirable?)
 * Source: `why_more_desirable` from `exit_interview_results`
 * Logic: Aggregates top reasons why the new job is better.
 */
export async function getCompetitorDraw(): Promise<MarketMetric> {
    const supabase = await createClient();

    // Look back 12 months for market relevance
    const startDate = subMonths(new Date(), 12).toISOString();

    const { data, error } = await supabase
        .from('exit_interview_results')
        .select('response_value')
        .eq('question_key', 'why_more_desirable')
        .gte('created_at', startDate);

    if (error) {
        console.error('Error fetching competitor draw:', error);
        return { label: 'Competitor Draw', value: 'N/A' };
    }

    const counts: Record<string, number> = {};
    let total = 0;

    data.forEach((row) => {
        let val = row.response_value;
        if (typeof val === 'string') {
            val = val.replace(/[\[\]"]/g, '').trim();
        }
        if (val) {
            counts[val] = (counts[val] || 0) + 1;
            total++;
        }
    });

    // Sort and Top 5
    const sorted = Object.entries(counts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([label, value]) => ({ label, value }));

    const topFactor = sorted.length > 0 ? sorted[0].label : 'None';

    return {
        label: 'Top Competitor Draw',
        value: topFactor,
        subValue: sorted.length > 0 ? `${Math.round((sorted[0].value / total) * 100)}% of exits` : 'No data',
        items: sorted
    };
}

/**
 * 2. Brain Drain (International Migration)
 * Source: `reason_for_leaving_country` implies migration.
 * Logic: Count % of exits where this field is present vs total exits.
 */
export async function getBrainDrain(): Promise<MarketMetric> {
    const supabase = await createClient();
    const startDate = subMonths(new Date(), 12).toISOString();

    // Get total completed exits in period
    const { count: totalExits, error: totalError } = await supabase
        .from('resignations')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'completed')
        .gte('created_at', startDate);

    // Get migration exits (where reason_for_leaving_country exists)
    const { count: migrationExits, error: migrationError } = await supabase
        .from('exit_interview_results')
        .select('id', { count: 'exact', head: true })
        .eq('question_key', 'reason_for_leaving_country')
        .gte('created_at', startDate);

    if (totalError || migrationError) {
        return { label: 'Brain Drain', value: 'N/A' };
    }

    const total = totalExits || 0;
    const migration = migrationExits || 0;

    if (total === 0) return { label: 'Brain Drain', value: '0%' };

    const rate = Math.round((migration / total) * 100);

    return {
        label: 'Brain Drain (Migration)',
        value: `${rate}%`,
        subValue: `${migration} talents lost to overseas markets`,
        insight: rate > 20 ? 'Critical: High rate of international loss.' : 'Stable: Most exits are local.'
    };
}

/**
 * 3. Money vs Culture
 * Source: `reason_for_leaving`
 * Logic: Group specific reasons into "Financial" vs "Cultural" buckets and compare.
 */
export async function getMoneyVsCulture(): Promise<MarketMetric> {
    const supabase = await createClient();
    const startDate = subMonths(new Date(), 12).toISOString();

    const { data, error } = await supabase
        .from('exit_interview_results')
        .select('response_value')
        .eq('question_key', 'reason_for_leaving')
        .gte('created_at', startDate);

    if (error) {
        return { label: 'Money vs Culture', value: 'N/A' };
    }

    let financialCount = 0;
    let culturalCount = 0;
    let total = 0;

    const financialKeywords = ['pay', 'salary', 'compensation', 'benefits', 'money', 'raise'];
    const culturalKeywords = ['culture', 'management', 'environment', 'leadership', 'toxic', 'balance'];

    data.forEach((row) => {
        // Flatten text
        const text = JSON.stringify(row.response_value).toLowerCase();

        const isFinancial = financialKeywords.some(k => text.includes(k));
        const isCultural = culturalKeywords.some(k => text.includes(k));

        if (isFinancial) financialCount++;
        if (isCultural) culturalCount++;
        if (isFinancial || isCultural) total++;
    });

    if (total === 0) return { label: 'Money vs Culture', value: '50/50' };

    const financialPct = Math.round((financialCount / (financialCount + culturalCount)) * 100);
    const culturalPct = 100 - financialPct; // Approximate for binary comparison

    return {
        label: 'Primary Driver',
        value: financialPct > culturalPct ? 'Financial' : 'Cultural',
        subValue: `${financialPct}% Financial vs ${culturalPct}% Cultural`,
        items: [
            { label: 'Financial', value: financialCount },
            { label: 'Cultural', value: culturalCount }
        ]
    };
}
