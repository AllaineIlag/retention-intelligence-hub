import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import {
  EmployeesTable,
  Resignation,
} from "@/components/dashboard/employees-table";

interface EmployeeData {
  full_name: string;
  email: string;
  role: string;
}

interface RawResignation {
  id: string;
  status: string;
  last_working_day: string;
  employee: EmployeeData | EmployeeData[] | null;
}

export default async function EmployeesPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch Resignations with Employee details
  const { data: resignations, error } = await supabase
    .from("resignations")
    .select(
      `
      id,
      status,
      last_working_day,
      employee:employees (
        full_name,
        email,
        role
      )
    `,
    )
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching resignations:", error);
    // In a real app, handle error UI
  }

  // Type assertion since Supabase types might be inferred loosely
  // or we can use the explicit Type from database generated types if we had them.
  const formattedResignations: Resignation[] = (
    (resignations || []) as unknown as RawResignation[]
  ).map((r: RawResignation) => {
    // Supabase join can return employee as array or single object
    const emp = Array.isArray(r.employee) ? r.employee[0] : r.employee;
    return {
      id: r.id,
      status: r.status as Resignation["status"],
      last_working_day: r.last_working_day,
      employee: {
        full_name: emp?.full_name || "Unknown",
        email: emp?.email || "",
        role: emp?.role || "employee",
      },
    };
  });

  return (
    <div className="space-y-8 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">
          Employee List
        </h2>
      </div>
      <p className="text-zinc-500 dark:text-zinc-400">
        Review and manage all active resignation cases.
      </p>

      <EmployeesTable resignations={formattedResignations} />
    </div>
  );
}
