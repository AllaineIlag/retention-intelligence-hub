'use server';

import { createClient } from '@/lib/supabase/server';
import { addDays, format, isWithinInterval, parseISO, subMonths, subDays, differenceInDays, startOfMonth, addMonths, endOfMonth } from 'date-fns';

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
    lowestDriver: PrimaryDriver | null;
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

type ResignationWithDetails = {
    id: string;
    last_working_day: string | null;
    created_at: string;
    status: string;
    employee_details: {
        date_hired: string | null;
        department: string | null;
    } | null;
};


export async function getAnalyticsSummary(filters: AnalyticsFilters = {}) {
    const supabase = await createClient();

    const { data: resignations, error } = await supabase
        .from('resignations')
        .select(`
            *,
            employee_details!inner (
                date_hired,
                department
            )
        `)
        .eq('status', 'completed')
        .returns<ResignationWithDetails[]>();


    if (error) return { success: false, error: error.message };

    const filtered = (resignations as ResignationWithDetails[]).filter(r => {

        // Date Filter
        if (filters.startDate && filters.endDate) {
            const date = parseISO(r.last_working_day || r.created_at);
            if (!isWithinInterval(date, { start: filters.startDate, end: filters.endDate })) {
                return false;
            }
        }

        // Dept Filter
        if (filters.department && filters.department.length > 0) {
            const dept = r.employee_details?.department;
            if (!dept || !filters.department.includes(dept)) return false;
        }


        return true;
    });

    const totalExits = filtered.length;

    // HEADCOUNT Logic: If filtered by department, we should ideally get the headcount for that department.
    // However, for MVP and based on the current schema, we'll use total active employees in that dept or 5000 as fallback.
    let headCount = 5000;
    if (filters.department && filters.department.length > 0) {
        const { count } = await supabase
            .from('employee_details')
            .select('*', { count: 'exact', head: true })
            .in('department', filters.department);
        headCount = count || 1;

    }

    const turnoverRate = (totalExits / headCount) * 100;

    let totalTenureDays = 0;
    let tenureCount = 0;
    filtered.forEach(r => {
        const hired = r.employee_details?.date_hired;

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

    let primaryDriver: PrimaryDriver | null = null;
    let lowestDriver: PrimaryDriver | null = null;
    const resignationIds = filtered.map(r => r.id);

    if (resignationIds.length > 0) {
        const { data: reasons } = await supabase
            .from('exit_interview_results')
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
                    const clean = v.trim().replace(/^"|"$/g, '');
                    if (clean) {
                        counts[clean] = (counts[clean] || 0) + 1;
                        totalReasons++;
                    }
                });
            });

            let maxReason = '';
            let maxCount = 0;
            let minReason = '';
            let minCount = Infinity;

            Object.entries(counts).forEach(([reason, count]) => {
                if (count > maxCount) {
                    maxCount = count;
                    maxReason = reason;
                }
                if (count < minCount) {
                    minCount = count;
                    minReason = reason;
                }
            });

            if (maxCount > 0) {
                primaryDriver = {
                    reason: maxReason,
                    count: maxCount,
                    percentage: Math.round((maxCount / totalReasons) * 100)
                };
            }
            if (minCount !== Infinity && totalReasons > 0) {
                lowestDriver = {
                    reason: minReason,
                    count: minCount,
                    percentage: Math.round((minCount / totalReasons) * 100)
                };
            }
        }
    }

    return {
        success: true,
        data: {
            totalExits,
            turnoverRate,
            avgTenureMonths,
            voluntaryExits: totalExits,
            primaryDriver,
            lowestDriver
        }
    };
}

