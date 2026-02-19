'use server';

import { createClient } from '@/lib/supabase/server';
import { startOfMonth, subMonths, format, parseISO, subDays, startOfYear, endOfMonth } from 'date-fns';
import { AnalyticsFilters } from '@/app/actions/analytics';

export interface ScoreTrendData {
    month: string;
    average: number;
}

export interface MultiSeriesTrendData {
    month: string;
    [key: string]: string | number; // options as keys
}

export interface DepartmentScoreData {
    department: string;
    score: number;
    count: number;
}

export interface CorrelationData {
    topReason: string;
    percentage: number;
    totalLowScorers: number;
    insight: string;
}

// 1. Trend Intelligence: Multi-Series Option Trend
export async function getMultiSeriesTrendData(questionKey: string, options: string[], filters: AnalyticsFilters = {}): Promise<MultiSeriesTrendData[]> {
    const supabase = await createClient();

    // Default to 12 months if no filters
    const endDate = filters.endDate || new Date();
    const startDate = filters.startDate || subMonths(endDate, 12);
    const startDateStr = startDate.toISOString();
    const endDateStr = endDate.toISOString();

    const { data, error } = await supabase
        .from('exit_interview_results')
        .select(`
            response_value,
            created_at
        `)
        .eq('question_key', questionKey)
        .gte('created_at', startDateStr)
        .lte('created_at', endDateStr)
        .order('created_at', { ascending: true });

    if (error) {
        console.error(`Error fetching multi-trend for ${questionKey}:`, error);
        return [];
    }

    // Initialize map with all months in range
    // We'll iterate by month from start to end
    const monthlyMap = new Map<string, Record<string, number>>();
    let iterDate = startOfMonth(startDate);
    const stopDate = endOfMonth(endDate);

    while (iterDate <= stopDate) {
        const monthKey = format(iterDate, 'MMM yyyy');

        // Initialize counts for ALL options to 0
        const initialCounts: Record<string, number> = {};
        options.forEach(opt => initialCounts[opt] = 0);

        monthlyMap.set(monthKey, initialCounts);

        // Next month
        iterDate = new Date(iterDate.getFullYear(), iterDate.getMonth() + 1, 1);
    }

    // Tally data
    data.forEach(row => {
        const monthKey = format(parseISO(row.created_at), 'MMM yyyy');
        if (monthlyMap.has(monthKey)) {
            const counts = monthlyMap.get(monthKey)!;

            // Clean response value
            let val = row.response_value;
            if (typeof val === 'string') {
                val = val.replace(/[\[\]"]/g, '').trim();
            }

            // Normalize for matching
            const matchedOption = options.find(opt => opt.toLowerCase() === val.toLowerCase());

            if (matchedOption) {
                counts[matchedOption] += 1;
            }
        }
    });

    // Convert to Array
    return Array.from(monthlyMap.entries()).map(([month, counts]) => ({
        month,
        ...counts
    }));
}

// 1b. Legacy Score Trend (Keeping for reference or fallback)
export async function getScoreTrendData(questionKey: string): Promise<ScoreTrendData[]> {
    // Legacy: Keep default 12m for now, or update if used. Assuming unused based on request focus.
    const supabase = await createClient();
    const endDate = new Date();
    const startDate = subMonths(endDate, 12);
    const startDateStr = startDate.toISOString();

    const { data, error } = await supabase
        .from('exit_interview_results')
        .select(`
            response_value,
            created_at
        `)
        .eq('question_key', questionKey)
        .gte('created_at', startDateStr)
        .order('created_at', { ascending: true });

    if (error) {
        console.error(`Error fetching score trend for ${questionKey}:`, error);
        return [];
    }

    const monthlyData = new Map<string, { total: number; count: number }>();

    for (let i = 11; i >= 0; i--) {
        const d = subMonths(new Date(), i);
        const key = format(d, 'MMM yyyy');
        monthlyData.set(key, { total: 0, count: 0 });
    }

    data.forEach(row => {
        const score = mapResponseToScore(row.response_value);
        if (score === 0) return;

        const monthKey = format(parseISO(row.created_at), 'MMM yyyy');
        if (monthlyData.has(monthKey)) {
            const entry = monthlyData.get(monthKey)!;
            entry.total += score;
            entry.count += 1;
        }
    });

    return Array.from(monthlyData.entries()).map(([month, stats]) => ({
        month,
        average: stats.count > 0 ? Number((stats.total / stats.count).toFixed(1)) : 0
    }));
}

// 2. Department Intelligence: Average Score by Department
export async function getDepartmentScoreData(questionKey: string, filters: AnalyticsFilters = {}): Promise<DepartmentScoreData[]> {
    const supabase = await createClient();

    const endDate = filters.endDate || new Date();
    const startDate = filters.startDate || subMonths(endDate, 12);
    const startDateStr = startDate.toISOString();
    const endDateStr = endDate.toISOString();

    // Join with resignations -> profiles -> employee_details
    // Using created_at from exit_interview_results as the filter
    const { data, error } = await supabase
        .from('exit_interview_results')
        .select(`
            response_value,
            created_at,
            resignation:resignation_id (
                employee_id,
                profiles:profiles!resignations_employee_id_fkey (
                    employee_details (
                        department
                    )
                )
            )
        `)
        .eq('question_key', questionKey)
        .gte('created_at', startDateStr)
        .lte('created_at', endDateStr);

    if (error) {
        console.error(`Error fetching dept scores for ${questionKey}:`, error);
        return [];
    }

    const deptStats = new Map<string, { total: number; count: number }>();

    data.forEach((row: any) => {
        const score = mapResponseToScore(row.response_value);
        if (score === 0) return;

        // Navigate nested join
        const resignation = Array.isArray(row.resignation) ? row.resignation[0] : row.resignation;
        const profile = resignation?.profiles;
        const pObj = Array.isArray(profile) ? profile[0] : profile;
        const details = pObj?.employee_details;
        const dObj = Array.isArray(details) ? details[0] : details;

        const dept = dObj?.department || 'Unknown';

        // Apply Dept Filter if present
        if (filters.department && filters.department.length > 0) {
            if (!filters.department.includes(dept)) return;
        }

        if (!deptStats.has(dept)) {
            deptStats.set(dept, { total: 0, count: 0 });
        }
        const entry = deptStats.get(dept)!;
        entry.total += score;
        entry.count += 1;
    });

    return Array.from(deptStats.entries())
        .map(([department, stats]) => ({
            department,
            score: Number((stats.total / stats.count).toFixed(1)),
            count: stats.count
        }))
        .sort((a, b) => a.score - b.score); // Ascending (worst first)
}

// 3. Root Cause Intelligence: Correlation with Exit Reason
export async function getCorrelationData(scoreQuestionKey: string, filters: AnalyticsFilters = {}): Promise<CorrelationData> {
    const supabase = await createClient();

    const endDate = filters.endDate || new Date();
    const startDate = filters.startDate || subMonths(endDate, 12);
    const startDateStr = startDate.toISOString();
    const endDateStr = endDate.toISOString();

    // Fetch BOTH the specified question AND the reason_for_leaving for the SAME resignation
    // Filter by created_at
    const { data, error } = await supabase
        .from('exit_interview_results')
        .select('resignation_id, question_key, response_value, created_at')
        .in('question_key', [scoreQuestionKey, 'reason_for_leaving'])
        .gte('created_at', startDateStr)
        .lte('created_at', endDateStr);

    if (error) {
        console.error(`Error fetching correlation for ${scoreQuestionKey}:`, error);
        return { topReason: 'N/A', percentage: 0, totalLowScorers: 0, insight: 'No data available' };
    }

    // Group by Resignation ID
    const grouped = new Map<string, { score: number; reasons: string[] }>();

    data.forEach(row => {
        if (!grouped.has(row.resignation_id)) {
            grouped.set(row.resignation_id, { score: 0, reasons: [] });
        }
        const entry = grouped.get(row.resignation_id)!;

        // Clean response value
        let val = row.response_value;
        if (typeof val === 'string') {
            val = val.replace(/[\[\]"]/g, '').replace(/\\"/g, ''); // Basic cleaning
        }

        if (row.question_key === 'reason_for_leaving') {
            if (Array.isArray(val)) {
                entry.reasons.push(...val);
            } else if (typeof val === 'string') {
                // Split by comma if looks like CSV, otherwise treat as single
                if (val.includes(',')) {
                    entry.reasons.push(...val.split(',').map(s => s.trim()));
                } else {
                    entry.reasons.push(val);
                }
            }
        } else if (row.question_key === scoreQuestionKey) {
            entry.score = mapResponseToScore(row.response_value);
        }
    });

    // Filter for Low Scorers (1 or 2)
    const lowScorers = Array.from(grouped.values()).filter(x => x.score > 0 && x.score <= 2);
    const totalLowScorers = lowScorers.length;

    if (totalLowScorers === 0) {
        return { topReason: 'N/A', percentage: 0, totalLowScorers: 0, insight: 'No negative feedback detected.' };
    }

    // Count Reasons within Low Scorers
    const reasonCounts = new Map<string, number>();
    lowScorers.forEach(x => {
        x.reasons.forEach(r => {
            const cleanReason = r.trim().replace(/^"|"$/g, ''); // Remove wrapping quotes
            reasonCounts.set(cleanReason, (reasonCounts.get(cleanReason) || 0) + 1);
        });
    });

    // Find Top Reason
    let topReason = '';
    let maxCount = 0;
    reasonCounts.forEach((count, reason) => {
        if (count > maxCount) {
            maxCount = count;
            topReason = reason;
        }
    });

    const percentage = Math.round((maxCount / totalLowScorers) * 100);

    return {
        topReason,
        percentage,
        totalLowScorers,
        insight: `${percentage}% of users who rated this 'Low' listed '${topReason}' as a reason for leaving.`
    };
}


// Helper: Map text responses to 1-5 score
function mapResponseToScore(value: any): number {
    if (typeof value !== 'string') return 0;

    // Convert JSON string logic if needed, but assuming raw text here
    const v = value.toLowerCase().replace(/[\[\]"]/g, '');

    const map: Record<string, number> = {
        // Career
        'very good chance': 5,
        'good chances': 4,
        'neutral': 3,
        'little chances': 2,
        'very little': 1,
        'no chances': 1,

        // Pay
        'very compensating': 5,
        'fair enough': 4,
        'a bit low': 2,
        'very low': 1,

        // Benefits
        'very satisfied': 5,
        'satisfied': 4,
        'dissatisfied': 2,
        'very dissatisfied': 1,

        // Workload
        'very manageable': 5,
        'manageable': 4,
        'heavy': 2,
        'very heavy': 1,

        // Recommendation (NPS-ish)
        'yes': 5,
        'no': 1
    };

    // Partial match if needed, or direct
    if (map[v]) return map[v];

    // Fallback: Check substring for robustness
    if (v.includes('very good') || v.includes('very satisfied') || v.includes('very manageable')) return 5;
    if (v.includes('good') || v.includes('satisfied') || v.includes('manageable') || v.includes('fair')) return 4;
    if (v.includes('neutral')) return 3;
    if (v.includes('bit low') || v.includes('dissatisfied') || v.includes('heavy') || v.includes('little')) return 2;
    if (v.includes('very low') || v.includes('very dissatisfied') || v.includes('very heavy') || v.includes('no')) return 1;

    return 0; // Unknown
}
