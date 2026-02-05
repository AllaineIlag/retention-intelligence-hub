'use server';

import { createClient } from '@/lib/supabase/server';

export type DashboardStats = {
    totalEmployees: number;
    activeResignations: number;
    retentionRate: number;
    misunderstoodCount: number;
};

export type CorrectionStat = {
    questionKey: string;
    count: number;
    questionText: string;
};

export async function getDashboardStats() {
    const supabase = await createClient();

    // 1. Total Employees (active profiles)
    const { count: totalEmployees, error: employeesError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'employee');

    if (employeesError) {
        console.error('Error fetching employees count:', employeesError);
        return { success: false, error: employeesError.message };
    }

    // 2. Active Resignations
    const { count: activeResignations, error: resignationsError } = await supabase
        .from('resignations')
        .select('*', { count: 'exact', head: true })
        .in('status', ['pending', 'scheduled']);

    if (resignationsError) {
        console.error('Error fetching resignations count:', resignationsError);
        // Don't fail entire dashboard for this
    }

    // 3. Retention Rate (Mock calculation for now: 100 - (resigned / total * 100))
    // In a real app, this would be over a period (e.g. trailing 12 months)
    // For now, let's just use pending resignations / total employees
    const safeTotal = totalEmployees || 1;
    const turnoverRateRaw = ((activeResignations || 0) / safeTotal) * 100;
    const retentionRate = Math.max(0, 100 - turnoverRateRaw);

    // 4. Misunderstood Questions Count (Global)
    // We count rows in exit_responses where is_corrected = true
    const { count: misunderstoodCount, error: correctionError } = await supabase
        .from('exit_responses')
        .select('*', { count: 'exact', head: true })
        .eq('is_corrected', true);

    return {
        success: true,
        data: {
            totalEmployees: totalEmployees || 0,
            activeResignations: activeResignations || 0,
            retentionRate: parseFloat(retentionRate.toFixed(1)),
            misunderstoodCount: misunderstoodCount || 0
        }
    };
}

// Updated to accept date range
export async function getMisunderstoodQuestions(startDate?: Date, endDate?: Date): Promise<{ success: boolean; data?: CorrectionStat[]; error?: string }> {
    const supabase = await createClient();

    let query = supabase
        .from('exit_responses')
        .select('original_answer, corrected_answer, created_at')
        .eq('is_corrected', true)
        .not('original_answer', 'is', null)
        .not('corrected_answer', 'is', null);

    if (startDate) {
        query = query.gte('created_at', startDate.toISOString());
    }
    if (endDate) {
        query = query.lte('created_at', endDate.toISOString());
    }

    const { data: responses, error } = await query;

    if (error) {
        return { success: false, error: error.message };
    }

    // Aggregation Logic
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

// Updated to accept date range
export async function getDetailedExitStats(startDate?: Date, endDate?: Date) {
    const supabase = await createClient();

    let query = supabase
        .from('exit_responses')
        .select('questionnaire_responses, created_at')
        .not('questionnaire_responses', 'is', null);

    if (startDate) {
        query = query.gte('created_at', startDate.toISOString());
    }
    if (endDate) {
        query = query.lte('created_at', endDate.toISOString());
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
                .sort((a, b) => b.value - a.value) // Sort desc but allow slicing in UI if needed
        }
    };
}


// Helper for readable keys
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

export async function getRecentResignations() {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('resignations')
        .select(`
            id,
            status,
            created_at,
            scheduled_interview_date,
            profiles (
                full_name,
                email,
                role
            )
        `)
        .order('created_at', { ascending: false })
        .limit(5);

    if (error) {
        console.error('Error fetching recent resignations:', error);
        return { success: false, error: error.message };
    }

    return { success: true, data };
}

