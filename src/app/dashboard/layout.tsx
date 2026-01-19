import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { AppSidebar } from "@/components/layout/app-sidebar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch role
  const { data: employee } = await supabase
    .from("employees")
    .select("role")
    .eq("email", user.email!)
    .single();

  if (!employee) {
    // Handle case where user is auth'd but not in employees table?
    // For now, redirect to login or error
    redirect("/login");
  }

  const userRole = employee.role as "lead" | "interviewer";

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-zinc-900">
      <AppSidebar userRole={userRole} userEmail={user.email} />
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}
