'use server';

import { createClient } from '@/lib/supabase/server';
import { AnalyticsFilters } from '@/app/actions/analytics';
import { eachMonthOfInterval, format, parseISO, startOfMonth, subMonths } from 'date-fns';

export interface AttritionTrendData {
    month: string;
    [key: string]: string | number;
}

export async function getAttritionTrendData(filters: AnalyticsFilters = {}): Promise<AttritionTrendData[]> {
    const supabase = await createClient();

    // 1. Define the time range 
    // Default: Last 12 Months if no filter provided
    const endDate = filters.endDate || new Date();
    const startDate = filters.startDate || subMonths(startOfMonth(endDate), 11);

    // 2. Fetch 'reason_for_leaving' responses
    const { data: responses, error } = await supabase
        .from('exit_interview_results')
        .select('response_value, created_at')
        .eq('question_key', 'reason_for_leaving')
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString())
        .order('created_at', { ascending: true });

    if (error) {
        console.error('Error fetching attrition trend data:', error);
        return [];
    }

    // 3. Aggregate Data
    const aggregation: Record<string, Record<string, number>> = {};
    const allReasons = new Set<string>();

    // Generate all months in the range for the x-axis
    const monthsInInterval = eachMonthOfInterval({
        start: startDate,
        end: endDate
    });

    // Initialize aggregation buckets
    monthsInInterval.forEach(date => {
        const monthKey = format(date, 'MMM yyyy'); // Use Year to differentiate Jan 2024 vs Jan 2025 if range > 1yr
        aggregation[monthKey] = {};
    });

    responses.forEach((row) => {
        // ... (Parsing logic remains the same) ... 
        let reasons: string[] = [];

        if (typeof row.response_value === 'string') {
            if (row.response_value.startsWith('[') || row.response_value.startsWith('"')) {
                try {
                    const parsed = JSON.parse(row.response_value);
                    if (Array.isArray(parsed)) reasons = parsed;
                    else reasons = [parsed];
                } catch (e) {
                    reasons = [row.response_value];
                }
            } else {
                if (row.response_value.includes(',')) {
                    reasons = row.response_value.split(',').map(s => s.trim());
                } else {
                    reasons = [row.response_value];
                }
            }
        } else if (Array.isArray(row.response_value)) {
            reasons = row.response_value;
        }

        const date = parseISO(row.created_at);
        const monthKey = format(date, 'MMM yyyy');

        if (!aggregation[monthKey]) return;

        reasons.forEach((r) => {
            const cleanReason = r.trim().replace(/^"|"$/g, '');
            if (!cleanReason) return;
            allReasons.add(cleanReason);
            aggregation[monthKey][cleanReason] = (aggregation[monthKey][cleanReason] || 0) + 1;
        });
    });

    // 4. Transform to Recharts Array
    const chartData: AttritionTrendData[] = monthsInInterval.map(date => {
        const monthKey = format(date, 'MMM yyyy');
        // shorten label for chart if needed, or keep full
        const displayLabel = format(date, 'MMM');

        const counts = aggregation[monthKey] || {};
        const row: AttritionTrendData = { month: displayLabel }; // Using short label for X-axis

        allReasons.forEach(reason => {
            row[reason] = counts[reason] || 0;
        });
        return row;
    });

    return chartData;
}
