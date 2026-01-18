import Link from "next/link";
import { ArrowRight, BarChart3, Shield, Zap } from "lucide-react";

export default function Home() {
  return (
    <div className="bg-background text-foreground flex min-h-screen flex-col">
      {/* Navbar */}
      <header className="bg-background/80 sticky top-0 z-50 w-full border-b backdrop-blur-sm">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-8">
          <div className="flex items-center gap-2 text-xl font-bold tracking-tight">
            <div className="bg-primary text-primary-foreground flex h-8 w-8 items-center justify-center rounded-lg">
              LoD
            </div>
            <span>Retention Intelligence Hub</span>
          </div>
          <nav className="flex items-center gap-4">
            <Link
              href="/login"
              className="hover:text-primary text-sm font-medium transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/login"
              className="bg-primary text-primary-foreground hover:bg-primary/90 hidden items-center justify-center rounded-md px-4 py-2 text-sm font-medium shadow transition-colors sm:flex"
            >
              Get Started
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="from-background to-muted/20 relative overflow-hidden bg-gradient-to-b py-20 sm:py-32 lg:pb-32 xl:pb-36">
          <div className="container mx-auto px-4 text-center sm:px-8">
            <div className="mx-auto max-w-3xl space-y-8">
              <div className="bg-background/50 text-muted-foreground animate-in fade-in slide-in-from-bottom-4 inline-flex items-center rounded-full border px-3 py-1 text-sm font-medium backdrop-blur-sm duration-500">
                <span className="mr-2 flex h-2 w-2 rounded-full bg-green-500"></span>
                v6.0 Now Live
              </div>
              <h1 className="from-foreground to-foreground/70 animate-in fade-in slide-in-from-bottom-8 bg-gradient-to-r bg-clip-text text-4xl font-bold tracking-tight text-transparent duration-700 sm:text-6xl">
                Stop Employee Churn <br className="hidden sm:block" />
                Before It Starts
              </h1>
              <p className="text-muted-foreground animate-in fade-in slide-in-from-bottom-12 mx-auto max-w-2xl text-lg duration-1000 sm:text-xl">
                The AI-powered intelligence platform that helps modern
                enterprises retain top talent through predictive analytics and
                actionable insights.
              </p>
              <div className="animate-in fade-in slide-in-from-bottom-16 flex flex-col items-center justify-center gap-4 duration-1000 sm:flex-row">
                <Link
                  href="/login"
                  className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex h-12 w-full items-center justify-center rounded-md px-8 text-sm font-medium shadow transition-colors sm:w-auto"
                >
                  Enter Dashboard
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
                <Link
                  href="#features"
                  className="border-input bg-background hover:bg-accent hover:text-accent-foreground inline-flex h-12 w-full items-center justify-center rounded-md border px-8 text-sm font-medium shadow-sm transition-colors sm:w-auto"
                >
                  Learn More
                </Link>
              </div>
            </div>
          </div>

          {/* Abstract Background Elements */}
          <div className="bg-primary/5 absolute top-1/2 left-1/2 -z-10 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[120px]" />
        </section>

        {/* Value Proposition Grid */}
        <section id="features" className="bg-muted/30 border-y py-16 sm:py-24">
          <div className="container mx-auto px-4 sm:px-8">
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              <div className="group bg-background hover:border-primary/20 rounded-2xl border p-8 shadow-sm transition-all hover:shadow-md">
                <div className="bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg transition-colors">
                  <BarChart3 className="h-6 w-6" />
                </div>
                <h3 className="mb-2 text-xl font-semibold">
                  Predictive Analytics
                </h3>
                <p className="text-muted-foreground">
                  Identify flight risks before they hand in their resignation.
                  Our AI analyzes patterns to alert you early.
                </p>
              </div>
              <div className="group bg-background hover:border-primary/20 rounded-2xl border p-8 shadow-sm transition-all hover:shadow-md">
                <div className="bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg transition-colors">
                  <Shield className="h-6 w-6" />
                </div>
                <h3 className="mb-2 text-xl font-semibold">Secure & Private</h3>
                <p className="text-muted-foreground">
                  Enterprise-grade security ensures your sensitive employee data
                  stays protected and compliant.
                </p>
              </div>
              <div className="group bg-background hover:border-primary/20 rounded-2xl border p-8 shadow-sm transition-all hover:shadow-md">
                <div className="bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg transition-colors">
                  <Zap className="h-6 w-6" />
                </div>
                <h3 className="mb-2 text-xl font-semibold">Real-time Action</h3>
                <p className="text-muted-foreground">
                  Turn insights into immediate action. Schedule stay interviews
                  and manage retention plans instantly.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Trust Section / Footer Pre-roll */}
        <section className="py-20 sm:py-32">
          <div className="container mx-auto px-4 text-center sm:px-8">
            <h2 className="mb-4 text-3xl font-bold tracking-tight">
              Ready to optimize your workforce?
            </h2>
            <p className="text-muted-foreground mx-auto mb-8 max-w-xl">
              Join forward-thinking companies using Retention Intelligence Hub
              to build stronger teams.
            </p>
            <Link
              href="/login"
              className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex h-12 items-center justify-center rounded-md px-8 text-sm font-medium shadow transition-colors"
            >
              Get Started Now
            </Link>
          </div>
        </section>
      </main>

      <footer className="bg-muted/20 border-t py-8">
        <div className="container mx-auto flex flex-col items-center justify-between gap-4 px-4 sm:px-8 md:flex-row">
          <p className="text-muted-foreground text-sm">
            &copy; 2026 League of Developer. All rights reserved.
          </p>
          <div className="text-muted-foreground flex items-center gap-6 text-sm">
            <Link href="#" className="hover:text-foreground">
              Privacy Policy
            </Link>
            <Link href="#" className="hover:text-foreground">
              Terms of Service
            </Link>
            <Link href="#" className="hover:text-foreground">
              Contact
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
