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

  // Get user profile to check role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!profile || !['interviewer', 'lead'].includes(profile.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  // Get counts by status
  const { data: statusCounts, error: statusError } = await supabase
    .from('resignations')
    .select('status');

  if (statusError) {
    return NextResponse.json({ error: statusError.message }, { status: 500 });
  }

  const counts = {
    pending: 0,
    approved: 0,
    declined: 0,
    completed: 0,
    total: statusCounts?.length || 0,
  };

  statusCounts?.forEach(r => {
    if (r.status in counts) {
      counts[r.status as keyof typeof counts]++;
    }
  });

  // Get monthly completions (last 6 months)
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const { data: monthlyData, error: monthlyError } = await supabase
    .from('resignations')
    .select('completed_at')
    .eq('status', 'completed')
    .gte('completed_at', sixMonthsAgo.toISOString());

  if (monthlyError) {
    return NextResponse.json({ error: monthlyError.message }, { status: 500 });
  }

  // Group by month
  const monthlyStats: Record<string, number> = {};
  monthlyData?.forEach(r => {
    if (r.completed_at) {
      const month = new Date(r.completed_at).toISOString().slice(0, 7); // YYYY-MM
      monthlyStats[month] = (monthlyStats[month] || 0) + 1;
    }
  });

  // Get total employees count
  const { count: employeeCount } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .eq('role', 'employee');

  return NextResponse.json({
    counts,
    monthlyStats,
    employeeCount: employeeCount || 0,
  });
}
