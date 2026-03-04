'use server';

import { createClient } from '@/lib/supabase/server';
import { AnalyticsFilters } from '@/app/actions/analytics';
import { differenceInYears, differenceInMonths, parseISO, subMonths } from 'date-fns';

export interface DemographicRiskData {
    name: string;
    value: number;
    fill: string;
}

export async function getDemographicRiskData(filters: AnalyticsFilters = {}): Promise<DemographicRiskData[]> {
    const supabase = await createClient();

    const endDate = filters.endDate ? filters.endDate.toISOString() : new Date().toISOString();
    const startDate = filters.startDate ? filters.startDate.toISOString() : subMonths(new Date(), 12).toISOString();

    // Fetch hire_date and department via directory_id → company_directory
    const { data: resignations, error } = await supabase
        .from('resignations')
        .select(`
            created_at,
            company_directory (
                date_hired,
                department
            )
        `)
        .neq('status', 'cancelled')
        .gte('created_at', startDate)
        .lte('created_at', endDate);

    // Filter logic
    const filterDepts = filters.department && filters.department.length > 0 ? new Set(filters.department) : null;

    if (error) {
        console.error('Error fetching demographic risk data:', error);
        return [];
    }

    let newHires = 0; // < 1 Year
    let midTenure = 0; // 1 - 3 Years
    let veterans = 0;  // > 3 Years

    resignations.forEach((row: any) => {
        const details = Array.isArray(row.company_directory) ? row.company_directory[0] : row.company_directory;
        const dept = details?.department || 'Unknown';

        // Apply Department Filter
        if (filterDepts && !filterDepts.has(dept)) {
            return;
        }

        if (!details || !details.date_hired || !row.created_at) return;

        const hired = parseISO(details.date_hired);
        const resigned = parseISO(row.created_at);

        const years = differenceInYears(resigned, hired);
        const months = differenceInMonths(resigned, hired);

        if (months < 12) {
            newHires++;
        } else if (years >= 1 && years <= 3) {
            midTenure++;
        } else {
            veterans++;
        }
    });

    // Donut Chart Data
    return [
        { name: '< 1 Year', value: newHires, fill: '#EF4444' },    // Red (High Risk)
        { name: '1 - 3 Years', value: midTenure, fill: '#F59E0B' }, // Amber (Medium Risk)
        { name: '> 3 Years', value: veterans, fill: '#10B981' },    // Green (Low Risk / Stable)
    ];
}
