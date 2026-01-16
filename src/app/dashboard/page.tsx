import { createClient } from '@/lib/supabase/server';

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, full_name')
    .eq('id', user?.id)
    .single();

  return (
    <div>
      <h1 className="text-3xl font-bold">Welcome to the Dashboard</h1>
      <p className="mt-2 text-gray-400">
        Hello, {profile?.full_name || user?.email}! You are logged in as a{' '}
        <span className="capitalize text-blue-400">{profile?.role || 'user'}</span>.
      </p>

      <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-3">
        {/* Quick Stats Placeholder */}
        <div className="rounded-xl bg-gray-800 p-6">
          <h3 className="text-sm font-medium text-gray-400">Pending Resignations</h3>
          <p className="mt-2 text-3xl font-bold text-white">--</p>
        </div>
        <div className="rounded-xl bg-gray-800 p-6">
          <h3 className="text-sm font-medium text-gray-400">Completed This Month</h3>
          <p className="mt-2 text-3xl font-bold text-white">--</p>
        </div>
        <div className="rounded-xl bg-gray-800 p-6">
          <h3 className="text-sm font-medium text-gray-400">Total Employees</h3>
          <p className="mt-2 text-3xl font-bold text-white">--</p>
        </div>
      </div>
    </div>
  );
}
