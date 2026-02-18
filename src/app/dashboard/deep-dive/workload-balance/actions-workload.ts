'use server';

import { createClient } from '@/lib/supabase/server';

export interface WorkloadScatterPoint {
    workloadScore: number;
    recommendationScore: number;
    name: string;
}

function workloadToScore(val: string): number {
    switch (val) {
        case 'Light': return 1;
        case 'Manageable': return 2;
        case 'Moderate': return 3;
        case 'Heavy': return 4;
        case 'Very heavy': return 5;
        default: return 3;
    }
}

export async function getWorkloadScatterData(): Promise<WorkloadScatterPoint[]> {
    const supabase = await createClient();

    // Need to join results -> resignation -> employee_details
    const { data: results, error } = await supabase
        .from('exit_interview_results')
        .select(`
            question_key, 
            response_value,
            resignation_id,
            resignations!inner(
                employee_details!inner(full_name)
            )
        `)
        .in('question_key', ['workload', 'recommendation']);

    if (error || !results) return [];

    const byResignation = new Map<string, { name: string; workload?: string; recommendation?: string }>();

    results.forEach((r: any) => {
        const id = r.resignation_id;
        const name = r.resignations?.employee_details?.full_name || 'Unknown';

        if (!byResignation.has(id)) {
            byResignation.set(id, { name });
        }

        const entry = byResignation.get(id)!;
        let val = Array.isArray(r.response_value) ? r.response_value[0] : String(r.response_value);
        val = val.trim().replace(/^"|"$/g, '');

        if (r.question_key === 'workload') entry.workload = val;
        if (r.question_key === 'recommendation') entry.recommendation = val;
    });

    const scatter: WorkloadScatterPoint[] = [];

    byResignation.forEach((entry) => {
        if (entry.workload && entry.recommendation) {
            scatter.push({
                name: entry.name,
                workloadScore: workloadToScore(entry.workload),
                recommendationScore: Number(entry.recommendation)
            });
        }
    });

    return scatter;
}
