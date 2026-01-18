"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Loader2, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";

interface User {
  id: string;
  full_name: string;
  email: string;
  role: string;
  created_at: string;
}

interface UsersTableProps {
  users: User[];
}

export function UsersTable({ users }: UsersTableProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const router = useRouter();

  const handleRevoke = async (id: string) => {
    if (
      !confirm("Are you sure you want to revoke access? This cannot be undone.")
    )
      return;

    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/users?id=${id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to revoke access");

      router.refresh();
    } catch (error) {
      console.error(error);
      alert("Failed to revoke access.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="overflow-hidden rounded-xl border border-white/10 bg-white/5 backdrop-blur-md">
      <div className="border-b border-white/10 bg-white/5 p-4 py-3">
        <div className="flex items-center gap-2">
          <Shield className="h-4 w-4 text-emerald-500" />
          <h3 className="font-semibold text-white">Active Interviewers</h3>
        </div>
      </div>

      <div className="p-0">
        <table className="w-full text-left text-sm">
          <thead className="bg-white/5 text-xs text-zinc-400">
            <tr>
              <th className="px-6 py-3 font-medium">Name</th>
              <th className="px-6 py-3 font-medium">Email</th>
              <th className="px-6 py-3 font-medium">Role</th>
              <th className="px-6 py-3 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-white/5">
                <td className="px-6 py-4 font-medium text-zinc-200">
                  {user.full_name}
                </td>
                <td className="px-6 py-4 text-zinc-400">{user.email}</td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center rounded-full bg-blue-500/10 px-2 py-1 text-xs font-medium text-blue-400 ring-1 ring-blue-500/20 ring-inset">
                    {user.role}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <Button
                    onClick={() => handleRevoke(user.id)}
                    disabled={deletingId === user.id}
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-zinc-500 hover:bg-red-500/10 hover:text-red-500"
                  >
                    {deletingId === user.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </Button>
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td colSpan={4} className="p-8 text-center text-zinc-500">
                  No interviewers found. Invite someone to help you!
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
