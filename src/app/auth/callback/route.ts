import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  // if "next" is in param, use it as the redirect URL
  const next = searchParams.get("next") ?? "/dashboard/interviewer";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      const forwardedHost = request.headers.get("x-forwarded-host"); // original origin before load balancer
      const isLocalEnv = process.env.NODE_ENV === "development";

      let baseUrl = origin;

      if (process.env.NEXT_PUBLIC_BASE_URL) {
        baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
      } else if (forwardedHost && !isLocalEnv) {
        baseUrl = `https://${forwardedHost}`;
      }

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
