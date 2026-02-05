import { createClient } from '@/lib/supabase/server';
import { resend } from '@/lib/email';
import ResignationReminderEmail from '@/emails/ResignationReminderEmail';
import { format } from 'date-fns';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    // 1. Security Check
    // Ideally use a secret, but for now we'll allow it (or check a header if configured)
    // const authHeader = request.headers.get('authorization');
    // if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    //     return new NextResponse('Unauthorized', { status: 401 });
    // }

    const supabase = await createClient();

    // 2. Define Time Window (Now + 48 hours)
    // We want to catch anything that is approaching the 48h mark.
    // Let's say: Scheduled Date is within the next 48 to 50 hours? 
    // OR simply: Scheduled Date <= Now + 49h AND Scheduled Date >= Now + 24h
    // (To ensure we don't send it too late or too early, but "48h before" is the target).

    // Better logic:
    // If Scheduled Date < (Now + 49 hours) AND reminder_email_sent is FALSE.
    // This catches everything that is *within* the 49h horizon (so 48h, 47h, etc) that hasn't been sent.
    // We assume "Scheduled" implies it's in the future.

    const now = new Date();
    const threshold = new Date(now.getTime() + (49 * 60 * 60 * 1000)); // Now + 49 hours

    const { data: resignations, error } = await supabase
        .from('resignations')
        .select('*, profiles(full_name, email)')
        .eq('status', 'scheduled')
        .eq('reminder_email_sent', false)
        .lt('scheduled_interview_date', threshold.toISOString())
        .gt('scheduled_interview_date', now.toISOString()); // Ensure it's in the future

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!resignations || resignations.length === 0) {
        return NextResponse.json({ message: 'No reminders to send.' });
    }

    const results = [];

    for (const resignation of resignations) {
        if (resignation.profiles?.email) {
            try {
                // Send Email
                const { error: emailError } = await resend.emails.send({
                    from: 'Retention Intelligence Hub <noreply@demos.resend.dev>',
                    to: [resignation.profiles.email],
                    subject: 'Reminder: Upcoming Exit Interview',
                    react: ResignationReminderEmail({
                        employeeName: resignation.profiles.full_name,
                        interviewDate: format(new Date(resignation.scheduled_interview_date), 'PPP p'),
                    }),
                });

                if (emailError) {
                    console.error(`Failed to send email to ${resignation.profiles.email}`, emailError);
                    results.push({ id: resignation.id, status: 'failed', error: emailError });
                    continue;
                }

                // Update DB
                const { error: updateError } = await supabase
                    .from('resignations')
                    .update({ reminder_email_sent: true })
                    .eq('id', resignation.id);

                if (updateError) {
                    console.error(`Failed to update DB for ${resignation.id}`, updateError);
                    results.push({ id: resignation.id, status: 'email_sent_db_failed', error: updateError });
                } else {
                    results.push({ id: resignation.id, status: 'success' });
                }

            } catch (err: any) {
                console.error(`Error processing ${resignation.id}`, err);
                results.push({ id: resignation.id, status: 'error', error: err.message });
            }
        }
    }

    return NextResponse.json({ success: true, processed: results.length, details: results });
}
