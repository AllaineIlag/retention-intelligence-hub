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

  // Get audit logs
  const { data: logs, error } = await supabase
    .from('audit_log')
    .select(
      `
      *,
      profiles!audit_log_actor_id_fkey (email, full_name)
    `
    )
    .order('created_at', { ascending: false })
    .limit(100);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ logs });
}
