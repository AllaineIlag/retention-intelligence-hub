import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { LeadDashboardView } from "@/components/dashboard/views/lead-dashboard-view";
import { InterviewerDashboardView } from "@/components/dashboard/views/interviewer-dashboard-view";

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: employee } = await supabase
    .from("employees")
    .select("role")
    .eq("email", user.email!)
    .single();

  if (!employee) {
    redirect("/login");
  }

  const role = employee.role;

  return (
    <div className="h-full">
      {role === "lead" ? <LeadDashboardView /> : <InterviewerDashboardView />}
    </div>
  );
}
