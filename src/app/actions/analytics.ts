'use server';

import { createClient } from '@/lib/supabase/server';
import { addDays, format, isWithinInterval, parseISO, subMonths, eachDayOfInterval, eachMonthOfInterval, startOfMonth, endOfMonth, subDays, differenceInDays } from 'date-fns';

export type AnalyticsFilters = {
    startDate?: Date;
    endDate?: Date;
    department?: string[]; // Empty means all
};

export type AnalyticsSummary = {
    totalExits: number;
    turnoverRate: number;
    avgTenureMonths: number;
    voluntaryExits: number;
    primaryDriver: PrimaryDriver | null;
};

export type TurnoverDataPoint = {
    name: string;
    value: number;
};

export type PrimaryDriver = {
    reason: string;
    percentage: number;
    count: number;
};

// Define a type for the joined query result
type ResignationWithProfile = {
    id: string; // Added ID for joins
    last_working_day: string | null;
    created_at: string;
    status: string;
    profiles: {
        date_hired: string | null;
        department: string | null;
    } | null; // Supabase returns single object for !employee_id
};

export async function getAnalyticsSummary(filters: AnalyticsFilters) {
    const supabase = await createClient();

    const { data: resignations, error } = await supabase
        .from('resignations')
        .select(`
            *,
            profiles!employee_id (
                date_hired,
                department
            )
        `)
        .in('status', ['completed', 'approved', 'verified', 'scheduled'])
        .returns<ResignationWithProfile[]>();

    if (error) return { error: error.message };

    const filtered = resignations.filter(r => {
        // Date Filter
        if (filters.startDate && filters.endDate) {
            const date = parseISO(r.last_working_day || r.created_at);
            if (!isWithinInterval(date, { start: filters.startDate, end: filters.endDate })) {
                return false;
            }
        }

        // Dept Filter
        if (filters.department && filters.department.length > 0) {
            const dept = r.profiles?.department;
            if (!dept || !filters.department.includes(dept)) return false;
        }

        return true;
    });

    const totalExits = filtered.length;
    const HEADCOUNT = 5000;
    const turnoverRate = (totalExits / HEADCOUNT) * 100;

    let totalTenureDays = 0;
    let tenureCount = 0;
    filtered.forEach(r => {
        const hired = r.profiles?.date_hired;
        const left = r.last_working_day || r.created_at;
        if (hired && left) {
            const start = parseISO(hired);
            const end = parseISO(left);
            const diffTime = Math.abs(end.getTime() - start.getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            totalTenureDays += diffDays;
            tenureCount++;
        }
    });
    const avgTenureMonths = tenureCount > 0 ? Math.round((totalTenureDays / tenureCount) / 30 * 10) / 10 : 0;

    // --- PRIMARY DRIVER (The 'Why') ---
    let primaryDriver: PrimaryDriver | null = null;
    const resignationIds = filtered.map(r => r.id);

    if (resignationIds.length > 0) {
        // Fetch reasons for visible resignations
        const { data: reasons } = await supabase
            .from('exit_questionnaire_results')
            .select('response_value')
            .in('resignation_id', resignationIds)
            .eq('question_key', 'reason_for_leaving');

        if (reasons && reasons.length > 0) {
            const counts: Record<string, number> = {};
            let totalReasons = 0;

            reasons.forEach(r => {
                const val = r.response_value;
                const values = Array.isArray(val) ? val : [String(val)];
                values.forEach((v: string) => {
                    counts[v] = (counts[v] || 0) + 1;
                    totalReasons++;
                });
            });

            // Find max
            let maxReason = '';
            let maxCount = 0;
            Object.entries(counts).forEach(([reason, count]) => {
                if (count > maxCount) {
                    maxCount = count;
                    maxReason = reason;
                }
            });

            if (maxCount > 0) {
                primaryDriver = {
                    reason: maxReason,
                    count: maxCount,
                    percentage: Math.round((maxCount / totalReasons) * 100)
                };
            }
        }
    }

    return {
        success: true,
        data: {
            totalExits,
            turnoverRate, // Calculated against 5000 headcount
            avgTenureMonths,
            voluntaryExits: totalExits,
            primaryDriver
        }
    };
}

export async function getCountryStats(filters: AnalyticsFilters) {
    const supabase = await createClient();

    // 1. Get relevant resignation IDs
    const { data: resignations, error: resError } = await supabase
        .from('resignations')
        .select(`
            id,
            status,
            last_working_day,
            created_at,
            profiles!employee_id (
                department
            )
        `)
        .in('status', ['completed', 'approved', 'verified', 'scheduled']);

    if (resError) return { error: resError.message };

    const relevantIds = new Set<string>();
    resignations?.forEach((r: any) => {
        // Date Filter
        if (filters.startDate && filters.endDate) {
            const date = parseISO(r.last_working_day || r.created_at);
            if (!isWithinInterval(date, { start: filters.startDate, end: filters.endDate })) return;
        }
        // Dept Filter
        if (filters.department && filters.department.length > 0) {
            const dept = r.profiles?.department;
            if (!dept || !filters.department.includes(dept)) return;
        }
        relevantIds.add(r.id);
    });

    if (relevantIds.size === 0) return { success: true, data: [] };

    // 2. Fetch country answers
    const { data: results, error: resultsError } = await supabase
        .from('exit_questionnaire_results')
        .select('response_value')
        .in('resignation_id', Array.from(relevantIds))
        .eq('question_key', 'reason_for_leaving_country');

    if (resultsError) return { error: resultsError.message };

    // 3. Aggregate
    const counts: Record<string, number> = {};
    results.forEach(row => {
        const val = row.response_value;
        const country = Array.isArray(val) ? val[0] : String(val); // Should be single value
        if (country) {
            counts[country] = (counts[country] || 0) + 1;
        }
    });

    // 4. Top 5
    const chartData = Object.entries(counts)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 5);

    return { success: true, data: chartData };
}

