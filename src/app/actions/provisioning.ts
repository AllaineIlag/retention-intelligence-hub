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

    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

    if (profile?.role !== 'lead') {
        return { success: false, error: 'Only Leads can provision users' };
    }

    // 2. Get details from directory
    const { data: employee, error: dirError } = await supabase
        .from('company_directory')
        .select('*')
        .eq('id', directoryId)
        .single();

    if (dirError || !employee) {
        return { success: false, error: 'Employee not found in directory' };
    }

    // 3. Provision User via Admin API
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
        // If user already exists, just upgrade their role (if needed) or return error
        return { success: false, error: authError.message };
    }

    // 4. Create/Update Profile
    const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
            id: newUser.user.id,
            email: employee.email,
            full_name: employee.full_name,
            role: 'interviewer',
            status: 'active'
        });

    if (profileError) {
        return { success: false, error: 'Failed to create system profile' };
    }

    revalidatePath('/dashboard/team/manage');

    return {
        success: true,
        message: `Interviewer provisioned successfully.`,
        credentials: {
            email: employee.email,
            tempPassword
        }
    };
}
