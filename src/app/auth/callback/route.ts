import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { getURL } from "@/utils/get-url";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  let next = searchParams.get("next") ?? "/dashboard";

  // Prepare the redirect URL
  let baseUrl = getURL();
  if (baseUrl.endsWith("/") && next.startsWith("/")) {
    baseUrl = baseUrl.slice(0, -1);
  }

  // Create response first, then attach cookies to it
  const response = NextResponse.redirect(`${baseUrl}${next}`);

  if (code) {
    // Create a Supabase client that sets cookies on the response
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
              response.cookies.set(name, value, options);
            });
          },
        },
      },
    );

    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // Get the authenticated user
      const {
        data: { user },
      } = await supabase.auth.getUser();

      // Check their role in the employees table
      if (user?.email) {
        const { data: employee } = await supabase
          .from("employees")
          .select("role")
          .eq("email", user.email)
          .single();

        // Override 'next' to Unified Dashboard if needed
        if (employee) {
          if (next === "/dashboard/interviewer" || next === "/dashboard/lead") {
            next = "/dashboard";
          }
          if (!searchParams.get("next")) {
            next = "/dashboard";
          }
        }
      }

      // Re-create the redirect URL with potentially updated 'next'
      let finalUrl = getURL();
      if (finalUrl.endsWith("/") && next.startsWith("/")) {
        finalUrl = finalUrl.slice(0, -1);
      }

      // Update the redirect location with the correct path
      response.headers.set("Location", `${finalUrl}${next}`);
      return response;
    }
  }

  // Return error page if code exchange failed
  return NextResponse.redirect(`${baseUrl}/auth/auth-code-error`);
}
