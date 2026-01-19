"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { getURL } from "@/utils/get-url";

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
      emailRedirectTo: `${getURL()}/auth/callback`,
    },
  });

  if (error) {
    redirect("/login?error=Could not authenticate user");
  }

  revalidatePath("/", "layout");
}
