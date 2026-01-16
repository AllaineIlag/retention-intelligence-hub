import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
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
    .select('id, locked_at, status')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (resignationError) {
    return NextResponse.json({ error: 'No resignation found' }, { status: 404 });
  }

  if (resignation.locked_at) {
    return NextResponse.json({ error: 'Form is locked' }, { status: 403 });
  }

  // Update status to submitted
  const { error: updateError } = await supabase
    .from('resignations')
    .update({
      status: 'pending',
      submitted_at: new Date().toISOString(),
    })
    .eq('id', resignation.id);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
