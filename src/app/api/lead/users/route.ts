import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import {
  createClient as createSupabaseClient,
  SupabaseClient,
} from "@supabase/supabase-js";

// Helper to check if current user is Lead
async function isLead(supabase: SupabaseClient) {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error || !user) return false;

  const supabaseService = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } },
  );

  const { data: employee } = await supabaseService
    .from("employees")
    .select("role")
    .eq("email", user.email)
    .single();

  return employee?.role === "lead";
}

const supabaseService = createSupabaseClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } },
);

export async function GET() {
  const supabase = await createClient();
  // Supabase Client types check
  if (!(await isLead(supabase))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: interviewers, error } = await supabaseService
    .from("employees")
    .select("*")
    .eq("role", "interviewer")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(interviewers);
}

export async function POST(request: Request) {
  const supabase = await createClient();
  if (!(await isLead(supabase))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const json = await request.json();
    const { email, fullName } = json;

    if (!email || !fullName) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    const { data, error } = await supabaseService
      .from("employees")
      .insert([
        {
          email,
          full_name: fullName,
          role: "interviewer",
        },
      ])
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const supabase = await createClient();
  if (!(await isLead(supabase))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "Missing user ID" }, { status: 400 });
  }

  const { error } = await supabaseService
    .from("employees")
    .delete()
    .eq("id", id)
    .eq("role", "interviewer");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
