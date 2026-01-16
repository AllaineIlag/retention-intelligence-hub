'use client';

import { useEffect, useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import type { PieLabelRenderProps } from 'recharts';

interface StatsData {
  counts: {
    pending: number;
    approved: number;
    declined: number;
    completed: number;
    total: number;
  };
  monthlyStats: Record<string, number>;
  employeeCount: number;
}

const COLORS = ['#f59e0b', '#22c55e', '#ef4444', '#3b82f6'];

export default function StatsPage() {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch('/api/stats');
        const data = await res.json();
        setStats(data);
      } catch {
        console.error('Failed to fetch stats');
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  if (loading) {
    return <div className="text-white">Loading statistics...</div>;
  }

  if (!stats) {
    return <div className="text-red-400">Failed to load statistics</div>;
  }

  // Prepare pie chart data
  const pieData = [
    { name: 'Pending', value: stats.counts.pending },
    { name: 'Approved', value: stats.counts.approved },
    { name: 'Declined', value: stats.counts.declined },
    { name: 'Completed', value: stats.counts.completed },
  ].filter(d => d.value > 0);

  // Prepare bar chart data
  const barData = Object.entries(stats.monthlyStats)
    .map(([month, count]) => ({
      month: new Date(month + '-01').toLocaleDateString('en-US', {
        month: 'short',
        year: '2-digit',
      }),
      count,
    }))
    .sort((a, b) => a.month.localeCompare(b.month));

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Analytics & Statistics</h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
        <div className="rounded-xl bg-gray-800 p-6">
          <h3 className="text-sm font-medium text-gray-400">Total Resignations</h3>
          <p className="mt-2 text-3xl font-bold text-white">{stats.counts.total}</p>
        </div>
        <div className="rounded-xl bg-yellow-900/30 p-6">
          <h3 className="text-sm font-medium text-yellow-400">Pending</h3>
          <p className="mt-2 text-3xl font-bold text-yellow-300">{stats.counts.pending}</p>
        </div>
        <div className="rounded-xl bg-green-900/30 p-6">
          <h3 className="text-sm font-medium text-green-400">Completed</h3>
          <p className="mt-2 text-3xl font-bold text-green-300">{stats.counts.completed}</p>
        </div>
        <div className="rounded-xl bg-blue-900/30 p-6">
          <h3 className="text-sm font-medium text-blue-400">Total Employees</h3>
          <p className="mt-2 text-3xl font-bold text-blue-300">{stats.employeeCount}</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Status Distribution Pie Chart */}
        <div className="rounded-xl bg-gray-800 p-6">
          <h3 className="mb-4 text-lg font-semibold text-white">Status Distribution</h3>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(props: PieLabelRenderProps) => {
                    const name = props.name ?? '';
                    const percent = props.percent ?? 0;
                    return `${name} ${(percent * 100).toFixed(0)}%`;
                  }}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-400">No data available</p>
          )}
        </div>

        {/* Monthly Completions Bar Chart */}
        <div className="rounded-xl bg-gray-800 p-6">
          <h3 className="mb-4 text-lg font-semibold text-white">Monthly Completions</h3>
          {barData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="month" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1f2937', border: 'none' }}
                  labelStyle={{ color: '#fff' }}
                />
                <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-400">No completed resignations yet</p>
          )}
        </div>
      </div>
    </div>
  );
}
