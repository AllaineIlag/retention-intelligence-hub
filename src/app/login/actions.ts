'use server';

import { createClient } from '@/lib/supabase/server';
import { headers } from 'next/headers';
import { createAdminClient } from '@/lib/supabase/admin';
import { redirect } from 'next/navigation';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function sendOtp(prevState: any, formData: FormData) {
    try {
        const supabase = await createClient();
        const email = formData.get('email') as string;

        console.log('[Auth] Sending OTP to:', email);

        if (!email) {
            return { success: false, message: 'Email is required' };
        }

        // Security Check: Verify email exists in profiles
        const adminClient = createAdminClient();
        const { data: profile, error: profileError } = await adminClient
            .from('profiles')
            .select('id')
            .eq('email', email)
            .single();

        if (profileError || !profile) {
            console.error('[Auth] Login refused: Email not found', email);
            return {
                success: false,
                message: 'Access Denied: This email is not authorized for system access.'
            };
        }

        const { error } = await supabase.auth.signInWithOtp({
            email,
            options: {
                shouldCreateUser: false,
                // We still provide a redirect URL for magic link fallback, but the UI will ask for code
                // emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
            },
        });

        if (error) {
            console.error('[Auth] Supabase OTP Error:', error);
            return { success: false, message: error.message };
        }

        return { success: true, message: 'Code sent! Check your email.' };
    } catch (error) {
        console.error('[Auth] Unexpected Error:', error);
        return {
            success: false,
            message: 'An unexpected error occurred.'
        };
    }
}

export async function loginWithPassword(prevState: any, formData: FormData) {
    try {
        const supabase = await createClient();
        const email = formData.get('email') as string;
        const password = formData.get('password') as string;

        console.log('[Auth] Attempting Password Login for:', email);

        if (!email || !password) {
            return { success: false, message: 'Email and password are required' };
        }

        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            console.error('[Auth] Password Login Error:', error);
            return { success: false, message: error.message };
        }

        if (data.session) {
            // Check Role for Redirect
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('role')
                    .eq('id', user.id)
                    .single();

                if (profile?.role === 'employee') {
                    return { success: true, redirectUrl: '/exit-form' };
                }
            }
            return { success: true, redirectUrl: '/dashboard' };
        }

        return { success: false, message: 'Login failed' };
    } catch (error) {
        console.error('[Auth] Unexpected Error:', error);
        return { success: false, message: 'An unexpected error occurred.' };
    }
}

export async function verifyOtp(email: string, token: string) {
    try {
        const supabase = await createClient();
        console.log('[Auth] Verifying OTP for:', email);

        const { data: { session }, error } = await supabase.auth.verifyOtp({
            email,
            token,
            type: 'email',
        });

        if (error) {
            console.error('[Auth] Verify Error:', error);
            return { success: false, message: error.message };
        }

        if (!session) {
            return { success: false, message: 'Verification failed. No session created.' };
        }

        // Check Role for Redirect
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            const { data: profile } = await supabase
                .from('profiles')
                .select('role')
                .eq('id', user.id)
                .single();

            if (profile?.role === 'employee') {
                return { success: true, redirectUrl: '/exit-form' };
            }
        }

        return { success: true, redirectUrl: '/dashboard' };

    } catch (error) {
        console.error('[Auth] Verify Exception:', error);
        return { success: false, message: 'System error during verification.' };
    }
}

