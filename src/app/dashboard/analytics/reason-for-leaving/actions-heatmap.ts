'use server';

import { createClient } from '@/lib/supabase/server';

import { AnalyticsFilters } from '@/app/actions/analytics';
import { subMonths } from 'date-fns';

export interface DepartmentClusterData {
    department: string;
    totalCount: number;
    [reason: string]: number | string; // Dynamic keys for reasons
}

export async function getDepartmentClusterData(filters: AnalyticsFilters = {}): Promise<DepartmentClusterData[]> {
    const supabase = await createClient();

    const endDate = filters.endDate ? filters.endDate.toISOString() : new Date().toISOString();
    const startDate = filters.startDate ? filters.startDate.toISOString() : subMonths(new Date(), 12).toISOString();

    // Join via directory_id → company_directory for department
    const { data: resignations, error } = await supabase
        .from('resignations')
        .select(`
            id,
            company_directory (
                department
            ),
            exit_interview_results (
                question_key,
                response_value
            )
        `)
        .neq('status', 'cancelled')
        .gte('created_at', startDate)
        .lte('created_at', endDate);

    // Filter logic
    // We do in-memory filtering for department since we already fetch it in the join
    // and the result set is relatively small (hundreds, not millions).
    const filterDepts = filters.department && filters.department.length > 0 ? new Set(filters.department) : null;

    if (error) {
        console.error('Error fetching department cluster data:', error);
        return [];
    }

    // Aggregation Structure: { "Sales": { "Better Pay": 5, "Workload": 2 }, "Engineering": { ... } }
    const aggregation: Record<string, Record<string, number>> = {};
    const allReasons = new Set<string>();

    resignations.forEach((row: any) => {
        // 1. Get Department
        const details = Array.isArray(row.company_directory) ? row.company_directory[0] : row.company_directory;
        const dept = details?.department || 'Unknown';

        // Apply Department Filter
        if (filterDepts && !filterDepts.has(dept)) {
            return;
        }

        if (!aggregation[dept]) aggregation[dept] = {};

        // 2. Get Reason(s)
        const reasonResults = Array.isArray(row.exit_interview_results) ? row.exit_interview_results : [row.exit_interview_results];

        // Filter for 'reason_for_leaving' question
        const reasonEntry = reasonResults.find((r: any) => r && r.question_key === 'reason_for_leaving');

        if (reasonEntry) {
            let reasons: string[] = [];
            // Handle different JSONB formats (string, array, JSON string)
            const val = reasonEntry.response_value;

            if (typeof val === 'string') {
                if (val.startsWith('[') || val.startsWith('\"')) {
                    try {
                        const parsed = JSON.parse(val);
                        if (Array.isArray(parsed)) reasons = parsed;
                        else reasons = [parsed];
                    } catch (e) {
                        reasons = [val];
                    }
                } else {
                    if (val.includes(',')) {
                        reasons = val.split(',').map((s: string) => s.trim());
                    } else {
                        reasons = [val];
                    }
                }
            } else if (Array.isArray(val)) {
                reasons = val;
            }

            reasons.forEach((r) => {
                const cleanReason = r.trim().replace(/^\"|\"$/g, '');
                if (!cleanReason) return;

                allReasons.add(cleanReason);
                aggregation[dept][cleanReason] = (aggregation[dept][cleanReason] || 0) + 1;
            });
        } else {
            // No reason recorded
            const unknownReason = "Not Specified";
            allReasons.add(unknownReason);
            aggregation[dept][unknownReason] = (aggregation[dept][unknownReason] || 0) + 1;
        }
    });

    // 3. Transform for Recharts (Array of Objects)
    // Calculate Percentages for Stacked Bar (100%)
    const chartData: DepartmentClusterData[] = Object.entries(aggregation).map(([dept, reasonCounts]) => {
        const total = Object.values(reasonCounts).reduce((sum, count) => sum + count, 0);

        const row: any = { department: dept, totalCount: total }; // totalCount for sorting/tooltip

        allReasons.forEach(reason => {
            // Calculate percentage
            // row[reason] = reasonCounts[reason] ? (reasonCounts[reason] / total) * 100 : 0; 
            // Actually, usually easier to pass raw counts and let Recharts stack them, 
            // OR pass percentages if we want 100% chart.
            // Let's pass raw counts for now, and handle stacking in UI.
            row[reason] = reasonCounts[reason] || 0;
        });

        return row;
    }).sort((a: any, b: any) => b.totalCount - a.totalCount); // Sort departments by total volume

    return chartData;
}
