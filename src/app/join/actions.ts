'use server';

import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { headers } from 'next/headers';

export async function loginWithInvite(slug: string) {
    // Set the cookie to track the invite slug across the OAuth flow
    const cookieStore = await cookies();
    cookieStore.set('pending_invite_slug', slug, { path: '/', httpOnly: true, maxAge: 3600 }); // 1 hour expiration

    const supabase = await createClient();
    const origin = (await headers()).get('origin') || process.env.NEXT_PUBLIC_SITE_URL;

    const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
            redirectTo: `${origin}/auth/callback?invite_type=${slug}`,
            queryParams: {
                access_type: 'offline',
                prompt: 'consent',
            },
        },
    });

    if (error) {
        console.error('Invite Login Error:', error);
        return { error: error.message };
    }

    if (data.url) {
        redirect(data.url);
    }

    return { error: 'No redirect URL returned' };
}
