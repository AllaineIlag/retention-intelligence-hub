'use server';

import { createClient } from '@/lib/supabase/server';
import { resend } from '@/lib/email';
import ResignationAckEmail from '@/emails/ResignationAckEmail';
import ResignationApprovalEmail from '@/emails/ResignationApprovalEmail';
import ResignationDeclineEmail from '@/emails/ResignationDeclineEmail';
import { format } from 'date-fns';
import { revalidatePath } from 'next/cache';

// Verify Resignation (Step 2)
export async function verifyResignation(resignationId: string, lastWorkingDay: Date) {
    const supabase = await createClient();

    // 1. Update Resignation Status
    const { data: resignation, error: updateError } = await supabase
        .from('resignations')
        .update({
            status: 'verified',
            last_working_day: lastWorkingDay.toISOString(),
        })
        .eq('id', resignationId)
        .select(`
            *,
            employee_details (
                full_name
            ),
            profiles (
                email
            )
        `)
        .single();


    if (updateError) {
        console.error('Update Error:', updateError);
        return { success: false, error: updateError.message };
    }

    // 2. Send Ack Email
    if (resignation?.profiles?.email) {
        try {
            await resend.emails.send({
                from: process.env.RESEND_FROM_EMAIL || 'Retention Intelligence Hub <noreply@demos.resend.dev>',
                to: [(resignation as any).profiles.email],
                subject: 'Resignation Notice Received',
                react: ResignationAckEmail({ employeeName: (resignation as any).employee_details.full_name }),
            });

        } catch (emailError) {
            console.error('Email Error:', emailError);
            // Don't fail the action if email fails, but log it
        }
    }

    revalidatePath('/dashboard/resignation/[id]', 'page');
    return { success: true };
}

// Approve & Schedule (Step 3)
export async function approveResignation(resignationId: string, scheduleDate: Date) {
    const supabase = await createClient();

    const { data: resignation, error: updateError } = await supabase
        .from('resignations')
        .update({
            status: 'scheduled', // or 'approved'
            scheduled_interview_date: scheduleDate.toISOString(),
        })
        .eq('id', resignationId)
        .select(`
            *,
            employee_details (
                full_name
            ),
            profiles (
                email
            )
        `)
        .single();


    if (updateError) {
        return { success: false, error: updateError.message };
    }

    if (resignation?.profiles?.email) {
        try {
            await resend.emails.send({
                from: process.env.RESEND_FROM_EMAIL || 'Retention Intelligence Hub <noreply@demos.resend.dev>',
                to: [(resignation as any).profiles.email],
                subject: 'Exit Interview Scheduled',
                react: ResignationApprovalEmail({
                    employeeName: (resignation as any).employee_details.full_name,
                    interviewDate: format(scheduleDate, 'PPP p'), // e.g. "Apr 29, 2026 2:00 PM"
                }),
            });

        } catch (emailError) {
            console.error('Email Error:', emailError);
        }
    }

    revalidatePath('/dashboard/resignation/[id]', 'page');
    return { success: true };
}

// Decline (Step 3 Alternative)
export async function declineResignation(resignationId: string) {
    const supabase = await createClient();

    const { data: resignation, error: updateError } = await supabase
        .from('resignations')
        .update({
            status: 'declined',
        })
        .eq('id', resignationId)
        .select(`
            *,
            employee_details (
                full_name
            ),
            profiles (
                email
            )
        `)
        .single();


    if (updateError) {
        return { success: false, error: updateError.message };
    }

    if (resignation?.profiles?.email) {
        try {
            await resend.emails.send({
                from: process.env.RESEND_FROM_EMAIL || 'Retention Intelligence Hub <noreply@demos.resend.dev>',
                to: [(resignation as any).profiles.email],
                subject: 'Update Regarding Your Resignation',
                react: ResignationDeclineEmail({ employeeName: (resignation as any).employee_details.full_name }),
            });

        } catch (emailError) {
            console.error('Email Error:', emailError);
        }
    }

    revalidatePath('/dashboard/resignation/[id]', 'page');
    return { success: true };
}
