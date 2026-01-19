import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { getURL } from "@/utils/get-url";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  // Default fallback if logic fails
  let next = searchParams.get("next") ?? "/dashboard";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      // 1. Get the authenticated user
      const {
        data: { user },
      } = await supabase.auth.getUser();

      // 2. Check their role in the employees table
      if (user?.email) {
        const { data: employee } = await supabase
          .from("employees")
          .select("role")
          .eq("email", user.email)
          .single();

        // 3. Override 'next' to Unified Dashboard
        if (employee) {
          // If 'next' was the old default, update it to the new unified path
          if (next === "/dashboard/interviewer" || next === "/dashboard/lead") {
            next = "/dashboard";
          }
          // Ensure we default to /dashboard if nothing specific was requested
          if (!searchParams.get("next")) {
            next = "/dashboard";
          }
        }
      }

      let baseUrl = getURL();

      // Ensure baseUrl doesn't end with a slash if next starts with one, avoid double slashes
      if (baseUrl.endsWith("/") && next.startsWith("/")) {
        baseUrl = baseUrl.slice(0, -1);
      }

      return NextResponse.redirect(`${baseUrl}${next}`);
    }
  }

  // return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/auth/auth-code-error`);
}
