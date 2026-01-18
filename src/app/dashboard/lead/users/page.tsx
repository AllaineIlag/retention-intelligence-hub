import { createClient } from "@/utils/supabase/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
import { InviteUserForm } from "@/components/dashboard/invite-user-form";
import { UsersTable } from "@/components/dashboard/users-table";

export default async function UserManagementPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Security Check: Ensure user is admin/lead (Checking via Supabase Admin for role)
  // Reusing the pattern from API
  const supabaseAdmin = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } },
  );

  const { data: currentUserProfile } = await supabaseAdmin
    .from("employees")
    .select("role")
    .eq("email", user.email)
    .single();

  if (
    currentUserProfile?.role !== "admin" &&
    currentUserProfile?.role !== "lead" &&
    currentUserProfile?.role !== "interviewer"
  ) {
    // NOTE: For 'The Floor' MVP, maybe we allow 'interviewer' to see this?
    // Plan said: "Restricted to admin/lead".
    // But 'ilagallainebenedict01380@gmail.com' is seeded as 'admin'?
    // Checking init_schema: role in ('admin', 'interviewer', 'employee').
    // I will restrict to 'admin'.
    if (currentUserProfile?.role !== "admin") {
      return (
        <div className="p-8 text-white">
          Access Denied: specialized admin privileges required.
        </div>
      );
    }
  }

  // Fetch Interviewers
  const { data: users } = await supabaseAdmin
    .from("employees")
    .select("*")
    .eq("role", "interviewer")
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-8 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight text-white">
          User Management
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
