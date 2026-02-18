'use server';

import { createClient } from '@/lib/supabase/server';
import { differenceInMonths, parseISO, subMonths } from 'date-fns';

// ----------------------------------------------------------------------
// TYPES
// ----------------------------------------------------------------------

export interface RiskMetric {
    label: string;
    value: number | string;
    subValue?: string;
    status: 'safe' | 'warning' | 'critical';
    trend?: 'up' | 'down' | 'stable';
}

export interface RiskData {
    dropout: RiskMetric;
    manager: RiskMetric;
    deptRisk: RiskMetric;
}

// ----------------------------------------------------------------------
// ACTIONS
// ----------------------------------------------------------------------

/**
 * 1. New Hire Dropout Rate
 * Definition: % of exits where tenure < 6 months
 * Target: < 10% (Safe), 10-20% (Warning), > 20% (Critical)
 */
async function getNewHireDropoutRate(startDate: string): Promise<RiskMetric> {
    const supabase = await createClient();

    // Fetch exits in range
    const { data, error } = await supabase
        .from('resignations')
        .select(`
            created_at,
            employee_details!fk_resignations_employee_details (
                date_hired
            )
        `)
        .eq('status', 'completed')
        .gte('created_at', startDate);

    if (error) {
        console.error('Error fetching dropout data:', error);
        return { label: 'New Hire Dropout', value: 'N/A', status: 'safe' };
    }

    const totalExits = data.length;
    if (totalExits === 0) {
        return { label: 'New Hire Dropout', value: '0%', subValue: '0 incidents', status: 'safe' };
    }

    let earlyExits = 0;
    data.forEach((row: any) => {
        const details = Array.isArray(row.employee_details) ? row.employee_details[0] : row.employee_details;
        if (!details?.date_hired) return;

        const hired = parseISO(details.date_hired);
        const resigned = parseISO(row.created_at);
        const months = differenceInMonths(resigned, hired);

        if (months <= 6) earlyExits++;
    });

    const rate = (earlyExits / totalExits) * 100;
    const status = rate > 20 ? 'critical' : rate > 10 ? 'warning' : 'safe';

    return {
        label: 'New Hire Dropout',
        value: `${Math.round(rate)}%`,
        subValue: `${earlyExits} of ${totalExits} exits (< 6mo)`,
        status
    };
}

/**
 * 2. Manager Attrition
 * Definition: Count of exits where role contains "Manager", "Lead", "Director", "VP", "Head"
 * Target: 0 (Safe), 1-2 (Warning), > 2 (Critical) - per month usually, but lets look at window
 */
async function getManagerAttrition(startDate: string): Promise<RiskMetric> {
    const supabase = await createClient();

    // We search by current_position ILIKE
    // Note: This relies on employee_details being accurate at time of exit
    const { data, error } = await supabase
        .from('resignations')
        .select(`
            employee_details!fk_resignations_employee_details (
                current_position
            )
        `)
        .eq('status', 'completed')
        .gte('created_at', startDate);

    if (error) {
        console.error('Error fetching manager data:', error);
        return { label: 'Leadership Loss', value: 'N/A', status: 'safe' };
    }

    let managerExits = 0;
    const keywords = ['Manager', 'Lead', 'Director', 'VP', 'Head', 'Chief', 'Supervisor'];

    data.forEach((row: any) => {
        const details = Array.isArray(row.employee_details) ? row.employee_details[0] : row.employee_details;
        const role = details?.current_position || '';

        if (keywords.some(k => role.includes(k))) {
            managerExits++;
        }
    });

    // Thresholds (assuming this is a 6-month window or similar)
    const status = managerExits > 5 ? 'critical' : managerExits > 2 ? 'warning' : 'safe';

    return {
        label: 'Leadership Loss',
        value: managerExits.toString(),
        subValue: 'Key roles exited',
        status
    };
}

/**
 * 3. High Risk Departments
 * Definition: Dept with highest exit count in period
 */
async function getHighRiskDepartments(startDate: string): Promise<RiskMetric> {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('resignations')
        .select(`
            employee_details!fk_resignations_employee_details (
                department
            )
        `)
        .eq('status', 'completed')
        .gte('created_at', startDate);

    if (error) {
        return { label: 'High Risk Dept', value: 'N/A', status: 'safe' };
    }

    const counts: Record<string, number> = {};
    data.forEach((row: any) => {
        const details = Array.isArray(row.employee_details) ? row.employee_details[0] : row.employee_details;
        const dept = details?.department || 'Unknown';
        counts[dept] = (counts[dept] || 0) + 1;
    });

    // Find Max
    let maxDept = 'None';
    let maxCount = 0;
    let total = 0;

    Object.entries(counts).forEach(([dept, count]) => {
        total += count;
        if (count > maxCount) {
            maxCount = count;
            maxDept = dept;
        }
    });

    if (maxCount === 0) {
        return { label: 'Flight Risk Zone', value: 'None', status: 'safe' };
    }

    const pct = Math.round((maxCount / total) * 100);
    // If one department calculates for > 40% of exits, it's critical
    const status = pct > 40 ? 'critical' : pct > 20 ? 'warning' : 'safe';

    return {
        label: 'Flight Risk Zone',
        value: maxDept,
        subValue: `${maxCount} exits (${pct}% of total)`,
        status
    };
}


// MAIN EXPORT
export async function getRiskRadarData(): Promise<RiskData> {
    // Look back 90 days for immediate tactical risk
    const startDate = subMonths(new Date(), 3).toISOString();

    const [dropout, manager, deptRisk] = await Promise.all([
        getNewHireDropoutRate(startDate),
        getManagerAttrition(startDate),
        getHighRiskDepartments(startDate)
    ]);

    return { dropout, manager, deptRisk };
}
