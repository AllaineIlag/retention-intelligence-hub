'use server';

import { createClient } from '@/lib/supabase/server';
import { headers } from 'next/headers';
import { createAdminClient } from '@/lib/supabase/admin';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function login(prevState: any, formData: FormData) {
    const supabase = await createClient();
    const email = formData.get('email') as string;
    const origin = (await headers()).get('origin');

    if (!email) {
        return { success: false, message: 'Email is required' };
    }

    // Security Check: Verify email exists in profiles BEFORE sending magic link
    // We use the Admin Client because standard users (or anon) cannot query profiles freely
    const adminClient = createAdminClient();
    const { data: profile, error: profileError } = await adminClient
        .from('profiles')
        .select('id')
        .eq('email', email)
        .single();

    if (profileError || !profile) {
        // Silent failure or explicit error?
        // Explicit for now to avoid confusion, but generic message is better for security in public apps.
        // For internal enterprise app, meaningful error is acceptable.
        console.error('Login refused: Email not found in profiles', email);
        return {
            success: false,
            message: 'Access Denied: This email is not authorized for system access.'
        };
    }

    const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
            emailRedirectTo: `${origin}/auth/callback`,
        },
    });

    if (error) {
        return { success: false, message: error.message };
    }

    // redirect('/login?message=Check email for Magic Link');
    return { success: true, message: 'Magic link sent! Check your email.' };
}
