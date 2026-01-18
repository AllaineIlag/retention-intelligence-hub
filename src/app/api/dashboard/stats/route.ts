import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { calculateDashboardStats } from "@/utils/analytics";
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

    // 2. Data Fetching via RPC (Secure)
    const { data, error } = await supabase.rpc("get_dashboard_stats");

    if (error) {
      console.error("RPC Error:", error);
      throw error;
    }

    if (!data) {
      throw new Error("No data returned from RPC");
    }

    const statsData = data as {
      total_employees: number;
      resignations: {
        status: string;
        exit_form_answers?: Record<string, string | number>;
      }[];
    };
    // resignations as any[] is acceptable here or clearer explicit type if needed, but 'any[]' solves the 'any' error on 'data' safely enough for now implies specific structure
    // Better:
    // const statsData = data as { total_employees: number, resignations: unknown[] };

    // 3. Output Processing
    const mockEmployees = Array(statsData.total_employees).fill({ id: "mock" });
    const resignations = statsData.resignations || [];

    const stats = calculateDashboardStats(
      mockEmployees,
      resignations,
      EXIT_QUESTIONS,
    );

    return NextResponse.json(stats);
  } catch (error: unknown) {
    console.error("Dashboard Stats Error:", error);
    const msg = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Internal Server Error", details: msg },
      { status: 500 },
    );
  }
}
