"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";

export async function login(formData: FormData) {
  const supabase = await createClient();

  // Type-casting the email to string
  const email = formData.get("email") as string;

  // Simple validation
  if (!email) {
    redirect("/login?error=Email is required");
  }

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      // Redirect to the callback route which handles the session exchange
      emailRedirectTo: `${process.env.NEXT_PUBLIC_BASE_URL || `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` || "http://localhost:3000"}/auth/callback`,
    },
  });

  if (error) {
    redirect("/login?error=Could not authenticate user");
  }

  revalidatePath("/", "layout");
}
