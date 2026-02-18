'use server';

import { createClient } from '@/lib/supabase/server';

export interface DepartmentHeatmapData {
    department: string;
    count: number;
}

export async function getDepartmentHeatmapData(): Promise<DepartmentHeatmapData[]> {
    const supabase = await createClient();

    // We utilize the direct relationship between resignations and employee_details
    // constraint: fk_resignations_employee_details (resignations.employee_id -> employee_details.id)
    const { data, error } = await supabase
        .from('resignations')
        .select(`
            id,
            employee_details!fk_resignations_employee_details (
                department
            )
        `)
        .neq('status', 'cancelled');

    if (error) {
        console.error('Error fetching department heatmap data:', error);
        return [];
    }

    const startData: Record<string, number> = {};

    data.forEach((row: any) => {
        // row.employee_details is an object (1:1 relationship via PK/FK)
        const details = Array.isArray(row.employee_details) ? row.employee_details[0] : row.employee_details;

        const dept = details?.department || 'Unknown';

        startData[dept] = (startData[dept] || 0) + 1;
    });

    const chartData: DepartmentHeatmapData[] = Object.entries(startData)
        .map(([department, count]) => ({ department, count }))
        .sort((a, b) => b.count - a.count);

    return chartData;
}
