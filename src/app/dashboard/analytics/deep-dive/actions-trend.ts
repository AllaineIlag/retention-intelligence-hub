'use server';

import { createClient } from '@/lib/supabase/server';
import { subMonths, format, startOfMonth, addMonths, isSameMonth } from 'date-fns';

export interface TrendPoint {
    date: string
    value: number
}

export interface DeptHeatmap {
    name: string
    value: number
    delta: number // change from last month?
}

export interface CorrelationData {
    factor: string
    strength: number // -1 to 1
}

export interface Comment {
    id: string
    text: string
    date: string
    sentiment: 'positive' | 'neutral' | 'negative'
    authorRole?: string
}

export interface MetricHistoryData {
    history: TrendPoint[]
    department: DeptHeatmap[]
    correlation: CorrelationData[]
    comments: Comment[]
}

export async function getMetricHistory(metric: string): Promise<MetricHistoryData> {
    const supabase = await createClient();

    // Map URL metric param to DB question key
    const metricMap: Record<string, string> = {
        'pay': 'rate_of_pay',
        'growth': 'career_growth',
        'benefits': 'benefits',
        'workload': 'workload',
        'recommendation': 'recommendation'
    };
    const dbKey = metricMap[metric] || metric;

    // 1. Fetch History (Last 12 Months)
    // We need resignation dates + values
    const today = new Date();
    const start = subMonths(today, 12);

    const { data: results, error } = await supabase
        .from('exit_interview_results')
        .select(`
            response_value,
            created_at,
            resignation:resignations!inner (
                status,
                last_working_day,
                employee_details ( department )
            )
        `)
        .eq('question_key', dbKey)
        .eq('resignation.status', 'completed')
        .gte('created_at', start.toISOString()); // Approximate filter

    if (error) {
        console.error('Error fetching metric history:', error);
        return { history: [], department: [], correlation: [], comments: [] };
    }

    // ── Process Trend ──
    const monthlyData = new Map<string, { total: number, count: number }>();

    // Init months
    let iter = startOfMonth(start);
    while (iter <= today) {
        monthlyData.set(format(iter, 'MMM yyyy'), { total: 0, count: 0 });
        iter = addMonths(iter, 1);
    }

    results?.forEach((row: any) => {
        const date = new Date(row.resignation?.last_working_day || row.created_at);
        const key = format(date, 'MMM yyyy');

        let score = 0;
        // Simple scoring based on new table structure (JSONB value)
        // Adjust scoring based on metric type if needed, assuming generic 1-5 or similar
        const val = row.response_value;
        const strVal = Array.isArray(val) ? val[0] : String(val);

        // Map string values to numbers (simplified)
        if (strVal.match(/High|Good|Excellent/)) score = 5;
        else if (strVal.match(/Average|Fair|Moderate/)) score = 3;
        else if (strVal.match(/Low|Poor|Bad/)) score = 1;
        else if (!isNaN(Number(strVal))) score = Number(strVal);
        else score = 3; // Default

        if (monthlyData.has(key)) {
            const entry = monthlyData.get(key)!;
            entry.total += score;
            entry.count++;
        }
    });

    const history: TrendPoint[] = Array.from(monthlyData.entries()).map(([date, data]) => ({
        date,
        value: data.count > 0 ? Number((data.total / data.count).toFixed(1)) : 0
    }));

    // ── Process Department Heatmap ──
    const deptMap = new Map<string, { total: number, count: number }>();
    results?.forEach((row: any) => {
        const dept = row.resignation?.employee_details?.department || 'Unknown';
        if (!deptMap.has(dept)) deptMap.set(dept, { total: 0, count: 0 });

        // Re-calculate score (should reuse logic really)
        const val = row.response_value;
        const strVal = Array.isArray(val) ? val[0] : String(val);
        let score = 3;
        if (strVal.match(/High|Good|Excellent/)) score = 5;
        else if (strVal.match(/Average|Fair|Moderate/)) score = 3;
        else if (strVal.match(/Low|Poor|Bad/)) score = 1;
        else if (!isNaN(Number(strVal))) score = Number(strVal);

        const entry = deptMap.get(dept)!;
        entry.total += score;
        entry.count++;
    });

    const department: DeptHeatmap[] = Array.from(deptMap.entries())
        .map(([name, data]) => ({
            name,
            value: data.count > 0 ? Number((data.total / data.count).toFixed(1)) : 0,
            delta: 0 // logic for delta omitted for brevity
        }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 5);

    // ── Mock Correlation & Comments (for MVP) ──
    const correlation: CorrelationData[] = [
        { factor: 'Tenure', strength: 0.65 },
        { factor: 'Department', strength: 0.42 },
        { factor: 'Manager', strength: 0.38 },
        { factor: 'Commute', strength: -0.12 },
    ];

    const comments: Comment[] = []; // Fetch comments later if attached to answers?

    return {
        history,
        department,
        correlation,
        comments
    };
}
