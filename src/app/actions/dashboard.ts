'use server';

import { createClient } from '@/lib/supabase/server';
import { subMonths } from 'date-fns';
import { AnalyticsFilters } from './analytics';

export type DashboardStats = {
    totalEmployees: number;
    activeResignations: number;
    retentionRate: number;
    turnoverRate: number;
    misunderstoodCount: number;
};

export type CorrectionStat = {
    questionKey: string;
    count: number;
    questionText: string;
};

export async function getDashboardStats(filters: AnalyticsFilters = {}) {
    const supabase = await createClient();

    // 1. Total Employees (active profiles) - Filtered by department if applicable
    let employeesQuery = supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'employee');

    if (filters.department && filters.department.length > 0) {
        employeesQuery = employeesQuery.in('department', filters.department);
    }

    const { count: totalEmployees, error: employeesError } = await employeesQuery;

    if (employeesError) {
        console.error('Error fetching employees count:', employeesError);
        return { success: false, error: employeesError.message };
    }

    // 2. Active Resignations - Filtered by profile department
    let resignationsQuery = supabase
        .from('resignations')
        .select(`
            id,
            profiles!employee_id (
                department
            )
        `, { count: 'exact', head: true })
        .in('status', ['pending', 'scheduled']);

    if (filters.department && filters.department.length > 0) {
        resignationsQuery = resignationsQuery.in('profiles.department', filters.department);
    }

    const { count: activeResignations, error: resignationsError } = await resignationsQuery;

    if (resignationsError) {
        console.error('Error fetching resignations count:', resignationsError);
    }

    // 3. Turnover Rate (Formula: Resignations / Headcount * 100)
    let exitsQuery = supabase
        .from('resignations')
        .select(`
            id,
            profiles!employee_id (
                department
            )
        `, { count: 'exact', head: true })
        .in('status', ['completed', 'approved', 'verified', 'scheduled']);

    if (filters.startDate) {
        exitsQuery = exitsQuery.gte('created_at', filters.startDate.toISOString());
    }
    if (filters.endDate) {
        exitsQuery = exitsQuery.lte('created_at', filters.endDate.toISOString());
    }
    if (filters.department && filters.department.length > 0) {
        exitsQuery = exitsQuery.in('profiles.department', filters.department);
    }

    const { count: totalExits, error: exitsError } = await exitsQuery;

    if (exitsError) {
        console.error('Error fetching total exits:', exitsError);
    }

    // If filtering by dept, calculate rate only for that dept
    const HEADCOUNT = filters.department && filters.department.length > 0 ? (totalEmployees || 1) : 5000;
    const turnoverRateRaw = ((totalExits || 0) / HEADCOUNT) * 100;
    const turnoverRate = parseFloat(turnoverRateRaw.toFixed(2));
    const retentionRate = Math.max(0, 100 - turnoverRate);

    // 4. Misunderstood Questions Count (Filtered)
    let correctionQuery = supabase
        .from('exit_responses')
        .select(`
            id,
            resignations!inner (
                profiles!employee_id (
                    department
                )
            )
        `, { count: 'exact', head: true })
        .eq('is_corrected', true);

    if (filters.startDate) {
        correctionQuery = correctionQuery.gte('created_at', filters.startDate.toISOString());
    }
    if (filters.endDate) {
        correctionQuery = correctionQuery.lte('created_at', filters.endDate.toISOString());
    }
    if (filters.department && filters.department.length > 0) {
        correctionQuery = correctionQuery.in('resignations.profiles.department', filters.department);
    }

    const { count: misunderstoodCount, error: correctionError } = await correctionQuery;

    return {
        success: true,
        data: {
            totalEmployees: totalEmployees || 0,
            activeResignations: activeResignations || 0,
            retentionRate: retentionRate,
            turnoverRate: turnoverRate,
            misunderstoodCount: misunderstoodCount || 0
        }
    };
}

export async function getMisunderstoodQuestions(filters: AnalyticsFilters = {}): Promise<{ success: boolean; data?: CorrectionStat[]; error?: string }> {
    const supabase = await createClient();

    let query = supabase
        .from('exit_responses')
        .select(`
            original_answer, 
            corrected_answer, 
            created_at,
            resignations!inner (
                profiles!employee_id (
                    department
                )
            )
        `)
        .eq('is_corrected', true)
        .not('original_answer', 'is', null)
        .not('corrected_answer', 'is', null);

    if (filters.startDate) {
        query = query.gte('created_at', filters.startDate.toISOString());
    }
    if (filters.endDate) {
        query = query.lte('created_at', filters.endDate.toISOString());
    }
    if (filters.department && filters.department.length > 0) {
        query = query.in('resignations.profiles.department', filters.department);
    }

    const { data: responses, error } = await query;

    if (error) {
        return { success: false, error: error.message };
    }

    const statsMap: Record<string, number> = {};

    responses?.forEach(res => {
        try {
            const original = JSON.parse(res.original_answer || '{}');
            const corrected = JSON.parse(res.corrected_answer || '{}');

            Object.keys(corrected).forEach(key => {
                const valOrig = JSON.stringify(original[key]);
                const valCorr = JSON.stringify(corrected[key]);

                if (valOrig !== valCorr) {
                    statsMap[key] = (statsMap[key] || 0) + 1;
                }
            });
        } catch (e) {
            console.error('Error parsing correction JSON:', e);
        }
    });

    const stats: CorrectionStat[] = Object.entries(statsMap).map(([key, count]) => ({
        questionKey: key,
        count,
        questionText: formatQuestionKey(key)
    })).sort((a, b) => b.count - a.count);

    return { success: true, data: stats };
}

