'use client';

import { useEffect, useState } from 'react';

interface AuditLog {
  id: string;
  action: string;
  target_type: string | null;
  target_id: string | null;
  details: Record<string, unknown> | null;
  ip_address: string | null;
  created_at: string;
  profiles: {
    email: string;
    full_name: string | null;
  } | null;
}

export default function AuditLogPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLogs() {
      try {
        const res = await fetch('/api/audit-log');
        const data = await res.json();
        setLogs(data.logs || []);
      } catch {
        console.error('Failed to fetch audit logs');
      } finally {
        setLoading(false);
      }
    }
    fetchLogs();
  }, []);

  if (loading) {
    return <div className="text-white">Loading audit logs...</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Audit Log</h1>
      <p className="text-gray-400">System activity tracking (last 100 entries)</p>

      <div className="overflow-x-auto rounded-xl bg-gray-800">
        <table className="w-full text-left">
          <thead className="border-b border-gray-700">
            <tr>
              <th className="px-6 py-4 text-sm font-medium text-gray-400">Timestamp</th>
              <th className="px-6 py-4 text-sm font-medium text-gray-400">Actor</th>
              <th className="px-6 py-4 text-sm font-medium text-gray-400">Action</th>
              <th className="px-6 py-4 text-sm font-medium text-gray-400">Target</th>
              <th className="px-6 py-4 text-sm font-medium text-gray-400">Details</th>
            </tr>
          </thead>
          <tbody>
            {logs.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-gray-400">
                  No audit logs recorded yet
                </td>
              </tr>
            ) : (
              logs.map(log => (
                <tr key={log.id} className="border-b border-gray-700 hover:bg-gray-700/50">
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-300">
                    {new Date(log.created_at).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-white">
                    {log.profiles?.full_name || log.profiles?.email || 'System'}
                  </td>
                  <td className="px-6 py-4">
                    <span className="rounded bg-blue-900/50 px-2 py-1 text-xs text-blue-300">
                      {log.action}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-300">
                    {log.target_type
                      ? `${log.target_type} (${log.target_id?.slice(0, 8)}...)`
                      : '-'}
                  </td>
                  <td className="max-w-xs truncate px-6 py-4 text-sm text-gray-400">
                    {log.details ? JSON.stringify(log.details) : '-'}
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
