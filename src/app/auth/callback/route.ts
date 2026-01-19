import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { getURL } from "@/utils/get-url";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  // if "next" is in param, use it as the redirect URL
  const next = searchParams.get("next") ?? "/dashboard/interviewer";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
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