export async function getDetailedExitStats(filters: AnalyticsFilters = {}) {
    const supabase = await createClient();

    let query = supabase
        .from('exit_responses')
        .select(`
            questionnaire_responses, 
            created_at,
            resignations!inner (
                profiles!employee_id (
                    department
                )
            )
        `)
        .not('questionnaire_responses', 'is', null);

    if (filters.startDate) {
        query = query.gte('created_at', filters.startDate.toISOString());
    }
    if (filters.endDate) {
        query = query.lte('created_at', filters.endDate.toISOString());
    }
    if (filters.department && filters.department.length > 0) {
        query = query.in('resignations.profiles.department', filters.department);
    }

    const { data: responses, error } = await query;

    if (error) {
        return { success: false, error: error.message };
    }

    const reasonCounts: Record<string, number> = {};

    responses?.forEach(res => {
        const q = res.questionnaire_responses as { reason_for_leaving?: string[] };
        if (!q) return;

        if (Array.isArray(q.reason_for_leaving)) {
            q.reason_for_leaving.forEach((r: string) => {
                reasonCounts[r] = (reasonCounts[r] || 0) + 1;
            });
        }
    });

    return {
        success: true,
        data: {
            topReasons: Object.entries(reasonCounts)
                .map(([name, value]) => ({ name, value }))
                .sort((a, b) => b.value - a.value)
        }
    };
}

function formatQuestionKey(key: string): string {
    const map: Record<string, string> = {
        'reason_for_leaving': 'Reason for Leaving',
        'why_more_desirable': 'Why More Desirable?',
        'career_growth': 'Career Growth',
        'rate_of_pay': 'Rate of Pay',
        'benefits': 'Benefits',
        'workload': 'Workload',
        'recommendation': 'Recommendation'
    };
    return map[key] || key.replace(/_/g, ' ');
}

export async function getRecentResignations(filters: AnalyticsFilters = {}) {
    const supabase = await createClient();

    let query = supabase
        .from('resignations')
        .select(`
            id,
            status,
            created_at,
            scheduled_interview_date,
            last_working_day,
            profiles!employee_id (
                full_name,
                email,
                role,
                department
            )
        `);

    if (filters.department && filters.department.length > 0) {
        query = query.in('profiles.department', filters.department);
    }

    if (filters.startDate) {
        query = query.gte('created_at', filters.startDate.toISOString());
    }
    if (filters.endDate) {
        query = query.lte('created_at', filters.endDate.toISOString());
    }

    const { data, error } = await query
        .order('created_at', { ascending: false })
        .limit(5);

    if (error) {
        console.error('Error fetching recent resignations:', error);
        return { success: false, error: error.message };
    }

    return { success: true, data };
}

export async function getTurnoverTrends(filters: AnalyticsFilters = {}) {
    const supabase = await createClient();

    const endDate = filters.endDate || new Date();
    const startDate = filters.startDate || subMonths(endDate, 1);

    const { data: resignations, error } = await supabase
        .from('resignations')
        .select(`
            created_at,
            profiles!employee_id (
                department
            )
        `)
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString());

    if (error) {
        return { success: false, error: error.message };
    }

    const filtered = (resignations as any[]).filter(r => {
        if (filters.department && filters.department.length > 0) {
            const dept = r.profiles?.department;
            if (!dept || !filters.department.includes(dept)) return false;
        }
        return true;
    });

    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const isMonthly = diffDays > 32;

    const groupedData: Record<string, number> = {};
    const current = new Date(startDate);

    while (current <= endDate) {
        const key = isMonthly
            ? current.toLocaleString('default', { month: 'short' })
            : current.toLocaleString('default', { day: 'numeric', month: 'short' });

        if (!groupedData[key]) groupedData[key] = 0;

        if (isMonthly) {
            current.setMonth(current.getMonth() + 1);
        } else {
            current.setDate(current.getDate() + 1);
        }
    }

    filtered.forEach(r => {
        const d = new Date(r.created_at);
        const key = isMonthly
            ? d.toLocaleString('default', { month: 'short' })
            : d.toLocaleString('default', { day: 'numeric', month: 'short' });

        if (groupedData[key] !== undefined) {
            groupedData[key]++;
        }
    });

    const data = Object.entries(groupedData).map(([name, resignations]) => ({
        name,
        resignations,
        retention: Math.max(70, 95 - (resignations * 2))
    }));

    return { success: true, data };
}

