'use server';

import { createClient } from '@/lib/supabase/server';
import { startOfMonth, subMonths, format, parseISO } from 'date-fns';

export interface AttritionTrendData {
    month: string;
    [key: string]: string | number;
}

export async function getAttritionTrendData(): Promise<AttritionTrendData[]> {
    const supabase = await createClient();

    // 1. Define the time range (Last 12 Months)
    const endDate = new Date();
    const startDate = subMonths(startOfMonth(endDate), 11); // Go back 11 months + current = 12

    // 2. Fetch 'reason_for_leaving' responses
    const { data: responses, error } = await supabase
        .from('exit_interview_results')
        .select('response_value, created_at')
        .eq('question_key', 'reason_for_leaving')
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: true });

    if (error) {
        console.error('Error fetching attrition trend data:', error);
        return [];
    }

    // 3. Aggregate Data
    // Structure: { 'Jan 2025': { 'Better Opportunity': 5, 'Salary': 2 }, ... }
    const aggregation: Record<string, Record<string, number>> = {};
    const allReasons = new Set<string>();

    // Initialize all months in the range to ensure continuity (no gaps)
    for (let i = 0; i < 12; i++) {
        const d = subMonths(endDate, 11 - i);
        const monthKey = format(d, 'MMM'); // e.g., "Jan"
        aggregation[monthKey] = {};
    }

    responses.forEach((row) => {
        const date = parseISO(row.created_at);
        const monthKey = format(date, 'MMM');

        if (!aggregation[monthKey]) return; // Should likely not happen if initialized correctly

        let reasons: string[] = [];

        // Handle different JSONB formats (string, array of strings, or JSON string)
        if (typeof row.response_value === 'string') {
            // If it's a simple string like "Better Opportunity"
            if (row.response_value.startsWith('[') || row.response_value.startsWith('"')) {
                try {
                    const parsed = JSON.parse(row.response_value);
                    if (Array.isArray(parsed)) reasons = parsed;
                    else reasons = [parsed];
                } catch (e) {
                    reasons = [row.response_value];
                }
            } else {
                // Comma separated? or just plain text
                if (row.response_value.includes(',')) {
                    reasons = row.response_value.split(',').map(s => s.trim());
                } else {
                    reasons = [row.response_value];
                }
            }
        } else if (Array.isArray(row.response_value)) {
            reasons = row.response_value;
        }

        reasons.forEach((r) => {
            const cleanReason = r.trim().replace(/^"|"$/g, ''); // Remove quotes if present
            if (!cleanReason) return;

            allReasons.add(cleanReason);
            aggregation[monthKey][cleanReason] = (aggregation[monthKey][cleanReason] || 0) + 1;
        });
    });

    // 4. Transform to Recharts Array
    const chartData: AttritionTrendData[] = Object.entries(aggregation).map(([month, counts]) => {
        const row: AttritionTrendData = { month };
        // Ensure all known reasons have a value (0 if missing) - Optional, but good for stacked charts. 
        // For lines, missing might be better as null, but 0 is safer for trends.
        allReasons.forEach(reason => {
            row[reason] = counts[reason] || 0;
        });
        return row;
    });

    // Sort by month order (relying on the initialization order)
    // Actually, object iteration order isn't guaranteed, so let's enforce it
    const sortedChartData = [];
    for (let i = 0; i < 12; i++) {
        const d = subMonths(endDate, 11 - i);
        const monthKey = format(d, 'MMM');
        const dataPoint = chartData.find(d => d.month === monthKey);
        if (dataPoint) sortedChartData.push(dataPoint);
    }

    return sortedChartData;
}
