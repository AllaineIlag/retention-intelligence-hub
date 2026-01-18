"use client";

import { MagicLoginForm } from "@/components/magic-link-form";
import { motion } from "framer-motion";
import { Shield } from "lucide-react";

export default function LoginPage() {
  return (
    <div className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden bg-[#0a0a0a] p-4">
      {/* Ambient Background Effects */}
      <div className="pointer-events-none absolute top-0 left-0 h-full w-full overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] h-[50%] w-[50%] rounded-full bg-purple-900/10 blur-[120px]" />
        <div className="absolute right-[-10%] bottom-[-20%] h-[50%] w-[50%] rounded-full bg-blue-900/10 blur-[120px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="mb-8 flex flex-col items-center space-y-4 text-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="bg-primary/10 text-primary ring-primary/20 flex h-12 w-12 items-center justify-center rounded-xl ring-1"
          >
            <Shield className="h-6 w-6" />
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="text-3xl font-bold tracking-tight text-white sm:text-4xl"
          >
            Retention Intelligence
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="text-base text-zinc-500"
          >
            Secure access to your retention insights.
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="rounded-2xl border border-white/10 bg-zinc-900/50 p-8 shadow-2xl backdrop-blur-xl"
        >
          <MagicLoginForm />
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 1 }}
          className="mt-8 text-center"
        >
          <p className="text-xs text-zinc-600">
            &copy; 2026 League of Developer. Authorized personnel only.
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}
