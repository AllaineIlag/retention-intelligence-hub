import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

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
                    const { data: profile, error: profileError } = await supabase
                        .from('profiles')
                        .select('role')
                        .eq('id', user.id)
                        .single();

                    if (profileError || !profile) {
                        console.error('Auth Callback Error: Profile not found for user', user.id);
                        return NextResponse.redirect(`${baseUrl}/login?message=Profile not found. Please contact support.`);
                    }

                    if (profile.role === 'employee') {
                        return NextResponse.redirect(`${baseUrl}/exit-form`);
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
