import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { getURL } from "@/utils/get-url";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const next = "/dashboard"; // Always go to dashboard after login

  // Get base URL
  let baseUrl = getURL();
  if (baseUrl.endsWith("/")) {
    baseUrl = baseUrl.slice(0, -1);
  }

  if (!code) {
    // No code provided, redirect to error page
    return NextResponse.redirect(`${baseUrl}/auth/auth-code-error`);
  }

  // Create the redirect response FIRST
  const redirectUrl = `${baseUrl}${next}`;
  const response = NextResponse.redirect(redirectUrl);

  // Create Supabase client that sets cookies on this response
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            // Ensure cookies are set with proper attributes for production
            response.cookies.set(name, value, {
              ...options,
              // Explicitly set these for cross-site cookie handling
              sameSite: "lax",
              secure: true,
            });
          });
        },
      },
    },
  );

  // Exchange the code for a session
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    console.error("Auth callback error:", error.message);
    return NextResponse.redirect(`${baseUrl}/auth/auth-code-error`);
  }

  // Session exchange successful - cookies are now set on the response
  // Return the response with cookies attached
  return response;
}