// [NEW] Turnover Trends Aggregation
export async function getTurnoverTrends(startDate: Date, endDate: Date) {
    const supabase = await createClient();

    // In a real production app, we would join resignations with a dates table or use date_trunc in SQL.
    // Since we are "faking" history for MVP by creating resignations, we will just select all within range
    // and group by Month/Day in Typescript.

    const { data: resignations, error } = await supabase
        .from('resignations')
        .select('created_at')
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString());

    if (error) {
        return { success: false, error: error.message };
    }

    // Determine granularity based on range duration
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    // Logic: < 30 days = Day granularity, > 30 days = Month granularity
    const isMonthly = diffDays > 32; // slightly loose buffer

    const groupedData: Record<string, number> = {};

    // Initialize periods (simple approach: loop from starDate to endDate)
    const current = new Date(startDate);
    while (current <= endDate) {
        const key = isMonthly
            ? current.toLocaleString('default', { month: 'short' })
            : current.toLocaleString('default', { day: 'numeric', month: 'short' });

        if (!groupedData[key]) groupedData[key] = 0;

        // Increment day/month
        if (isMonthly) {
            current.setMonth(current.getMonth() + 1);
        } else {
            current.setDate(current.getDate() + 1);
        }
    }

    // Populate counts
    resignations?.forEach(r => {
        const d = new Date(r.created_at);
        const key = isMonthly
            ? d.toLocaleString('default', { month: 'short' })
            : d.toLocaleString('default', { day: 'numeric', month: 'short' });

        if (groupedData[key] !== undefined) {
            groupedData[key]++;
        }
    });

    // Transform
    const data = Object.entries(groupedData).map(([name, resignations]) => ({
        name,
        resignations,
        // Mocking retention % fluctuating inversely to resignations for visual effect
        // Base 95%, minus 2% per resignation
        retention: Math.max(70, 95 - (resignations * 2))
    }));

    return { success: true, data };
}


// [NEW] Recommendation Stats
export async function getRecommendationStats(startDate: Date, endDate: Date) {
    const supabase = await createClient();

    const { data: responses, error } = await supabase
        .from('exit_responses')
        .select('questionnaire_responses, created_at')
        .not('questionnaire_responses', 'is', null)
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString());

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
        else passive++; // Maybe/Undefined
    });

    const data = [
        { name: 'Promoter (Yes)', value: promoter },
        { name: 'Detractor (No)', value: detractor },
        { name: 'Passive (Maybe)', value: passive }
    ];

    // If empty, return mock structure but zeroed to avoid errors
    const total = promoter + detractor + passive;
    if (total === 0) {
        // Optional: Return empty data or keep zeros
    }

    return { success: true, data };
}

// [NEW] Career Growth Stats
export async function getCareerGrowthStats(startDate: Date, endDate: Date) {
    const supabase = await createClient();

    const { data: responses, error } = await supabase
        .from('exit_responses')
        .select('questionnaire_responses, created_at')
        .not('questionnaire_responses', 'is', null)
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString());

    if (error) {
        return { success: false, error: error.message };
    }

    // Ordinal keys in generic order for consistent chart sorting
    const ordinalMap: Record<string, number> = {
        'Very good chance': 0,
        'Good chances': 0,
        'Little chances': 0,
        'Very little': 0,
        'No chances': 0,
        'N/A': 0 // Fallback
    };

    responses?.forEach(res => {
        const q = res.questionnaire_responses as { career_growth?: string };
        const answer = q.career_growth || 'N/A';
        // Normalize checking against keys
        if (ordinalMap[answer] !== undefined) {
            ordinalMap[answer]++;
        } else {
            ordinalMap['N/A']++;
        }
    });

    // Transform to array
    const data = Object.entries(ordinalMap).map(([name, value]) => ({
        name,
        value
    }));

    // No sorting needed if we rely on the insertion order of the pre-defined map, 
    // but strict ordered array ensures "Very Good" -> "No chances" flow.
    const orderedKeys = ['Very good chance', 'Good chances', 'Little chances', 'Very little', 'No chances'];

    const sortedData = orderedKeys.map(key => ({
        name: key,
        value: ordinalMap[key] || 0
    }));

    return { success: true, data: sortedData };
}

// [NEW] Rate of Pay Stats
export async function getRateOfPayStats(startDate: Date, endDate: Date) {
    const supabase = await createClient();

    const { data: responses, error } = await supabase
        .from('exit_responses')
        .select('questionnaire_responses, created_at')
        .not('questionnaire_responses', 'is', null)
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString());

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

