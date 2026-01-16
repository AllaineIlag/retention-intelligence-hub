import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { signOut } from '@/app/actions/auth';
import Link from 'next/link';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Get user profile for role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role, full_name, email')
    .eq('id', user.id)
    .single();

  const role = profile?.role || 'employee';
  const displayName = profile?.full_name || profile?.email || user.email;

  // Define navigation based on role
  const navigation = [
    { name: 'Queue', href: '/dashboard/queue', roles: ['interviewer', 'lead'] },
    { name: 'Stats', href: '/dashboard/stats', roles: ['interviewer', 'lead'] },
    { name: 'Users', href: '/dashboard/users', roles: ['lead'] },
    { name: 'Restricted', href: '/dashboard/restricted', roles: ['lead'] },
    { name: 'Audit Log', href: '/dashboard/audit-log', roles: ['lead'] },
  ];

  const filteredNav = navigation.filter(item => item.roles.includes(role));

  return (
    <div className="flex min-h-screen bg-gray-950">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 text-white">
        <div className="flex h-16 items-center justify-center border-b border-gray-800">
          <h2 className="text-lg font-bold text-blue-400">RIH Dashboard</h2>
        </div>

        {/* User Info */}
        <div className="border-b border-gray-800 p-4">
          <p className="truncate text-sm text-gray-400">{displayName}</p>
          <p className="text-xs capitalize text-blue-400">{role}</p>
        </div>

        {/* Navigation */}
        <nav className="mt-4 space-y-1 px-2">
          <Link
            href="/dashboard"
            className="block rounded-lg px-4 py-2 text-gray-300 transition-colors hover:bg-gray-800 hover:text-white"
          >
            Home
          </Link>
          {filteredNav.map(item => (
            <Link
              key={item.name}
              href={item.href}
              className="block rounded-lg px-4 py-2 text-gray-300 transition-colors hover:bg-gray-800 hover:text-white"
            >
              {item.name}
            </Link>
          ))}
        </nav>

        {/* Logout */}
        <div className="absolute bottom-0 w-64 border-t border-gray-800 p-4">
          <form action={signOut}>
            <button
              type="submit"
              className="w-full rounded-lg bg-red-600/20 px-4 py-2 text-sm text-red-400 transition-colors hover:bg-red-600/30"
            >
              Sign Out
            </button>
          </form>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8">
        <div className="text-white">{children}</div>
      </main>
    </div>
  );
}
