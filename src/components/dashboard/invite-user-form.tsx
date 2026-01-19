"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, UserPlus } from "lucide-react";

export function InviteUserForm() {
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/lead/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, fullName }),
      });

      if (!res.ok) {
        throw new Error("Failed to invite user");
      }

      setEmail("");
      setFullName("");
      router.refresh(); // Refresh server components to show new user in table
    } catch (error) {
      console.error(error);
      alert("Error inviting user. Please check if email already exists.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-md">
      <div className="mb-4 flex items-center gap-2">
        <UserPlus className="h-5 w-5 text-zinc-400" />
        <h3 className="font-semibold text-white">Whitelist Interviewer</h3>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email" className="text-xs text-zinc-400">
            Email Address
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="colleague@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="border-white/10 bg-black/20 text-white placeholder:text-zinc-600 focus:border-white/20"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="fullName" className="text-xs text-zinc-400">
            Full Name
          </Label>
          <Input
            id="fullName"
            type="text"
            placeholder="John Doe"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
            className="border-white/10 bg-black/20 text-white placeholder:text-zinc-600 focus:border-white/20"
          />
        </div>

        <Button
          type="submit"
          className="w-full bg-white text-black hover:bg-zinc-200"
          disabled={loading}
        >
          {loading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            "Add to Whitelist"
          )}
        </Button>
      </form>
    </div>
  );
}
