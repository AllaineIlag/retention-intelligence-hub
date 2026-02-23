'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, ShieldCheck, Zap, BarChart3, Lock, Shield, Database, LayoutDashboard, FileText, PieChart, Activity, GalleryVerticalEnd, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { StickySection, ScrollProgressFade, Reveal } from '@/components/landing/Scrollytelling';
import { ThemeToggle } from '@/components/dashboard/theme-toggle';
import { cn } from '@/lib/utils';

export default function LandingPage() {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/30 selection:text-primary-foreground relative overflow-hidden transition-colors duration-500 font-sans">
      {/* Dynamic Background Accents — Subtle & Professional */}
      <div className="fixed inset-0 -z-20 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 h-[1000px] w-[1000px] rounded-full bg-primary/5 blur-[120px]" />
        <div className="absolute bottom-0 right-0 h-[600px] w-[600px] rounded-full bg-accent/5 blur-[100px]" />
      </div>

      {/* Navbar — Minimalist & Sharp */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/60 backdrop-blur-md"
      >
        <div className="container flex h-20 items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-3.5 group">
            <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20 transition-transform group-hover:scale-105 overflow-hidden">
              <Image
                src="/tdk-logo.png"
                alt="TDK Branding"
                width={32}
                height={24}
                className="transition-all duration-300 dark:invert brightness-0 invert dark:brightness-100 dark:invert-0"
              />
            </div>
            <span className="font-bold text-2xl tracking-tight text-foreground">
              Retention<span className="text-primary">Hub</span>
            </span>
          </Link>

          <nav className="hidden md:flex gap-10 text-[13px] font-semibold uppercase tracking-wider text-muted-foreground/80">
            <a href="#strategy" className="hover:text-foreground transition-colors">Strategy</a>
            <a href="#engine" className="hover:text-foreground transition-colors">Engine</a>
            <a href="#vault" className="hover:text-foreground transition-colors">Vault</a>
          </nav>

          <div className="flex items-center gap-6">
            <ThemeToggle />
            <Link
              href="/login"
              className="inline-flex h-10 items-center justify-center rounded-lg bg-primary px-6 text-sm font-bold text-primary-foreground shadow-md transition-all hover:bg-primary/90 active:scale-95"
            >
              System Access
            </Link>
          </div>
        </div>
      </motion.header>

      <main className="relative">
        {/* PHASE 1: THE HOOK — Identification & Goal */}
        <section className="relative pt-32 pb-48 lg:pt-48 lg:pb-64 overflow-hidden">
          <div className="container px-6 flex flex-col items-center text-center">
            <Reveal>
              <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-[11px] font-bold text-primary mb-10 uppercase tracking-[0.2em]">
                <span className="flex h-1.5 w-1.5 rounded-full bg-primary mr-2.5 animate-pulse" />
                Enterprise Retention Intelligence v6.0
              </div>
            </Reveal>

            <Reveal delay={0.1}>
              <h1 className="text-6xl font-extrabold tracking-tight sm:text-7xl md:text-8xl max-w-5xl leading-[1.0] mb-8">
                Strategic <br className="hidden sm:block" />
                <span className="bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
                  Retention.
                </span>
              </h1>
            </Reveal>

            <Reveal delay={0.2}>
              <p className="max-w-3xl text-xl md:text-2xl text-muted-foreground leading-relaxed font-medium">
                Transform passive exit data into active business intelligence.
                Identify churn drivers and secure your talent infrastructure
                with a unified command center.
              </p>
            </Reveal>

            <Reveal delay={0.3}>
              <div className="mt-14 flex flex-col sm:flex-row gap-5 justify-center">
                <Link
                  href="/login"
                  className="group inline-flex h-14 items-center justify-center rounded-xl bg-primary px-10 text-[16px] font-bold text-primary-foreground shadow-2xl shadow-primary/30 transition-all hover:scale-[1.05] active:scale-95"
                >
                  Access Dashboard
                  <ArrowRight className="ml-2.5 h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            </Reveal>

            {/* Hero Visualization — High-Fidelity Mockup */}
            <div className="mt-32 w-full max-w-[1400px] mx-auto relative px-6">
              <ScrollProgressFade>
                <div className="relative rounded-[2.5rem] border border-border/10 bg-card/40 backdrop-blur-xl p-3 shadow-3xl overflow-hidden ring-1 ring-white/10 group">
                  <div className="aspect-[16/9] w-full rounded-[1.8rem] overflow-hidden relative shadow-inner">
                    <Image
                      src="/dashboard-mockup.png"
                      alt="Retention Intelligence Dashboard"
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-[1.02] brightness-[0.9] dark:brightness-100"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
                  </div>
                </div>
              </ScrollProgressFade>
            </div>
          </div>
        </section>

        {/* PHASE 2: THE STRATEGY — Sticky Reveal */}
        <section id="strategy" className="container px-6 border-t border-border/10 bg-background/40 py-48">
          <StickySection
            leftContent={
              <div className="space-y-8 pr-12 lg:pr-24">
                <div className="inline-flex h-20 w-20 items-center justify-center rounded-3xl bg-primary/10 border border-primary/20 shadow-xl shadow-primary/5">
                  <Zap className="h-10 w-10 text-primary" />
                </div>
                <h2 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-foreground leading-[1.1]">
                  Passive Data <br />
                  <span className="text-muted-foreground">to Strategy.</span>
                </h2>
                <p className="text-xl text-muted-foreground max-w-lg leading-relaxed font-medium">
                  Stop reacting to resignations. Start analyzing why they happen
                  at scale and build a resilient workforce architecture.
                </p>
              </div>
            }
          >
            {/* Story 1: Reliable Data Capture */}
            <div className="space-y-10 group">
              <div className="h-auto w-full rounded-3xl border border-border/10 bg-card/60 p-10 relative overflow-hidden transition-all group-hover:border-primary/30 group-hover:bg-primary/[0.03] shadow-lg">
                <FileText className="absolute bottom-[-33px] right-[-33px] w-64 h-64 opacity-[0.04] -rotate-12 transition-transform group-hover:scale-110" />
                <h3 className="text-3xl font-bold mb-5 tracking-tight">Reliable Data Capture</h3>
                <ul className="space-y-4 text-lg text-muted-foreground leading-relaxed font-medium">
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-6 w-6 flex-shrink-0 text-primary mt-1" />
                    <span>Seamless, non-intrusive Exit Forms ensure high completion rates.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-6 w-6 flex-shrink-0 text-primary mt-1" />
                    <span>Quality qualitative feedback captured without system-sent emails.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-6 w-6 flex-shrink-0 text-primary mt-1" />
                    <span>Zero bounce risk and maximum data integrity.</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Story 2: Intelligence Clustering */}
            <div className="space-y-10 group">
              <div className="h-auto w-full rounded-3xl border border-border/10 bg-card/60 p-10 relative overflow-hidden transition-all group-hover:border-primary/30 group-hover:bg-primary/[0.03] shadow-lg">
                <PieChart className="absolute bottom-[-33px] right-[-33px] w-64 h-64 opacity-[0.04] rotate-12 transition-transform group-hover:rotate-0" />
                <h3 className="text-3xl font-bold mb-5 tracking-tight">Intelligence Clustering</h3>
                <ul className="space-y-4 text-lg text-muted-foreground leading-relaxed font-medium">
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-6 w-6 flex-shrink-0 text-primary mt-1" />
                    <span>Automatically identify key reasons for employee departures.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-6 w-6 flex-shrink-0 text-primary mt-1" />
                    <span>Deep Dive analytics group sentiment by department and tenure.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-6 w-6 flex-shrink-0 text-primary mt-1" />
                    <span>Reveal hidden patterns and emerging risks within your workforce.</span>
                  </li>
                </ul>
              </div>
              <div className="grid grid-cols-1 gap-4">
                <div className="rounded-2xl border border-border/10 bg-card/40 p-5 shadow-sm space-y-4">
                  <div className="flex items-center justify-between border-b border-border/10 pb-3">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                        <div className="h-4 w-4 rounded-full bg-blue-500" />
                      </div>
                      <span className="text-base font-semibold">Compensation Alignment</span>
                    </div>
                    <span className="text-sm font-bold text-red-500 bg-red-500/10 px-3 py-1 rounded-full">32% Risk</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-full bg-amber-500/20 flex items-center justify-center">
                        <div className="h-4 w-4 rounded-full bg-amber-500" />
                      </div>
                      <span className="text-base font-semibold">Leadership Visibility</span>
                    </div>
                    <span className="text-sm font-bold text-amber-500 bg-amber-500/10 px-3 py-1 rounded-full">24% Risk</span>
                  </div>
                </div>
              </div>
            </div>
          </StickySection>
        </section>

        {/* PHASE 3: THE ENGINE — Technical Dominance */}
        <section id="engine" className="bg-zinc-950 dark:bg-[#030303] py-48 lg:py-64 relative overflow-hidden transition-colors duration-700">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_-20%,rgba(120,119,198,0.15),transparent)] pointer-events-none" />
          <div className="container px-6 relative z-10 text-center">
            <div className="max-w-5xl mx-auto mb-32">
              <Reveal>
                <h2 className="text-5xl sm:text-7xl font-extrabold tracking-tighter text-white mb-8">
                  Precision Engineering <br />
                  <span className="text-zinc-600">for Global Scale.</span>
                </h2>
                <p className="text-2xl text-zinc-400 leading-relaxed max-w-3xl mx-auto font-medium">
                  No black boxes. No magic. Just a production-grade tech stack
                  designed for reliability and extreme performance.
                </p>
              </Reveal>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              {[
                { icon: Database, title: "Supabase Core", desc: "Real-time sync with Row-Level Security baked into every query." },
                { icon: LayoutDashboard, title: "Server Compute", desc: "Next.js 16 Server Components for lightning-fast zero-latency delivery." },
                { icon: Shield, title: "Custom RBAC", desc: "Granite-solid permission layers ensuring sensitive data privacy." }
              ].map((item, idx) => (
                <Reveal delay={idx * 0.15} key={idx}>
                  <div className="p-12 rounded-[2rem] border border-zinc-900 bg-zinc-900/10 hover:border-zinc-700 transition-all hover:-translate-y-2 duration-500 group text-left h-full flex flex-col justify-center">
                    <item.icon className="h-10 w-10 text-primary mb-8 group-hover:scale-110 transition-transform duration-500" />
                    <h3 className="text-2xl font-bold text-white mb-5 tracking-tight">{item.title}</h3>
                    <p className="text-zinc-500 leading-relaxed text-[15px] font-medium">
                      {item.desc}
                    </p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* PHASE 4: THE VAULT — Security & Trust */}
        <section id="vault" className="py-48 lg:py-64 bg-background overflow-hidden relative border-t border-border/10">
          <div className="container px-6">
            <StickySection
              leftContent={
                <div className="space-y-8 pr-12 lg:pr-24">
                  <div className="inline-flex h-20 w-20 items-center justify-center rounded-3xl bg-primary/10 border border-primary/20 shadow-xl shadow-primary/5">
                    <Lock className="h-10 w-10 text-primary" />
                  </div>
                  <h2 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-foreground leading-[1.1]">
                    The Vault. <br />
                    <span className="text-muted-foreground">Hardened.</span>
                  </h2>
                  <p className="text-xl text-muted-foreground max-w-lg leading-relaxed font-medium">
                    Retention data is your most sensitive asset.
                    We treat it with the same rigor as financial records.
                  </p>
                </div>
              }
            >
              <div className="space-y-16">
                {[
                  { icon: ShieldCheck, title: "Anonymization Layer", desc: "Feedback is decoupled from PII to protect employee safety and ensure honest data." },
                  { icon: Database, title: "Zero Data Waste", desc: "We only store what is necessary for retention analysis. No tracking, no cookies." },
                  { icon: Activity, title: "Audit Transparency", desc: "Full traceability of every interaction. Know exactly who accessed which report." }
                ].map((item, idx) => (
                  <Reveal delay={idx * 0.1} key={idx}>
                    <div className="flex gap-10 items-start group">
                      <div className="mt-1 h-14 w-14 flex-shrink-0 rounded-2xl border border-border group-hover:border-primary/50 flex items-center justify-center transition-all bg-card/40 shadow-sm group-hover:shadow-primary/5 group-hover:-translate-y-1">
                        <item.icon className="h-7 w-7 text-muted-foreground group-hover:text-primary transition-colors" />
                      </div>
                      <div className="flex-1 border-b border-border/5 pb-10">
                        <h3 className="text-2xl font-bold mb-3 tracking-tight group-hover:text-primary transition-colors">{item.title}</h3>
                        <p className="text-lg text-muted-foreground leading-relaxed font-medium">
                          {item.desc}
                        </p>
                      </div>
                    </div>
                  </Reveal>
                ))}
              </div>
            </StickySection>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-border/20 py-16 bg-muted/5 relative z-10 w-full overflow-hidden">
          <div className="container px-6 flex flex-col md:flex-row justify-between items-center gap-14 text-center md:text-left">
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-2 mb-2 justify-center md:justify-start">
                <div className="h-6 w-6 rounded bg-primary flex items-center justify-center overflow-hidden">
                  <Image
                    src="/tdk-logo.png"
                    alt="TDK"
                    width={18}
                    height={14}
                    className="dark:invert brightness-0 invert dark:brightness-100 dark:invert-0"
                  />
                </div>
                <span className="font-bold text-lg">RetentionHub</span>
              </div>
              <p className="text-[15px] font-medium text-muted-foreground">
                © {new Date().getFullYear()} <span className="text-foreground">@League of Developer</span>.
              </p>
              <p className="text-[11px] uppercase tracking-[0.3em] text-muted-foreground/30 font-bold">
                Retention Intelligence Hub — v6.0.4
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-x-14 gap-y-6 text-[14px] font-bold text-muted-foreground/80 uppercase tracking-widest">
              <Link href="#" className="hover:text-primary transition-colors">Privacy Policy</Link>
              <Link href="#" className="hover:text-primary transition-colors">Terms of Service</Link>
              <Link href="mailto:contact@league.dev" className="hover:text-primary transition-colors">Contact</Link>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
