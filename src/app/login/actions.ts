'use server';

import { createClient } from '@/lib/supabase/server';
import { headers } from 'next/headers';
import { createAdminClient } from '@/lib/supabase/admin';
import { redirect } from 'next/navigation';

// Email-based authentication (OTP/Magic Link) has been decommissioned in favor of strict Google OAuth only.



export async function login(formData: FormData) {
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    if (!email || !password) {
        return { success: false, message: 'Email and password are required.' };
    }

    try {
        const supabase = await createClient();
        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            console.error('[Auth] Login Error:', error);
            return { success: false, message: error.message };
        }

        redirect('/dashboard');
    } catch (error) {
        if (error instanceof Error && error.message === 'NEXT_REDIRECT') {
            throw error;
        }
        console.error('[Auth] Login Exception:', error);
        return { success: false, message: 'An unexpected error occurred during login.' };
    }
}
