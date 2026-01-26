import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    // 1. Security Check (Optional: Add CRON_SECRET check here if env var is set)
    // const authHeader = request.headers.get('authorization');
    // if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    //     return new NextResponse('Unauthorized', { status: 401 });
    // }

    const supabase = await createClient();
    const now = new Date();
    // Look for interviews scheduled within the next 24 hours (and strictly in the future)
    const threshold = new Date(now.getTime() + (24 * 60 * 60 * 1000)); // Now + 24 hours

    // Query:
    // status = 'scheduled'
    // scheduled_interview_date < (Now + 24h)
    // scheduled_interview_date > Now (ensure it's not a past datum we missed, though locking past ones is also fine)

    // Actually, if it's in the past and still 'scheduled', it implies they missed the interview or we missed the lock. 
    // It's safer to lock ANYTHING scheduled that is imminent or past.
    // So: scheduled_interview_date < threshold

    const { data: resignations, error } = await supabase
        .from('resignations')
        .select('id, scheduled_interview_date')
        .eq('status', 'scheduled')
        .lt('scheduled_interview_date', threshold.toISOString());

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!resignations || resignations.length === 0) {
        return NextResponse.json({ message: 'No resignations to lock.' });
    }

    console.log(`Locking ${resignations.length} resignations...`);

    const results = [];

    for (const r of resignations) {
        const { error: updateError } = await supabase
            .from('resignations')
            .update({ status: 'locked' })
            .eq('id', r.id);

        if (updateError) {
            console.error(`Failed to lock ${r.id}`, updateError);
            results.push({ id: r.id, status: 'failed', error: updateError.message });
        } else {
            results.push({ id: r.id, status: 'locked' });
        }
    }

    return NextResponse.json({
        success: true,
        processed: results.length,
        details: results
    });
}
