import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { AuditTable } from "@/components/audit/audit-table";

export default async function AuditPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // RLS Check (Lead Only)
  const { data: employee } = await supabase
    .from("employees")
    .select("role")
    .eq("email", user.email!)
    .single();

  if (employee?.role !== "lead") {
    return <div className="p-8">Access Denied</div>;
  }

  // Fetch Logs
  const { data: logs, error } = await supabase
    .from("audit_logs")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    console.error("Error fetching logs:", error);
  }

  return (
    <div className="space-y-8 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">
          Audit Logs
        </h2>
      </div>
      <p className="text-zinc-500 dark:text-zinc-400">
        Review system access and critical actions.
      </p>

      <AuditTable logs={logs || []} />
    </div>
  );
}
