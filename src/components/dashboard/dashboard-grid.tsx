"use client";

import { useEffect, useState } from "react";
import { DashboardStats } from "@/utils/analytics";
import { StatCard } from "./stat-card";
import { ProblemAreasTable } from "./problem-areas";
import { Users, UserMinus, ListTodo, Activity } from "lucide-react";
import { motion } from "framer-motion";

export function DashboardGrid() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch("/api/dashboard/stats");
        if (res.status === 401 || res.status === 403) {
          setError("Unauthorized access");
          return;
        }
        if (!res.ok) throw new Error("Failed to fetch");
        const data = await res.json();
        setStats(data);
      } catch (err) {
        console.error(err);
        setError("Could not load dashboard data.");
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-32 animate-pulse rounded-xl bg-white/5" />
        ))}
      </div>
    );
  }

  if (error) {
    return <div className="p-4 text-red-500">{error}</div>;
  }

  if (!stats) return null;

  return (
    <div className="space-y-6">
      {/* Top Row: Key Metrics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"
      >
        <StatCard
          title="Turnover Rate"
          value={`${stats.turnover_rate.rate_percentage}%`}
          icon={Activity}
          description="Resignations / Total Workforce"
        />
        <StatCard
          title="Pending Exit"
          value={stats.status_breakdown.pending}
          icon={UserMinus}
          description="Review required"
        />
        <StatCard
          title="Scheduled Interviews"
          value={stats.status_breakdown.scheduled}
          icon={ListTodo}
          description="Upcoming sessions"
        />
        <StatCard
          title="Active Workforce"
          value={stats.turnover_rate.active_employees}
          icon={Users}
          description="Total employees monitored"
        />
      </motion.div>

      {/* Second Row: Detailed Analysis */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid gap-4 md:grid-cols-7"
      >
        <div className="col-span-4 lg:col-span-5">
          <ProblemAreasTable data={stats.misunderstood_questions} />
        </div>
        {/* Placeholder for future widgets */}
      </motion.div>
    </div>
  );
}
