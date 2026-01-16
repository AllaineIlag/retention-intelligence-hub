import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Get user's resignation
  const { data: resignation, error: resignationError } = await supabase
    .from('resignations')
    .select('*, exit_answers(*)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (resignationError && resignationError.code !== 'PGRST116') {
    return NextResponse.json({ error: resignationError.message }, { status: 500 });
  }

  return NextResponse.json({ resignation });
}

export async function POST(request: Request) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { answers } = body;

  if (!answers || !Array.isArray(answers)) {
    return NextResponse.json({ error: 'Invalid answers format' }, { status: 400 });
  }

  // Get or create resignation
  const { data: existingResignation } = await supabase
    .from('resignations')
    .select('id, locked_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  let resignationId: string;
  let isLocked = false;

  if (!existingResignation) {
    // Create new resignation record
    const { data: newResignation, error: createError } = await supabase
      .from('resignations')
      .insert({ user_id: user.id, status: 'pending' })
      .select()
      .single();

    if (createError || !newResignation) {
      return NextResponse.json(
        { error: createError?.message || 'Failed to create resignation' },
        { status: 500 }
      );
    }
    resignationId = newResignation.id;
  } else {
    resignationId = existingResignation.id;
    isLocked = !!existingResignation.locked_at;
  }

  // Check if locked
  if (isLocked) {
    return NextResponse.json({ error: 'Form is locked for editing' }, { status: 403 });
  }

  // Upsert answers
  const answersToUpsert = answers.map((answer: { question_id: string; value: unknown }) => ({
    resignation_id: resignationId,
    question_id: answer.question_id,
    original_value: answer.value,
  }));

  const { error: upsertError } = await supabase.from('exit_answers').upsert(answersToUpsert, {
    onConflict: 'resignation_id,question_id',
  });

  if (upsertError) {
    return NextResponse.json({ error: upsertError.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, resignation_id: resignationId });
}
