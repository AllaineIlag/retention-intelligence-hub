import Link from 'next/link';
import { ArrowRight, ShieldCheck, Zap, BarChart3 } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      {/* Navbar */}
      <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-background/80 backdrop-blur-xl">
        <div className="container flex h-16 items-center justify-between px-6">
          <div className="flex items-center gap-2 font-bold text-xl tracking-tighter">
            <div className="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center">
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
              className="inline-flex h-9 items-center justify-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow transition-colors hover:bg-indigo-700 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-indigo-700"
            >
              Sign In
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="relative overflow-hidden py-24 lg:py-32 xl:py-40">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(45%_40%_at_50%_60%,rgba(79,70,229,0.1),transparent)] sm:bg-[radial-gradient(40%_40%_at_50%_50%,rgba(79,70,229,0.1),transparent)]" />
          <div className="container px-6 flex flex-col items-center text-center">
            <div className="inline-flex items-center rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 text-sm font-medium text-indigo-400 mb-8 backdrop-blur-md">
              <span className="flex h-2 w-2 rounded-full bg-indigo-500 mr-2"></span>
              Retention Intelligence v6.0 Online
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl max-w-4xl bg-gradient-to-br from-white via-white/90 to-white/50 bg-clip-text text-transparent">
              Predict. Prevent. <br />
              <span className="text-indigo-500">Retain.</span>
            </h1>
            <p className="mt-6 max-w-[42rem] leading-normal text-muted-foreground sm:text-xl sm:leading-8">
              The advanced analytics platform for modern HR teams. Identify flight risks before they
              depart and secure your most valuable asset: your people.
            </p>
            <div className="mt-10 flex gap-4">
              <Link
                href="/login"
                className="inline-flex h-12 items-center justify-center rounded-lg bg-indigo-600 px-8 text-sm font-medium text-white shadow-lg shadow-indigo-500/25 transition-all hover:bg-indigo-700 hover:scale-105"
              >
                Access Dashboard
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
              <button
                disabled
                className="inline-flex h-12 items-center justify-center rounded-lg border border-white/10 bg-white/5 px-8 text-sm font-medium text-white transition-colors hover:bg-white/10"
              >
                Read the Documentation
              </button>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section id="features" className="container px-6 py-24 sm:py-32 border-t border-white/5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
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
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 py-12 bg-black/20">
        <div className="container px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-sm text-muted-foreground">
            © 2026 Retention Intelligence Hub. All rights reserved.
          </p>
          <div className="flex gap-4 text-sm text-muted-foreground">
            <Link href="#" className="hover:text-white">
              Privacy
            </Link>
            <Link href="#" className="hover:text-white">
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
    <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-8 transition-all hover:bg-white/10 hover:border-white/20">
      <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-white/5 group-hover:bg-white/10 transition-colors">
        {icon}
      </div>
      <h3 className="mb-2 text-xl font-bold text-white">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  );
}