export async function getCountryStats(filters: AnalyticsFilters = {}) {
    const supabase = await createClient();

    const { data: resignations, error: resError } = await supabase
        .from('resignations')
        .select(`
            id,
            status,
            last_working_day,
            created_at,
            employee_details!inner (
                department
            )
        `)

        .eq('status', 'completed');

    if (resError) return { success: false, error: resError.message };

    const relevantIds = new Set<string>();
    resignations?.forEach((r: any) => {
        if (filters.startDate && filters.endDate) {
            const date = parseISO(r.last_working_day || r.created_at);
            if (!isWithinInterval(date, { start: filters.startDate, end: filters.endDate })) return;
        }
        if (filters.department && filters.department.length > 0) {
            const dept = r.employee_details?.department;
            if (!dept || !filters.department.includes(dept)) return;
        }
        relevantIds.add(r.id);
    });



    if (relevantIds.size === 0) return { success: true, data: [] };

    const { data: results, error: resultsError } = await supabase
        .from('exit_interview_results')
        .select('response_value')
        .in('resignation_id', Array.from(relevantIds))
        .eq('question_key', 'reason_for_leaving_country');

    if (resultsError) return { success: false, error: resultsError.message };

    const counts: Record<string, number> = {};
    results.forEach(row => {
        const val = row.response_value;
        const country = Array.isArray(val) ? val[0] : String(val);
        if (country) {
            counts[country] = (counts[country] || 0) + 1;
        }
    });

    const chartData = Object.entries(counts)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 5);

    return { success: true, data: chartData };
}

export async function getTurnoverTrends(filters: AnalyticsFilters = {}) {
    const supabase = await createClient();

    const { data: resignations, error } = await supabase
        .from('resignations')
        .select(`
            last_working_day, 
            created_at, 
            status,
            employee_details!inner (
                department
            )
        `)
        .eq('status', 'completed');

    if (error) return { success: false, error: error.message };

    // Determine Date Range
    const today = filters.endDate || new Date();
    const start = filters.startDate || subMonths(today, 5);

    // Initialize Map with 0 for all months in range
    const monthlyStats = new Map<string, number>();
    let currentIter = startOfMonth(start); // Normalize to start of month
    while (currentIter <= today) {
        const key = format(currentIter, 'MMM yyyy');
        if (!monthlyStats.has(key)) {
            monthlyStats.set(key, 0);
        }
        currentIter = addMonths(currentIter, 1);
    }

    // Filter and Count
    resignations?.forEach((r: any) => {
        // Department Filter
        if (filters.department && filters.department.length > 0) {
            const dept = r.employee_details?.department;
            if (!dept || !filters.department.includes(dept)) return;
        }

        const date = parseISO(r.last_working_day || r.created_at);
        if (isWithinInterval(date, { start, end: today })) {
            const key = format(date, 'MMM yyyy');
            if (monthlyStats.has(key)) {
                monthlyStats.set(key, (monthlyStats.get(key) || 0) + 1);
            }
        }
    });

    // Convert to Array (Map preserves insertion order if we initialized chronologically)
    const chartData = Array.from(monthlyStats.entries()).map(([name, resignations]) => ({
        name,
        resignations,
        retention: 100 // Placemarker for now
    }));

    return { success: true, data: chartData };
}

