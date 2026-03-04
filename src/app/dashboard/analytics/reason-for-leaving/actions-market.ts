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
export async function getCompetitorDraw(filters: AnalyticsFilters = {}): Promise<MarketMetric> {
    const supabase = await createClient();

    // Look back 12 months for market relevance
    const startDate = filters.startDate ? filters.startDate.toISOString() : subMonths(new Date(), 12).toISOString();
    const endDate = filters.endDate ? filters.endDate.toISOString() : new Date().toISOString();

    const { data, error } = await supabase
        .from('exit_interview_results')
        .select('response_value')
        .eq('question_key', 'why_more_desirable')
        .gte('created_at', startDate)
        .lte('created_at', endDate);

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
import { AnalyticsFilters } from '@/app/actions/analytics';

export async function getBrainDrain(filters: AnalyticsFilters = {}): Promise<MarketMetric> {
    const supabase = await createClient();
    const startDate = filters.startDate ? filters.startDate.toISOString() : subMonths(new Date(), 12).toISOString();
    const endDate = filters.endDate ? filters.endDate.toISOString() : new Date().toISOString();

    // Get total completed exits in period
    let totalQuery = supabase
        .from('resignations')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'completed')
        .gte('created_at', startDate)
        .lte('created_at', endDate);

    // Get migration exits (where reason_for_leaving_country exists)
    let migrationQuery = supabase
        .from('exit_interview_results')
        .select('id', { count: 'exact', head: true })
        .eq('question_key', 'reason_for_leaving_country')
        .gte('created_at', startDate)
        .lte('created_at', endDate);

    // Apply Dept filter if needed (Note: This is tricky with separate queries. 
    // Ideally we'd join on resignations for the migration query, but for now we'll rely on global stats or ignore dept filter here to keep it simple as requested,
    // OR we just use the ID filtering if we want to be precise. 
    // Given the previous pattern, let's keep it simple for now, but strictly speaking filtering via ID list is better).
    // For MVP "Unification", date is the most critical filter.

    const { count: totalExits, error: totalError } = await totalQuery;
    const { count: migrationExits, error: migrationError } = await migrationQuery;

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
export async function getMoneyVsCulture(filters: AnalyticsFilters = {}): Promise<MarketMetric> {
    const supabase = await createClient();
    const startDate = filters.startDate ? filters.startDate.toISOString() : subMonths(new Date(), 12).toISOString();
    const endDate = filters.endDate ? filters.endDate.toISOString() : new Date().toISOString();

    const { data, error } = await supabase
        .from('exit_interview_results')
        .select('response_value')
        .eq('question_key', 'reason_for_leaving')
        .gte('created_at', startDate)
        .lte('created_at', endDate);

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
