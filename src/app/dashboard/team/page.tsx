import { createClient } from "@/utils/supabase/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
import { InviteUserForm } from "@/components/dashboard/invite-user-form";
import { UsersTable } from "@/components/dashboard/users-table";

export default async function TeamPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Service client for admin-level fetch if needed, though RLS should handle it strictly speaking,
  // but here we are checking role manually.
  const supabaseService = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } },
  );

  const { data: currentUserProfile } = await supabaseService
    .from("employees")
    .select("role")
    .eq("email", user.email)
    .single();

  if (currentUserProfile?.role !== "lead") {
    return (
      <div className="p-8 text-zinc-500 dark:text-zinc-400">
        Access Denied: You do not have permission to view this page.
      </div>
    );
  }

  // Fetch Interviewers
  const { data: users } = await supabaseService
    .from("employees")
    .select("*")
    .eq("role", "interviewer")
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-8 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">
          Team Management
        </h2>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Left Column: Invite Form */}
        <div className="lg:col-span-1">
          <InviteUserForm />
        </div>

        {/* Right Column: List */}
        <div className="lg:col-span-2">
          <UsersTable users={users || []} />
        </div>
      </div>
    </div>
  );
}
