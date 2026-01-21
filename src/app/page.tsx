'use client';

import Link from 'next/link';
import { ArrowRight, ShieldCheck, Zap, BarChart3 } from 'lucide-react';
import { motion } from 'framer-motion';

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
    },
  },
};

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      {/* Animated Background */}
      <div className="fixed inset-0 -z-20 overflow-hidden">
        <div className="absolute -top-1/2 left-1/2 h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-indigo-600/10 blur-[120px] animate-pulse" />
        <div className="absolute top-1/4 right-0 h-[400px] w-[400px] rounded-full bg-violet-500/10 blur-[100px] animate-pulse delay-700" />
      </div>

      {/* Navbar */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="sticky top-0 z-50 w-full border-b border-white/10 bg-background/80 backdrop-blur-xl"
      >
        <div className="container flex h-16 items-center justify-between px-6">
          <div className="flex items-center gap-2 font-bold text-xl tracking-tighter">
            <div className="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <BarChart3 className="text-white h-5 w-5" />
            </div>
            <span>
              Retention<span className="text-indigo-500">Hub</span>
            </span>
          </div>
          <nav className="hidden md:flex gap-6 text-sm font-medium text-muted-foreground">
            <a href="#features" className="hover:text-foreground transition-colors">
              Features
            </a>
            <a href="#about" className="hover:text-foreground transition-colors">
              About
            </a>
          </nav>
          <div className="flex gap-4">
            <Link
              href="/login"
              className="inline-flex h-9 items-center justify-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-indigo-500/20 transition-all hover:bg-indigo-700 hover:scale-105 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-indigo-700"
            >
              Sign In
            </Link>
          </div>
        </div>
      </motion.header>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="relative overflow-hidden py-24 lg:py-32 xl:py-40">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(45%_40%_at_50%_60%,rgba(79,70,229,0.15),transparent)] sm:bg-[radial-gradient(40%_40%_at_50%_50%,rgba(79,70,229,0.15),transparent)]" />
          <div className="container px-6 flex flex-col items-center text-center">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
              className="flex flex-col items-center"
            >
              <motion.div
                variants={fadeInUp}
                className="inline-flex items-center rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 text-sm font-medium text-indigo-400 mb-8 backdrop-blur-md"
              >
                <span className="flex h-2 w-2 rounded-full bg-indigo-500 mr-2 animate-pulse"></span>
                Retention Intelligence v6.0 Online
              </motion.div>
              <motion.h1
                variants={fadeInUp}
                className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl max-w-4xl bg-gradient-to-br from-white via-white/90 to-white/50 bg-clip-text text-transparent"
              >
                Predict. Prevent. <br />
                <span className="text-indigo-500">Retain.</span>
              </motion.h1>
              <motion.p
                variants={fadeInUp}
                className="mt-6 max-w-[42rem] leading-normal text-muted-foreground sm:text-xl sm:leading-8"
              >
                The advanced analytics platform for modern HR teams. Identify flight risks before they
                depart and secure your most valuable asset: your people.
              </motion.p>
              <motion.div variants={fadeInUp} className="mt-10 flex gap-4">
                <Link
                  href="/login"
                  className="group inline-flex h-12 items-center justify-center rounded-lg bg-indigo-600 px-8 text-sm font-medium text-white shadow-lg shadow-indigo-500/25 transition-all hover:bg-indigo-700 hover:scale-105"
                >
                  Access Dashboard
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
                <button
                  disabled
                  className="inline-flex h-12 items-center justify-center rounded-lg border border-white/10 bg-white/5 px-8 text-sm font-medium text-white transition-colors hover:bg-white/10"
                >
                  Read the Documentation
                </button>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Features Grid */}
        <section id="features" className="container px-6 py-24 sm:py-32 border-t border-white/5">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            <FeatureCard
              icon={<Zap className="h-6 w-6 text-yellow-400" />}
              title="Real-time Analytics"
              description="Monitor turnover rates and sentiment analysis in real-time with our advanced dashboard."
            />
            <FeatureCard
              icon={<ShieldCheck className="h-6 w-6 text-emerald-400" />}
              title="Secure RBAC"
              description="Enterprise-grade Role-Based Access Control ensures data privacy and compliance."
            />
            <FeatureCard
              icon={<BarChart3 className="h-6 w-6 text-indigo-400" />}
              title="Predictive Modeling"
              description="AI-driven insights to identify at-risk employees before resignation."
            />
          </motion.div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 py-12 bg-black/20">
        <div className="container px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex flex-col items-center md:items-start gap-2">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} <span className="font-medium text-gray-400">@League of Developer</span>. All rights reserved.
            </p>
            <p className="text-xs text-muted-foreground/50">
              Retention Intelligence Hub
            </p>
          </div>
          <div className="flex gap-4 text-sm text-muted-foreground">
            <Link href="#" className="hover:text-white transition-colors">
              Privacy
            </Link>
            <Link href="#" className="hover:text-white transition-colors">
              Terms
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <motion.div
      variants={fadeInUp}
      className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-8 transition-all hover:bg-white/10 hover:border-white/20 hover:scale-[1.02]"
    >
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-white/5 group-hover:bg-white/10 transition-colors">
        {icon}
      </div>
      <h3 className="mb-2 text-xl font-bold text-white">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </motion.div>
  );
}
