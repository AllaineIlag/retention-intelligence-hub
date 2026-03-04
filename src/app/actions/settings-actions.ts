'use server';

import { createClient } from '@/lib/supabase/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';

// Initialize Admin Client for Settings Management (Service Role)
const adminSupabase = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    }
);

export type ReferenceItem = {
    id: string;
    name: string;
    is_active: boolean;
    created_at: string;
};

// --- Profile ---

export async function getProfile() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { error: 'Not authenticated' };

    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

    if (error) return { error: error.message };
    return { success: true, data };
}

// --- Departments ---

export async function getDepartments() {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('ref_departments')
        .select('*')
        .order('name', { ascending: true });

    if (error) {
        console.error('Error fetching departments:', error);
        return { error: error.message };
    }

    return { success: true, data: data as ReferenceItem[] };
}

export async function addDepartment(name: string) {
    try {
        const { data, error } = await adminSupabase
            .from('ref_departments')
            .insert({ name })
            .select()
            .single();

        if (error) {
            if (error.code === '23505') { // Unique violation
                return { error: 'Department already exists' };
            }
            console.error('Error adding department:', error);
            return { error: error.message };
        }

        revalidatePath('/dashboard/settings');
        return { success: true, data };
    } catch (err) {
        return { error: 'Internal Server Error' };
    }
}

export async function toggleDepartmentStatus(id: string, isActive: boolean) {
    const { error } = await adminSupabase
        .from('ref_departments')
        .update({ is_active: isActive })
        .eq('id', id);

    if (error) return { error: error.message };

    revalidatePath('/dashboard/settings');
    return { success: true };
}

// --- Positions ---

export async function getPositions() {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('ref_positions')
        .select('*')
        .order('name', { ascending: true });

    if (error) {
        console.error('Error fetching positions:', error);
        return { error: error.message };
    }

    return { success: true, data: data as ReferenceItem[] };
}

export async function addPosition(name: string) {
    try {
        const { data, error } = await adminSupabase
            .from('ref_positions')
            .insert({ name })
            .select()
            .single();

        if (error) {
            if (error.code === '23505') {
                return { error: 'Position already exists' };
            }
            console.error('Error adding position:', error);
            return { error: error.message };
        }

        revalidatePath('/dashboard/settings');
        return { success: true, data };
    } catch (err) {
        return { error: 'Internal Server Error' };
    }
}

export async function togglePositionStatus(id: string, isActive: boolean) {
    const { error } = await adminSupabase
        .from('ref_positions')
        .update({ is_active: isActive })
        .eq('id', id);

    if (error) return { error: error.message };

    revalidatePath('/dashboard/settings');
    return { success: true };
}

// --- Business Units ---

export async function getBusinessUnits() {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('ref_business_unit')
        .select('*')
        .order('name', { ascending: true });

    if (error) {
        console.error('Error fetching business units:', error);
        return { error: error.message };
    }

    return { success: true, data: data as ReferenceItem[] };
}

export async function addBusinessUnit(name: string) {
    try {
        const { data, error } = await adminSupabase
            .from('ref_business_unit')
            .insert({ name })
            .select()
            .single();

        if (error) {
            if (error.code === '23505') {
                return { error: 'Business unit already exists' };
            }
            console.error('Error adding business unit:', error);
            return { error: error.message };
        }

        revalidatePath('/dashboard/settings');
        return { success: true, data };
    } catch (err) {
        return { error: 'Internal Server Error' };
    }
}

export async function toggleBusinessUnitStatus(id: string, isActive: boolean) {
    const { error } = await adminSupabase
        .from('ref_business_unit')
        .update({ is_active: isActive })
        .eq('id', id);

    if (error) return { error: error.message };

    revalidatePath('/dashboard/settings');
    return { success: true };
}

// --- Supervisors ---

export async function getSupervisors() {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('ref_superior')
        .select('*')
        .order('name', { ascending: true });

    if (error) {
        console.error('Error fetching supervisors:', error);
        return { error: error.message };
    }

    return { success: true, data: data as ReferenceItem[] };
}

export async function addSupervisor(name: string) {
    try {
        const { data, error } = await adminSupabase
            .from('ref_superior')
            .insert({ name })
            .select()
            .single();

        if (error) {
            if (error.code === '23505') {
                return { error: 'Supervisor already exists' };
            }
            console.error('Error adding supervisor:', error);
            return { error: error.message };
        }

        revalidatePath('/dashboard/settings');
        return { success: true, data };
    } catch (err) {
        return { error: 'Internal Server Error' };
    }
}

export async function toggleSupervisorStatus(id: string, isActive: boolean) {
    const { error } = await adminSupabase
        .from('ref_superior')
        .update({ is_active: isActive })
        .eq('id', id);

    if (error) return { error: error.message };

    revalidatePath('/dashboard/settings');
    return { success: true };
}
