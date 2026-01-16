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

  // Check if Lead
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'lead') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  // Get all completed resignations with full PII
  const { data: records, error } = await supabase
    .from('resignations')
    .select(
      `
      id,
      status,
      last_working_day,
      completed_at,
      profiles!resignations_user_id_fkey (
        id,
        email,
        full_name
      ),
      exit_answers (
        question_id,
        original_value,
        verified_value,
        questions (question_text)
      )
    `
    )
    .eq('status', 'completed')
    .order('completed_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ records });
}