export async function getTurnoverTrends(filters: AnalyticsFilters) {
    const supabase = await createClient();

    // We only need dates for trends
    const { data: resignations, error } = await supabase
        .from('resignations')
        .select('last_working_day, created_at, status')
        .in('status', ['completed', 'approved', 'verified', 'scheduled']);

    if (error) return { error: error.message };

    const monthlyStats: Record<string, number> = {};

    for (let i = 5; i >= 0; i--) {
        const d = subMonths(new Date(), i);
        const key = format(d, 'MMM yyyy');
        monthlyStats[key] = 0;
    }

    resignations.forEach(r => {
        const date = parseISO(r.last_working_day || r.created_at);

        if (filters.startDate && filters.endDate) {
            if (!isWithinInterval(date, { start: filters.startDate, end: filters.endDate })) return;
        }

        const key = format(date, 'MMM yyyy');
        if (monthlyStats[key] !== undefined) {
            monthlyStats[key]++;
        }
    });

    const chartData: TurnoverDataPoint[] = Object.entries(monthlyStats).map(([name, value]) => ({
        name,
        value
    }));

    return { success: true, data: chartData };
}

export async function getDepartmentBreakdown(filters: AnalyticsFilters) {
    const supabase = await createClient();

    const { data: resignations, error } = await supabase
        .from('resignations')
        .select(`
            status,
            last_working_day,
            created_at,
            profiles!employee_id (
                department
            )
        `)
        .in('status', ['completed', 'approved', 'verified', 'scheduled'])
        .returns<ResignationWithProfile[]>();

    if (error) return { error: error.message };

    const deptCounts: Record<string, number> = {};

    resignations.forEach(r => {
        if (filters.startDate && filters.endDate) {
            const date = parseISO(r.last_working_day || r.created_at);
            if (!isWithinInterval(date, { start: filters.startDate, end: filters.endDate })) {
                return;
            }
        }

        const dept = r.profiles?.department || 'Unknown';
        deptCounts[dept] = (deptCounts[dept] || 0) + 1;
    });

    const chartData: TurnoverDataPoint[] = Object.entries(deptCounts)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value);

    return { success: true, data: chartData };
}

export type QuestionStats = {
    question_key: string;
    stats: TurnoverDataPoint[];
    totalResponses: number;
};

export async function getExitQuestionStats(filters: AnalyticsFilters) {
    const supabase = await createClient();

    // 1. Get relevant resignation IDs first based on filters
    let query = supabase
        .from('resignations')
        .select(`
            id,
            status,
            last_working_day,
            created_at,
            profiles!employee_id (
                department
            )
        `)
        .in('status', ['completed', 'approved', 'verified', 'scheduled']);

    const { data: resignations, error: resError } = await query;

    if (resError) return { error: resError.message };

    // Apply memory filtering for dates/department (slower but simpler for now than complex SQL joins)
    // TODO: Optimize with exact SQL query later if scale increases
    const relevantIds = new Set<string>();

    resignations.forEach((r: any) => {
        // Date Filter
        if (filters.startDate && filters.endDate) {
            const date = parseISO(r.last_working_day || r.created_at);
            if (!isWithinInterval(date, { start: filters.startDate, end: filters.endDate })) {
                return;
            }
        }

        // Dept Filter
        if (filters.department && filters.department.length > 0) {
            const dept = r.profiles?.department;
            if (!dept || !filters.department.includes(dept)) return;
        }

        relevantIds.add(r.id);
    });

    if (relevantIds.size === 0) {
        return { success: true, data: [] };
    }

    // 2. Fetch results for these resignations
    const { data: results, error: resultsError } = await supabase
        .from('exit_questionnaire_results')
        .select('*')
        .in('resignation_id', Array.from(relevantIds));

    if (resultsError) return { error: resultsError.message };

    // 3. Aggregate
    const aggregation: Record<string, Record<string, number>> = {};

    // Initialize standard keys to ensure they exist even if empty (optional, but good for UI)
    const standardKeys = [
        'reason_for_leaving', 'why_more_desirable', 'career_growth',
        'rate_of_pay', 'benefits', 'workload', 'recommendation'
    ];
    standardKeys.forEach(k => aggregation[k] = {});

    results.forEach(row => {
        const key = row.question_key;
        if (!aggregation[key]) aggregation[key] = {};

        const values = Array.isArray(row.response_value) ? row.response_value : [row.response_value];

        values.forEach((val: string) => {
            // Normalize value (some might be JSON strings)
            const label = val;
            aggregation[key][label] = (aggregation[key][label] || 0) + 1;
        });
    });

    // 4. Format for Frontend
    const finalStats: QuestionStats[] = Object.entries(aggregation).map(([key, counts]) => {
        const stats = Object.entries(counts).map(([name, value]) => ({ name, value }));
        // Sort by value desc
        stats.sort((a, b) => b.value - a.value);

        const totalResponses = stats.reduce((acc, curr) => acc + curr.value, 0);

        return {
            question_key: key,
            stats,
            totalResponses
        };
    });

    return { success: true, data: finalStats };
}
export type ComparisonDataPoint = {
    date: string; // Display label (e.g., "Day 1", "Jan")
    current: number;
    previous: number;
    fullDateCurrent: string; // Tooltip context
    fullDatePrevious: string; // Tooltip context
};

