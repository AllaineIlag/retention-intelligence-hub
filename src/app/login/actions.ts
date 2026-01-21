'use server';

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { headers } from 'next/headers';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function login(prevState: any, formData: FormData) {
    const supabase = await createClient();
    const email = formData.get('email') as string;
    const origin = (await headers()).get('origin');

    if (!email) {
        return { success: false, message: 'Email is required' };
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