export async function getRecommendationStats(filters: AnalyticsFilters = {}) {
    const supabase = await createClient();

    let query = supabase
        .from('exit_responses')
        .select(`
            questionnaire_responses, 
            created_at,
            resignations!inner (
                profiles!employee_id (
                    department
                )
            )
        `)
        .not('questionnaire_responses', 'is', null);

    if (filters.startDate) {
        query = query.gte('created_at', filters.startDate.toISOString());
    }
    if (filters.endDate) {
        query = query.lte('created_at', filters.endDate.toISOString());
    }
    if (filters.department && filters.department.length > 0) {
        query = query.in('resignations.profiles.department', filters.department);
    }

    const { data: responses, error } = await query;

    if (error) {
        return { success: false, error: error.message };
    }

    let promoter = 0;
    let detractor = 0;
    let passive = 0;

    responses?.forEach(res => {
        const q = res.questionnaire_responses as { recommendation?: string };
        if (q.recommendation === 'Yes') promoter++;
        else if (q.recommendation === 'No') detractor++;
        else passive++;
    });

    const data = [
        { name: 'Promoter (Yes)', value: promoter },
        { name: 'Detractor (No)', value: detractor },
        { name: 'Passive (Maybe)', value: passive }
    ];

    return { success: true, data };
}

export async function getCareerGrowthStats(filters: AnalyticsFilters = {}) {
    const supabase = await createClient();

    let query = supabase
        .from('exit_responses')
        .select(`
            questionnaire_responses, 
            created_at,
            resignations!inner (
                profiles!employee_id (
                    department
                )
            )
        `)
        .not('questionnaire_responses', 'is', null);

    if (filters.startDate) {
        query = query.gte('created_at', filters.startDate.toISOString());
    }
    if (filters.endDate) {
        query = query.lte('created_at', filters.endDate.toISOString());
    }
    if (filters.department && filters.department.length > 0) {
        query = query.in('resignations.profiles.department', filters.department);
    }

    const { data: responses, error } = await query;

    if (error) {
        return { success: false, error: error.message };
    }

    const ordinalMap: Record<string, number> = {
        'Very good chance': 0,
        'Good chances': 0,
        'Little chances': 0,
        'Very little': 0,
        'No chances': 0,
        'N/A': 0
    };

    responses?.forEach(res => {
        const q = res.questionnaire_responses as { career_growth?: string };
        const answer = q.career_growth || 'N/A';
        if (ordinalMap[answer] !== undefined) {
            ordinalMap[answer]++;
        } else {
            ordinalMap['N/A']++;
        }
    });

    const orderedKeys = ['Very good chance', 'Good chances', 'Little chances', 'Very little', 'No chances'];

    const sortedData = orderedKeys.map(key => ({
        name: key,
        value: ordinalMap[key] || 0
    }));

    return { success: true, data: sortedData };
}

export async function getRateOfPayStats(filters: AnalyticsFilters = {}) {
    const supabase = await createClient();

    let query = supabase
        .from('exit_responses')
        .select(`
            questionnaire_responses, 
            created_at,
            resignations!inner (
                profiles!employee_id (
                    department
                )
            )
        `)
        .not('questionnaire_responses', 'is', null);

    if (filters.startDate) {
        query = query.gte('created_at', filters.startDate.toISOString());
    }
    if (filters.endDate) {
        query = query.lte('created_at', filters.endDate.toISOString());
    }
    if (filters.department && filters.department.length > 0) {
        query = query.in('resignations.profiles.department', filters.department);
    }

    const { data: responses, error } = await query;

    if (error) {
        return { success: false, error: error.message };
    }

    const ordinalMap: Record<string, number> = {
        'Very compensating': 0,
        'Fair enough': 0,
        'A bit low': 0,
        'Very low': 0,
        'N/A': 0
    };

    responses?.forEach(res => {
        const q = res.questionnaire_responses as { rate_of_pay?: string };
        const answer = q.rate_of_pay || 'N/A';
        if (ordinalMap[answer] !== undefined) {
            ordinalMap[answer]++;
        } else {
            ordinalMap['N/A']++;
        }
    });

    const orderedKeys = ['Very compensating', 'Fair enough', 'A bit low', 'Very low'];

    const sortedData = orderedKeys.map(key => ({
        name: key,
        value: ordinalMap[key] || 0
    }));

    return { success: true, data: sortedData };
}

export async function getDepartments() {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('profiles')
        .select('department')
        .not('department', 'is', null);

    if (error) return { success: false, error: error.message };

    const departments = Array.from(new Set(data.map(p => p.department))).sort();
    return { success: true, data: departments };
}
