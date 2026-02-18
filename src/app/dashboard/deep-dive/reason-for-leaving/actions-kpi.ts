'use server';

import { createClient } from '@/lib/supabase/server';
import { differenceInMonths, parseISO, subMonths } from 'date-fns';

export interface ReasonKPIs {
    topReason: { label: string; count: number; percent: number };
    lowestReason: { label: string; count: number; percent: number };
    avgTenure: { years: number; months: number; totalMonths: number };
}

export async function getReasonKPIs(): Promise<ReasonKPIs> {
    const supabase = await createClient();
    const startDate = subMonths(new Date(), 12).toISOString(); // LTM

    // 1. Fetch Reasons
    const { data: reasonData, error: reasonError } = await supabase
        .from('exit_interview_results')
        .select('response_value')
        .eq('question_key', 'reason_for_leaving')
        .gte('created_at', startDate);

    // 2. Fetch Tenure Data (Resignations -> Details)
    const { data: tenureData, error: tenureError } = await supabase
        .from('resignations')
        .select(`
            created_at,
            employee_details!fk_resignations_employee_details (
                date_hired
            )
        `)
        .eq('status', 'completed')
        .gte('created_at', startDate);

    // DEFAULT RETURN
    const kpis: ReasonKPIs = {
        topReason: { label: 'N/A', count: 0, percent: 0 },
        lowestReason: { label: 'N/A', count: 0, percent: 0 },
        avgTenure: { years: 0, months: 0, totalMonths: 0 }
    };

    if (reasonError || tenureError) {
        console.error("Error fetching Reason KPIs", reasonError, tenureError);
        return kpis;
    }

    // --- AGGREGATE REASONS ---
    const counts: Record<string, number> = {};
    let totalReasons = 0;

    reasonData.forEach(row => {
        let reasons: string[] = [];
        const val = row.response_value;

        if (typeof val === 'string') {
            if (val.startsWith('[') || val.startsWith('"')) {
                try {
                    const parsed = JSON.parse(val);
                    reasons = Array.isArray(parsed) ? parsed : [parsed];
                } catch { reasons = [val]; }
            } else if (val.includes(',')) {
                reasons = val.split(',').map(s => s.trim());
            } else {
                reasons = [val];
            }
        } else if (Array.isArray(val)) {
            reasons = val;
        }

        reasons.forEach(r => {
            const clean = r.trim().replace(/^"|"$/g, '');
            if (clean) {
                counts[clean] = (counts[clean] || 0) + 1;
                totalReasons++;
            }
        });
    });

    const sortedReasons = Object.entries(counts).sort(([, a], [, b]) => b - a);

    if (sortedReasons.length > 0) {
        const top = sortedReasons[0];
        const bottom = sortedReasons[sortedReasons.length - 1];

        kpis.topReason = {
            label: top[0],
            count: top[1],
            percent: Math.round((top[1] / totalReasons) * 100)
        };
        kpis.lowestReason = {
            label: bottom[0],
            count: bottom[1],
            percent: Math.round((bottom[1] / totalReasons) * 100)
        };
    }

    // --- AGGREGATE TENURE ---
    let totalMonths = 0;
    let countTenure = 0;

    tenureData.forEach((row: any) => {
        const details = Array.isArray(row.employee_details) ? row.employee_details[0] : row.employee_details;
        if (!details?.date_hired || !row.created_at) return;

        const months = differenceInMonths(parseISO(row.created_at), parseISO(details.date_hired));
        if (months >= 0) {
            totalMonths += months;
            countTenure++;
        }
    });

    if (countTenure > 0) {
        const avgM = totalMonths / countTenure;
        kpis.avgTenure = {
            totalMonths: Math.round(avgM),
            years: Math.floor(avgM / 12),
            months: Math.round(avgM % 12)
        };
    }

    return kpis;
}
