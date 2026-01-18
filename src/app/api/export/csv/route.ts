import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { EXIT_QUESTIONS } from "@/constants/questions";

export async function GET() {
  try {
    const supabase = await createClient();

    // 1. Security Check
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Fetch Data (Using RPC to bypass RLS securely)
    const { data: resignations, error } = await supabase.rpc("get_export_data");

    if (error) throw error;

    // 3. Transform to CSV
    const headers = [
      "Employee Name",
      "Email",
      "Resignation Date",
      "Status",
      ...EXIT_QUESTIONS.map((q) => q.text.replace(/,/g, " ")), // Escape commas in headers
    ];

    // Define expected RPC return type shape locally for mapping
    type ExportRow = {
      employee_name: string | null;
      employee_email: string | null;
      resignation_date: string;
      status: string;
      exit_form_answers: Record<string, string | number | null> | null;
    };

    const rows = (resignations as unknown as ExportRow[]).map((r) => {
      const answers = r.exit_form_answers || {};
      const answerCells = EXIT_QUESTIONS.map((q) => {
        const answer = answers[q.id];
        if (answer === undefined || answer === null) return "";

        // Handle different types
        if (typeof answer === "string") {
          // Escape quotes and commas
          return `"${answer.replace(/"/g, '""')}"`;
        }
        return answer;
      });

      return [
        r.employee_name || "Unknown",
        r.employee_email || "Unknown",
        new Date(r.resignation_date).toLocaleDateString(),
        r.status,
        ...answerCells,
      ].join(",");
    });

    const csvContent = [headers.join(","), ...rows].join("\n");

    // 4. Return as Download
    return new NextResponse(csvContent, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="exit-interviews-${new Date().toISOString().split("T")[0]}.csv"`,
      },
    });
  } catch (error: unknown) {
    console.error("Export Error:", error);
    const msg = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
