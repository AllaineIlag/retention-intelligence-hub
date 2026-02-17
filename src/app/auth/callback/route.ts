import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url);
    const code = searchParams.get('code');
    const next = searchParams.get('next') ?? '/dashboard';

    if (code) {
        const supabase = await createClient();
        const { error } = await supabase.auth.exchangeCodeForSession(code);

        if (!error) {
            // Role Check
            const {
                data: { user },
            } = await supabase.auth.getUser();

            const forwardedHost = request.headers.get('x-forwarded-host'); // original origin before load balancer
            const isLocalEnv = process.env.NODE_ENV === 'development';

            // Determine the correct base URL for redirects
            let baseUrl = origin;
            if (isLocalEnv) {
                baseUrl = origin;
            } else if (forwardedHost) {
                baseUrl = `https://${forwardedHost}`;
            }

            if (user) {
                try {
                    // CHECK FOR INVITE COOKIE OR URL PARAM
                    const cookieStore = await cookies();
                    const cookieSlug = cookieStore.get('pending_invite_slug')?.value;
                    const urlSlug = searchParams.get('invite_type'); // More reliable than cookie

                    const inviteSlug = urlSlug || cookieSlug;

                    if (inviteSlug) {
                        // Consume the cookie if it exists
                        if (cookieSlug) cookieStore.delete('pending_invite_slug');
                        console.log('[Gatekeeper] Processing Invite Slug:', inviteSlug, 'for user:', user.email);

                        if (inviteSlug === 'hr-team') {
                            // HR/Interviewer Invite -> Create as Pending Interviewer
                            const { error: upsertError } = await supabase.from('profiles').upsert({
                                id: user.id,
                                email: user.email,
                                full_name: user.user_metadata.full_name || user.email?.split('@')[0],
                                avatar_url: user.user_metadata.avatar_url,
                                role: 'interviewer',
                                status: 'pending'
                            });

                            if (upsertError) {
                                console.error('[Gatekeeper] Profile upsert failed:', upsertError);
                                return NextResponse.redirect(`${baseUrl}/login?message=Account creation failed.`);
                            }

                            return NextResponse.redirect(`${baseUrl}/pending`);
                        }

                        if (inviteSlug === 'exit-process') {
                            // Employee Invite -> Check against Resignations (Exit Case)
                            const { data: resignation } = await supabase
                                .from('resignations')
                                .select('id')
                                .eq('personal_email', user.email)
                                .single();

                            if (resignation) {
                                console.log('[Gatekeeper] Exit Case Found. Linking User:', user.id, 'to Resignation:', resignation.id);
                                // Link User to Resignation
                                await supabase
                                    .from('resignations')
                                    .update({ employee_id: user.id })
                                    .eq('id', resignation.id);

                                // Create Active Employee Profile
                                await supabase.from('profiles').upsert({
                                    id: user.id,
                                    email: user.email,
                                    role: 'employee',
                                    status: 'active'
                                });
                                return NextResponse.redirect(`${baseUrl}/exit-form`);
                            } else {
                                console.warn('[Gatekeeper] No Exit Case found for:', user.email);
                                // No matching case found
                                return NextResponse.redirect(`${baseUrl}/join/no-case-found`);
                            }
                        }
                    }

                    // EXISTING LOGIC (Fallback for direct logins)
                    // Check if profile exists
                    const { data: profile, error: profileError } = await supabase
                        .from('profiles')
                        .select('role, id, status')
                        .eq('id', user.id)
                        .single();

                    if (profileError && profileError.code === 'PGRST116') {
                        // Profile does not exist - Create new 'pending' profile (Default Gatekeeper Logic)
                        console.log('[Gatekeeper] New user detected (No Invite). Creating pending profile for:', user.email);

                        const { error: insertError } = await supabase
                            .from('profiles')
                            .insert([
                                {
                                    id: user.id,
                                    email: user.email,
                                    full_name: user.user_metadata.full_name || user.email?.split('@')[0],
                                    avatar_url: user.user_metadata.avatar_url,
                                    role: 'employee', // Default to employee
                                    status: 'pending' // Default to pending until HR activation
                                }
                            ]);

                        if (insertError) {
                            console.error('[Gatekeeper] Profile creation failed:', insertError);
                            return NextResponse.redirect(`${baseUrl}/login?message=Account creation failed.`);
                        }

                        // Default redirection for new users without invite
                        return NextResponse.redirect(`${baseUrl}/pending`);
                    } else if (profile) {
                        // Profile exists - Check Status first, then Role
                        if (profile.status === 'pending') {
                            return NextResponse.redirect(`${baseUrl}/pending`);
                        }
                        if (profile.role === 'employee') {
                            return NextResponse.redirect(`${baseUrl}/exit-form`);
                        }
                        // Interviewer/Admin/Lead (active)
                        return NextResponse.redirect(`${baseUrl}/dashboard`);
                    } else {
                        // Unexpected error fetching profile
                        console.error('[Gatekeeper] Profile fetch error:', profileError);
                        return NextResponse.redirect(`${baseUrl}/login?message=Profile access error.`);
                    }

                } catch (err) {
                    console.error('Auth Callback Unexpected Error:', err);
                    return NextResponse.redirect(`${baseUrl}/login?message=System error during login.`);
                }
            } else {
                return NextResponse.redirect(`${baseUrl}/login?message=Authentication failed.`);
            }

            return NextResponse.redirect(`${baseUrl}${next}`);
        }
    }

    // return the user to an error page with instructions
    return NextResponse.redirect(`${origin}/auth/auth-code-error`);
}
