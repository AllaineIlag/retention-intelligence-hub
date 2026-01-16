import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Get resignation with answers and questions
  const { data: resignation, error } = await supabase
    .from('resignations')
    .select(
      `
      *,
      profiles!resignations_user_id_fkey (email, full_name),
      exit_answers (
        id,
        question_id,
        original_value,
        verified_value,
        questions (question_text, type, options)
      )
    `
    )
    .eq('id', id)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ resignation });
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { status, verified_answers } = body;

  // Update resignation status
  if (status) {
    const updateData: Record<string, unknown> = { status };
    if (status === 'completed') {
      updateData.completed_at = new Date().toISOString();
    }
    if (status === 'approved') {
      updateData.locked_at = new Date().toISOString();
    }

    const { error: updateError } = await supabase
      .from('resignations')
      .update(updateData)
      .eq('id', id);

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }
  }

  // Update verified answers
  if (verified_answers && Array.isArray(verified_answers)) {
    for (const answer of verified_answers) {
      await supabase
        .from('exit_answers')
        .update({ verified_value: answer.verified_value })
        .eq('id', answer.id);
    }
  }

  return NextResponse.json({ success: true });
}
