"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { navItems } from "@/config/nav-items";
import { cn } from "@/lib/utils";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";

interface AppSidebarProps {
  userRole: "lead" | "interviewer";
  userEmail?: string;
}

export function AppSidebar({ userRole, userEmail }: AppSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      await supabase.auth.signOut();
      router.push("/login");
      router.refresh();
    } catch (error) {
      console.error("Error signing out:", error);
      setIsSigningOut(false);
    }
  };

  const filteredItems = navItems.filter((item) =>
    item.roles.includes(userRole),
  );

  return (
    <div className="flex h-screen w-64 flex-col border-r bg-zinc-950 text-white">
      <div className="flex h-14 items-center border-b px-6">
        <span className="text-xl font-bold tracking-wider">NOXUS</span>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto py-4">
        <nav className="space-y-1 px-3">
          {filteredItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-zinc-800 text-white"
                    : "text-zinc-400 hover:bg-zinc-800 hover:text-white",
                )}
              >
                <Icon className="h-4 w-4" />
                {item.title}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* User Footer */}
      <div className="border-t p-4">
        <div className="mb-4 px-2">
          <p className="text-xs font-semibold text-zinc-500 uppercase">
            {userRole}
          </p>
          <p className="truncate text-xs text-zinc-400" title={userEmail}>
            {userEmail}
          </p>
        </div>
        <Button
          variant="outline"
          className="w-full justify-start gap-2 border-zinc-700 bg-transparent text-zinc-400 hover:bg-zinc-800 hover:text-white"
          onClick={handleSignOut}
          disabled={isSigningOut}
        >
          {isSigningOut ? (
            <LogOut className="h-4 w-4 animate-spin" />
          ) : (
            <LogOut className="h-4 w-4" />
          )}
          {isSigningOut ? "Signing out..." : "Sign Out"}
        </Button>
      </div>
    </div>
  );
}
