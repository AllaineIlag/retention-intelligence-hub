import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { NextResponse, type NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
    const supabase = await createClient();

    await supabase.auth.signOut();

    return NextResponse.redirect(new URL('/login', request.url), {
        status: 302,
    });
}
