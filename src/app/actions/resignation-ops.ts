'use server';

import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { resend } from '@/lib/email';
import ResignationAckEmail from '@/emails/ResignationAckEmail';
import ResignationApprovalEmail from '@/emails/ResignationApprovalEmail';
import ResignationDeclineEmail from '@/emails/ResignationDeclineEmail';
import { format } from 'date-fns';
import { revalidatePath } from 'next/cache';
import { EMAIL_CONFIG } from '@/constants/enums';
import { notifyLeads } from './notification-actions';

// Verify Resignation (Step 2)
export async function verifyResignation(resignationId: string, lastWorkingDay: Date) {
    const supabase = await createClient();

    // 1. Update Resignation Status
    const { data: resignation, error: updateError } = await supabase
        .from('resignations')
        .update({
            status: 'pending_interview', // 'verified' is not a valid ENUM. Keep as pending_interview until scheduled.
            last_working_day: lastWorkingDay.toISOString(),
        })
        .eq('id', resignationId)
        .select(`
            *,
            company_directory (
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

    // 2. Send Ack Email (Fetch via Admin to bypass RLS)
    const admin = createAdminClient();
    const { data: detail } = await admin
        .from('resignations')
        .select(`id, personal_email, company_directory(full_name), profiles(email)`)
        .eq('id', resignationId)
        .single();

    const profile = Array.isArray(detail?.profiles) ? detail?.profiles[0] : detail?.profiles;
    const employeeDetails = Array.isArray(detail?.company_directory) ? detail?.company_directory[0] : detail?.company_directory;

    const targetEmail = detail?.personal_email || profile?.email;

    if (targetEmail) {
        const deliveryEmail = process.env.RESEND_TEST_EMAIL || targetEmail;
        try {
            await resend.emails.send({
                from: process.env.RESEND_FROM_EMAIL || EMAIL_CONFIG.FROM,
                to: [deliveryEmail],
                subject: 'Resignation Notice Received',
                react: ResignationAckEmail({ employeeName: employeeDetails?.full_name || 'Employee' }),
            });

        } catch (emailError) {
            console.error('Email Error:', emailError);
        }
    }

    revalidatePath('/dashboard/resignation/[id]', 'page');
    revalidatePath('/dashboard/interview/schedule');
    revalidatePath('/dashboard/team');
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
            company_directory (
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

    // Send Email (Fetch via Admin)
    const admin = createAdminClient();
    const { data: detail } = await admin
        .from('resignations')
        .select(`id, personal_email, company_directory(full_name), profiles(email)`)
        .eq('id', resignationId)
        .single();

    const profile = Array.isArray(detail?.profiles) ? detail?.profiles[0] : detail?.profiles;
    const employeeDetails = Array.isArray(detail?.company_directory) ? detail?.company_directory[0] : detail?.company_directory;

    const targetEmail = detail?.personal_email || profile?.email;

    if (targetEmail) {
        const deliveryEmail = process.env.RESEND_TEST_EMAIL || targetEmail;
        try {
            await resend.emails.send({
                from: process.env.RESEND_FROM_EMAIL || EMAIL_CONFIG.FROM,
                to: [deliveryEmail],
                subject: 'Exit Interview Scheduled',
                react: ResignationApprovalEmail({
                    employeeName: employeeDetails?.full_name || 'Employee',
                    interviewDate: format(scheduleDate, 'PPP p'), // e.g. "Apr 29, 2026 2:00 PM"
                }),
            });

        } catch (emailError) {
            console.error('Email Error:', emailError);
        }
    }

    revalidatePath('/dashboard/resignation/[id]', 'page');
    revalidatePath('/dashboard/interview/schedule');
    revalidatePath('/dashboard/team');
    return { success: true };
}

// Decline (Step 3 Alternative)
export async function declineResignation(resignationId: string) {
    const supabase = await createClient();

    const { data: resignation, error: updateError } = await supabase
        .from('resignations')
        .update({
            status: 'cancelled', // 'declined' is not in ENUM, using 'cancelled' to represent rejection/withdrawal
            // We could add 'declined' to ENUM in future if distinct state is needed.
        })
        .eq('id', resignationId)
        .select(`
            *,
            personal_email,
            company_directory (
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

    const profile = Array.isArray(resignation?.profiles) ? resignation?.profiles[0] : resignation?.profiles;
    const employeeDetails = Array.isArray(resignation?.company_directory) ? resignation?.company_directory[0] : resignation?.company_directory;

    const targetEmail = resignation?.personal_email || profile?.email;

    if (targetEmail) {
        const deliveryEmail = process.env.RESEND_TEST_EMAIL || targetEmail;
        try {
            await resend.emails.send({
                from: process.env.RESEND_FROM_EMAIL || EMAIL_CONFIG.FROM,
                to: [deliveryEmail],
                subject: 'Update Regarding Your Resignation',
                react: ResignationDeclineEmail({ employeeName: employeeDetails?.full_name || 'Employee' }),
            });

        } catch (emailError) {
            console.error('Email Error:', emailError);
        }
    }

    revalidatePath('/dashboard/resignation/[id]', 'page');
    return { success: true };
}

// Create Resignation (Step 2 - Hybrid)

// Create Resignation (Step 2 - Hybrid)

export async function createResignation(data: {
    name: string,
    email: string,
    department: string,
    businessUnit: string,
    intermediateSupervisor: string,
    lastWorkingDay: Date,
    directoryId?: string
}) {
    const supabaseAdmin = createAdminClient();
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

    // 1. Check or Invite User
    let userId: string;

    // First check if profile exists
    const { data: existingProfile } = await supabaseAdmin
        .from('profiles')
        .select('id')
        .eq('email', data.email)
        .single();

    if (existingProfile) {
        userId = existingProfile.id;
    } else {
        // Invite/Create User (Magic Link style - we effectively create them so they can claim account)
        // We use createUser to avoid sending default Supabase email
        const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
            email: data.email,
            email_confirm: true,
            user_metadata: { full_name: data.name }
        });

        if (createError) {
            // If user exists in Auth but not Profile (rare cleanup issue), try to find them
            if (createError.message.includes('already registered')) {
                // Try to list users to find ID - expensive but necessary fallback
                // Or we can just fail and ask admin to check
                return { success: false, error: 'User already exists in Auth but no Profile found. Please contact support.' };
            }
            return { success: false, error: createError.message };
        }

        userId = newUser.user.id;

        // Create Profile (if trigger didn't catch it yet, but trigger usually runs on INSERT to auth.users)
        // We'll upsert just to be sure and set role
        await supabaseAdmin.from('profiles').upsert({
            id: userId,
            email: data.email,
            full_name: data.name,
            role: 'employee'
        });
    }

    // NOTE: Employee details now live in company_directory (via directory_id on resignations).
    // No separate employee_details upsert needed.

    // 3. Create Resignation Case
    const { data: resignation, error: resError } = await supabaseAdmin
        .from('resignations')
        .insert({
            status: 'pending_exit_form', // Initial state
            last_working_day: data.lastWorkingDay.toISOString(),
            directory_id: data.directoryId,
            personal_email: data.email // Store the original email as the routing target
        } as any)
        .select()
        .single();


    if (resError) {
        console.error('Resignation Error:', resError);
        return { success: false, error: 'Failed to create resignation case: ' + resError.message };
    }

    // Notify Leads
    await notifyLeads({
        title: 'New Resignation Submitted',
        message: `${data.name} (${data.department}) has submitted a resignation.`,
        type: 'warning',
        link: `/dashboard/resignation/${resignation.id}`
    });

    // 4. Send Acknowledgement Email
    // In dev/test mode, redirect all emails to RESEND_TEST_EMAIL if set.
    // This prevents delivery failures to mock @tdk.sim.com addresses.
    const deliveryEmail = process.env.RESEND_TEST_EMAIL || data.email;
    try {
        await resend.emails.send({
            from: process.env.RESEND_FROM_EMAIL || EMAIL_CONFIG.FROM,
            to: [deliveryEmail],
            subject: 'Resignation Notice Received - Pending Review',
            react: ResignationAckEmail({
                employeeName: data.name,
            }),
        });
    } catch (emailError: any) {
        console.error('Email Error:', emailError);
        revalidatePath('/dashboard/team');
        return {
            success: true,
            id: resignation.id,
            emailError: true,
            emailErrorMessage: emailError.message || 'Unknown delivery error'
        };
    }

    revalidatePath('/dashboard/team');
    return {
        success: true,
        id: resignation.id,
        emailError: false
    };
}
