'use client';

import { useEffect, useState } from 'react';

interface Resignation {
  id: string;
  status: string;
  user_id: string;
  last_working_day: string | null;
  scheduled_interview_date: string | null;
  created_at: string;
  profiles: {
    email: string;
    full_name: string | null;
  } | null;
}

export default function QueuePage() {
  const [resignations, setResignations] = useState<Resignation[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    async function fetchQueue() {
      try {
        const res = await fetch('/api/queue');
        const data = await res.json();
        setResignations(data.resignations || []);
      } catch {
        console.error('Failed to fetch queue');
      } finally {
        setLoading(false);
      }
    }
    fetchQueue();
  }, []);

  const filteredResignations =
    filter === 'all' ? resignations : resignations.filter(r => r.status === filter);

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      pending: 'bg-yellow-900/50 text-yellow-300',
      approved: 'bg-green-900/50 text-green-300',
      declined: 'bg-red-900/50 text-red-300',
      completed: 'bg-blue-900/50 text-blue-300',
    };
    return styles[status] || 'bg-gray-700 text-gray-300';
  };

  if (loading) {
    return <div className="text-white">Loading queue...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Queue & Approvals</h1>

        {/* Filter */}
        <select
          value={filter}
          onChange={e => setFilter(e.target.value)}
          className="rounded-lg border border-gray-700 bg-gray-800 px-4 py-2 text-white"
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="declined">Declined</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl bg-gray-800">
        <table className="w-full text-left">
          <thead className="border-b border-gray-700">
            <tr>
              <th className="px-6 py-4 text-sm font-medium text-gray-400">Employee</th>
              <th className="px-6 py-4 text-sm font-medium text-gray-400">Status</th>
              <th className="px-6 py-4 text-sm font-medium text-gray-400">Last Working Day</th>
              <th className="px-6 py-4 text-sm font-medium text-gray-400">Interview Date</th>
              <th className="px-6 py-4 text-sm font-medium text-gray-400">Submitted</th>
              <th className="px-6 py-4 text-sm font-medium text-gray-400">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredResignations.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-gray-400">
                  No resignations found
                </td>
              </tr>
            ) : (
              filteredResignations.map(resignation => (
                <tr key={resignation.id} className="border-b border-gray-700 hover:bg-gray-700/50">
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium text-white">
                        {resignation.profiles?.full_name || 'Unknown'}
                      </p>
                      <p className="text-sm text-gray-400">{resignation.profiles?.email}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-medium capitalize ${getStatusBadge(resignation.status)}`}
                    >
                      {resignation.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-300">
                    {resignation.last_working_day
                      ? new Date(resignation.last_working_day).toLocaleDateString()
                      : '-'}
                  </td>
                  <td className="px-6 py-4 text-gray-300">
                    {resignation.scheduled_interview_date
                      ? new Date(resignation.scheduled_interview_date).toLocaleString()
                      : '-'}
                  </td>
                  <td className="px-6 py-4 text-gray-300">
                    {new Date(resignation.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <a
                      href={`/dashboard/interview/${resignation.id}`}
                      className="text-blue-400 hover:underline"
                    >
                      View
                    </a>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
