'use server';

import { createClient } from '@/lib/supabase/server';
import { headers } from 'next/headers';
import { createAdminClient } from '@/lib/supabase/admin';
import { redirect } from 'next/navigation';

// Email-based authentication (OTP/Magic Link) has been decommissioned in favor of strict Google OAuth only.



export async function loginWithGoogle() {
    let result;
    try {
        const supabase = await createClient();
        const origin = (await headers()).get('origin') || process.env.NEXT_PUBLIC_SITE_URL;

        console.log('[Auth] Initiating Google OAuth');

        result = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: `${origin}/auth/callback`,
                queryParams: {
                    access_type: 'offline',
                    prompt: 'consent',
                },
            },
        });
    } catch (error) {
        console.error('[Auth] Google Login Exception:', error);
        return { success: false, message: 'An unexpected error occurred during Google login.' };
    }

    if (result.error) {
        console.error('[Auth] Google OAuth Error:', result.error);
        return { success: false, message: result.error.message };
    }

    if (result.data.url) {
        redirect(result.data.url);
    }

    return { success: false, message: 'No redirect URL returned from Supabase.' };
}
