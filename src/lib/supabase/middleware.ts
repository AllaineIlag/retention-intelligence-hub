import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function updateSession(request: NextRequest) {
    let supabaseResponse = NextResponse.next({
        request,
    });

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll();
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value }) =>
                        request.cookies.set(name, value)
                    );
                    supabaseResponse = NextResponse.next({
                        request,
                    });
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options)
                    );
                },
            },
        }
    );

    // IMPORTANT: Avoid writing any logic between createServerClient and
    // supabase.auth.getUser(). A simple mistake could make it very hard to debug
    // issues with users being randomly logged out.

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (
        !user &&
        !request.nextUrl.pathname.startsWith('/login') &&
        !request.nextUrl.pathname.startsWith('/auth') &&
        !request.nextUrl.pathname.startsWith('/join') &&
        !request.nextUrl.pathname.startsWith('/pending') &&
        request.nextUrl.pathname !== '/'
    ) {
        // no user, redirect to login with context message
        const url = request.nextUrl.clone();
        url.pathname = '/login';
        url.searchParams.set('message', 'Please sign in to continue');
        return NextResponse.redirect(url);
    }

    // RBAC: Redirect pending users away from dashboard
    if (
        user &&
        request.nextUrl.pathname.startsWith('/dashboard')
    ) {
        // Quick check: fetch profile status from Supabase
        const { data: profile } = await supabase
            .from('profiles')
            .select('status')
            .eq('id', user.id)
            .single();

        if (profile?.status === 'pending') {
            const url = request.nextUrl.clone();
            url.pathname = '/pending';
            return NextResponse.redirect(url);
        }
    }

    return supabaseResponse;
}