export async function getTurnoverComparison(filters: AnalyticsFilters) {
    const supabase = await createClient();

    // 1. Determine Ranges
    const today = new Date();
    // Default to last 30 days if no filter
    const currentEnd = filters.endDate || today;
    const currentStart = filters.startDate || subDays(today, 30);

    const durationDays = differenceInDays(currentEnd, currentStart) + 1;

    // Previous range is immediately preceding
    const previousEnd = subDays(currentStart, 1);
    const previousStart = subDays(previousEnd, durationDays - 1);

    // 2. Fetch ALL resignations (completed/scheduled)
    // Optimization: In a real app, filtering by DB date range would be better, 
    // but we need to cover a wide potential range for 'previous' without complex OR queries.
    // Given the scale, fetching status=approved/etc is fine for now.
    const { data: resignations, error } = await supabase
        .from('resignations')
        .select('last_working_day, created_at, status')
        .in('status', ['completed', 'approved', 'verified', 'scheduled']);

    if (error) return { error: error.message };

    // 3. Bucket Data
    // We normalize by "Day Index" (0 to durationDays-1)
    const comparisonMap: Record<number, { current: number, previous: number, currentDate: Date, prevDate: Date }> = {};

    // Initialize buckets
    for (let i = 0; i < durationDays; i++) {
        comparisonMap[i] = {
            current: 0,
            previous: 0,
            currentDate: addDays(currentStart, i),
            prevDate: addDays(previousStart, i)
        };
    }

    resignations.forEach(r => {
        const date = parseISO(r.last_working_day || r.created_at);

        // Check Current Range
        if (isWithinInterval(date, { start: currentStart, end: currentEnd })) {
            const dayIndex = differenceInDays(date, currentStart);
            if (comparisonMap[dayIndex]) comparisonMap[dayIndex].current++;
        }

        // Check Previous Range
        if (isWithinInterval(date, { start: previousStart, end: previousEnd })) {
            const dayIndex = differenceInDays(date, previousStart);
            if (comparisonMap[dayIndex]) comparisonMap[dayIndex].previous++;
        }
    });

    // 4. Format Output
    // If duration > 60 days, maybe aggregate by week/month? 
    // For now, let's keep it daily but formatted nicely.
    // If > 90 days, we could aggregate, but "Day 1..90" is readable enough on a chart.

    const chartData: ComparisonDataPoint[] = Object.values(comparisonMap).map((bucket, index) => {
        let label = `Day ${index + 1}`;

        // Smart Labels
        if (durationDays <= 31) {
            label = format(bucket.currentDate, 'MMM d');
        } else {
            // For long ranges, show month name on the 1st
            if (bucket.currentDate.getDate() === 1) {
                label = format(bucket.currentDate, 'MMM');
            } else {
                label = ''; // Hide label to avoid clutter, tickFormatter will handle or tooltip
            }
        }

        return {
            date: label, // This might need refining for the XAxis ticks
            current: bucket.current,
            previous: bucket.previous,
            fullDateCurrent: format(bucket.currentDate, 'MMM d, yyyy'),
            fullDatePrevious: format(bucket.prevDate, 'MMM d, yyyy'),
        };
    });

    return {
        success: true,
        data: chartData,
        meta: {
            currentLabel: `${format(currentStart, 'MMM d')} - ${format(currentEnd, 'MMM d')}`,
            previousLabel: `${format(previousStart, 'MMM d')} - ${format(previousEnd, 'MMM d')}`
        }
    };
}
