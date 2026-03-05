'use server';

import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function provisionInterviewer(directoryId: string) {
    const supabase = await createClient();
    const adminSupabase = createAdminClient();

    // 1. Verify caller is a Lead
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: 'Unauthorized' };

    const { data: callerProfile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

    if (callerProfile?.role !== 'lead') {
        return { success: false, error: 'Only Leads can provision users' };
    }

    // 2. Get employee details from directory
    const { data: employee, error: dirError } = await supabase
        .from('company_directory')
        .select('*')
        .eq('id', directoryId)
        .single();

    if (dirError || !employee) {
        return { success: false, error: 'Employee not found in directory' };
    }

    // 3. Pre-flight: check if this employee is already provisioned (bypasses RLS)
    const { data: existingProfile } = await adminSupabase
        .from('profiles')
        .select('id, status')
        .eq('email', employee.email)
        .single();

    if (existingProfile) {
        return {
            success: false,
            error: `This employee already has an account (status: ${existingProfile.status}). Use the Active Team tab to manage their access.`
        };
    }

    // 4. Generate temp password and create auth user
    const tempPassword = `TDK-${Math.random().toString(36).slice(-8).toUpperCase()}!`;

    const { data: newUser, error: authError } = await adminSupabase.auth.admin.createUser({
        email: employee.email,
        password: tempPassword,
        email_confirm: true,
        user_metadata: {
            full_name: employee.full_name,
            role: 'interviewer'
        }
    });

    if (authError) {
        return { success: false, error: `Auth error: ${authError.message}` };
    }

    // 5. Create profile via admin client (bypasses RLS)
    const { error: profileError } = await adminSupabase
        .from('profiles')
        .upsert({
            id: newUser.user.id,
            email: employee.email,
            full_name: employee.full_name,
            role: 'interviewer',
            status: 'active'
        });

    if (profileError) {
        // Auth user was created but profile failed — roll back so Lead can retry cleanly
        await adminSupabase.auth.admin.deleteUser(newUser.user.id);
        return { success: false, error: `Profile error: ${profileError.message}` };
    }

    revalidatePath('/dashboard/team');

    return {
        success: true,
        message: 'Interviewer provisioned successfully.',
        credentials: {
            email: employee.email,
            tempPassword
        }
    };
}
