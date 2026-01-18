"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ArrowRight, Mail } from "lucide-react";
import { login } from "@/app/login/actions";

export function MagicLoginForm() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData();
    formData.append("email", email);

    await login(formData); // This will redirect on error, so success flows happen here conceptually if we want manual handling, but the action handles simple auth.
    // However, for Supabase magic link, it sends an email. The action we wrote redirects on error but doesn't return on success (it revalidates).
    // Wait, the action handles the signInWithOtp. If successful, it just finishes. We should probably show the "Check your inbox" state in the UI.
    // Let's modify the action usage slightly or just assume if it returns, it's safe to show success.

    setIsLoading(false);
    setIsSent(true);
  };

  if (isSent) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="rounded-lg border border-green-500/20 bg-green-500/10 p-6 text-center text-green-200"
      >
        <Mail className="mx-auto mb-4 h-12 w-12 text-green-400" />
        <h3 className="mb-2 text-xl font-semibold">Check your inbox</h3>
        <p className="text-sm opacity-80">
          We&apos;ve sent a magic link to <strong>{email}</strong>
        </p>
      </motion.div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <label htmlFor="email" className="text-sm font-medium text-zinc-400">
          Email Address
        </label>
        <div className="relative">
          <Input
            id="email"
            type="email"
            placeholder="name@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="h-12 border-zinc-700 bg-zinc-900/50 pl-11 text-zinc-100 placeholder:text-zinc-500 focus:border-zinc-500 focus:ring-zinc-500"
            required
            autoComplete="email"
          />
          <Mail className="absolute top-3.5 left-3 h-5 w-5 text-zinc-500" />
        </div>
      </div>

      <Button
        type="submit"
        className="h-12 w-full bg-white font-semibold text-black transition-all hover:bg-zinc-200"
        loading={isLoading}
      >
        <span>Enter the Vault</span>
        {!isLoading && <ArrowRight className="ml-2 h-4 w-4" />}
      </Button>
    </form>
  );
}