export async function getDepartmentBreakdown(filters: AnalyticsFilters = {}) {
    const supabase = await createClient();

    const { data: resignations, error } = await supabase
        .from('resignations')
        .select(`
            status,
            last_working_day,
            created_at,
            employee_details!inner (
                department
            )
        `)
        .eq('status', 'completed')
        .returns<ResignationWithDetails[]>();


    if (error) return { success: false, error: error.message };

    const deptCounts: Record<string, number> = {};

    resignations.forEach(r => {
        if (filters.startDate && filters.endDate) {
            const date = parseISO(r.last_working_day || r.created_at);
            if (!isWithinInterval(date, { start: filters.startDate, end: filters.endDate })) {
                return;
            }
        }

        const dept = r.employee_details?.department || 'Unknown';
        // If we are filtering by specific depts, only count those
        if (filters.department && filters.department.length > 0) {
            if (filters.department.includes(dept)) {

                deptCounts[dept] = (deptCounts[dept] || 0) + 1;
            }
        } else {
            deptCounts[dept] = (deptCounts[dept] || 0) + 1;
        }
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

export async function getExitQuestionStats(filters: AnalyticsFilters = {}) {
    const supabase = await createClient();

    const { data: resignations, error: resError } = await supabase
        .from('resignations')
        .select(`
            id,
            status,
            last_working_day,
            created_at,
            employee_details!inner (
                department
            )
        `)

        .eq('status', 'completed');

    if (resError) return { success: false, error: resError.message };

    const relevantIds = new Set<string>();

    resignations.forEach((r: any) => {
        if (filters.startDate && filters.endDate) {
            const date = parseISO(r.last_working_day || r.created_at);
            if (!isWithinInterval(date, { start: filters.startDate, end: filters.endDate })) return;
        }
        if (filters.department && filters.department.length > 0) {
            const dept = r.employee_details?.department;
            if (!dept || !filters.department.includes(dept)) return;
        }

        relevantIds.add(r.id);
    });

    if (relevantIds.size === 0) {
        return { success: true, data: [] };
    }

    const { data: results, error: resultsError } = await supabase
        .from('exit_interview_results')
        .select('*')
        .in('resignation_id', Array.from(relevantIds));

    if (resultsError) return { success: false, error: resultsError.message };

    const aggregation: Record<string, Record<string, number>> = {};
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
            aggregation[key][val] = (aggregation[key][val] || 0) + 1;
        });
    });

    const finalStats: QuestionStats[] = Object.entries(aggregation).map(([key, counts]) => {
        const stats = Object.entries(counts).map(([name, value]) => ({ name, value }));
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
    date: string;
    current: number;
    previous: number;
    fullDateCurrent: string;
    fullDatePrevious: string;
};

export async function getTurnoverComparison(filters: AnalyticsFilters = {}) {
    const supabase = await createClient();

    const today = filters.endDate || new Date();
    const currentStart = filters.startDate || subDays(today, 30);
    const durationDays = differenceInDays(today, currentStart) + 1;

    const previousEnd = subDays(currentStart, 1);
    const previousStart = subDays(previousEnd, durationDays - 1);

    const { data: resignations, error } = await supabase
        .from('resignations')
        .select(`
            last_working_day, 
            created_at, 
            status,
            employee_details!inner (
                department
            )
        `)

        .eq('status', 'completed');

    if (error) return { success: false, error: error.message };

    const comparisonMap: Record<number, { current: number, previous: number, currentDate: Date, prevDate: Date }> = {};

    for (let i = 0; i < durationDays; i++) {
        comparisonMap[i] = {
            current: 0,
            previous: 0,
            currentDate: addDays(currentStart, i),
            prevDate: addDays(previousStart, i)
        };
    }

    resignations.forEach(r => {
        if (filters.department && filters.department.length > 0) {
            const dept = (r as any).employee_details?.department;
            if (!dept || !filters.department.includes(dept)) return;
        }


        const date = parseISO(r.last_working_day || r.created_at);

        if (isWithinInterval(date, { start: currentStart, end: today })) {
            const dayIndex = differenceInDays(date, currentStart);
            if (comparisonMap[dayIndex]) comparisonMap[dayIndex].current++;
        }

        if (isWithinInterval(date, { start: previousStart, end: previousEnd })) {
            const dayIndex = differenceInDays(date, previousStart);
            if (comparisonMap[dayIndex]) comparisonMap[dayIndex].previous++;
        }
    });

    const chartData: ComparisonDataPoint[] = Object.values(comparisonMap).map((bucket, index) => {
        let label = `Day ${index + 1}`;
        if (durationDays <= 31) {
            label = format(bucket.currentDate, 'MMM d');
        } else if (bucket.currentDate.getDate() === 1) {
            label = format(bucket.currentDate, 'MMM');
        } else {
            label = '';
        }

        return {
            date: label,
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
            currentLabel: `${format(currentStart, 'MMM d')} - ${format(today, 'MMM d')}`,
            previousLabel: `${format(previousStart, 'MMM d')} - ${format(previousEnd, 'MMM d')}`
        }
    };
}
