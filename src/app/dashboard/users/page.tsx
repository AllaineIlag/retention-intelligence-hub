'use client';

import { useEffect, useState } from 'react';

interface User {
  id: string;
  email: string;
  full_name: string | null;
  role: string;
  created_at: string;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/users');
      const data = await res.json();
      setUsers(data.users || []);
    } catch {
      console.error('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    setUpdating(userId);
    try {
      await fetch('/api/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, role: newRole }),
      });
      setUsers(prev => prev.map(u => (u.id === userId ? { ...u, role: newRole } : u)));
    } catch {
      console.error('Failed to update role');
    } finally {
      setUpdating(null);
    }
  };

  const getRoleBadge = (role: string) => {
    const styles: Record<string, string> = {
      lead: 'bg-purple-900/50 text-purple-300',
      interviewer: 'bg-blue-900/50 text-blue-300',
      employee: 'bg-gray-700 text-gray-300',
    };
    return styles[role] || 'bg-gray-700 text-gray-300';
  };

  if (loading) {
    return <div className="text-white">Loading users...</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">User Management</h1>

      <div className="overflow-x-auto rounded-xl bg-gray-800">
        <table className="w-full text-left">
          <thead className="border-b border-gray-700">
            <tr>
              <th className="px-6 py-4 text-sm font-medium text-gray-400">User</th>
              <th className="px-6 py-4 text-sm font-medium text-gray-400">Role</th>
              <th className="px-6 py-4 text-sm font-medium text-gray-400">Joined</th>
              <th className="px-6 py-4 text-sm font-medium text-gray-400">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id} className="border-b border-gray-700 hover:bg-gray-700/50">
                <td className="px-6 py-4">
                  <div>
                    <p className="font-medium text-white">{user.full_name || 'No name'}</p>
                    <p className="text-sm text-gray-400">{user.email}</p>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-medium capitalize ${getRoleBadge(user.role)}`}
                  >
                    {user.role}
                  </span>
                </td>
                <td className="px-6 py-4 text-gray-300">
                  {new Date(user.created_at).toLocaleDateString()}
                </td>
                <td className="px-6 py-4">
                  <select
                    value={user.role}
                    onChange={e => handleRoleChange(user.id, e.target.value)}
                    disabled={updating === user.id}
                    className="rounded-lg border border-gray-600 bg-gray-700 px-3 py-1 text-sm text-white disabled:opacity-50"
                  >
                    <option value="employee">Employee</option>
                    <option value="interviewer">Interviewer</option>
                    <option value="lead">Lead</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
