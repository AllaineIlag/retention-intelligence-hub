import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { EXIT_QUESTIONS } from "@/constants/questions";

// GET: Validate Token and Return Questions
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const token = searchParams.get("token");

  if (!token) {
    return NextResponse.json({ error: "Missing token" }, { status: 400 });
  }

  const supabase = await createClient();

  // Call RPC to fetch data securely
  const { data, error } = await supabase.rpc("get_exit_form_data", {
    token_id: token,
  });

  if (error || !data) {
    return NextResponse.json(
      { error: "Invalid token", details: error },
      { status: 404 },
    );
  }

  // Data structure: { id, status, employee_name }
  // Check completion
  const resignation = data as { status: string; employee_name?: string };
  if (resignation.status === "completed") {
    return NextResponse.json(
      { error: "Exit interview already completed" },
      { status: 403 },
    );
  }

  return NextResponse.json({
    questions: EXIT_QUESTIONS,
    employeeName: resignation.employee_name || "Valued Employee",
  });
}

// POST: Submit Answers
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, answers } = body;

    if (!token || !answers) {
      return NextResponse.json(
        { error: "Missing token or answers" },
        { status: 400 },
      );
    }

    const supabase = await createClient();

    // Call RPC to submit securely
    const { error: rpcError } = await supabase.rpc("submit_exit_form", {
      token_id: token,
      answers: answers,
    });

    if (rpcError) {
      console.error("Error submitting exit form:", rpcError);
      return NextResponse.json(
        { error: "Failed to submit answers", details: rpcError },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Unexpected error in exit-form POST:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
