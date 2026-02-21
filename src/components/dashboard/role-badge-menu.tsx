'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Settings, LogOut, ChevronDown } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface RoleBadgeMenuProps {
    role: string;
    email: string;
}

export function RoleBadgeMenu({ role, email }: RoleBadgeMenuProps) {
    const router = useRouter();
    const [isMounted, setIsMounted] = React.useState(false);

    React.useEffect(() => {
        setIsMounted(true);
    }, []);

    const handleSignOut = async () => {
        await fetch('/auth/signout', { method: 'POST' });
        router.push('/login');
        router.refresh();
    };

    if (!isMounted) {
        return (
            <div className="h-7 md:h-8 w-12 md:w-20 rounded-full bg-blue-500/10 border border-blue-500/20" />
        );
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                {/* Full badge on md+, compact on mobile */}
                <button className="flex items-center gap-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs font-medium uppercase tracking-wide text-blue-400 transition-colors hover:bg-blue-500/20 hover:border-blue-500/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50 cursor-pointer px-2 py-1 md:px-3">
                    <span className="hidden md:inline">{role}</span>
                    <span className="inline md:hidden font-bold">{role[0]}</span>
                    <ChevronDown className="h-3 w-3 opacity-60" />
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
                align="end"
                className="w-52 border-border bg-popover text-popover-foreground shadow-2xl shadow-black/50"
            >
                {/* User Info Header */}
                <div className="px-3 py-2.5">
                    <p className="text-xs font-medium text-foreground truncate">{email}</p>
                    <p className="text-[10px] uppercase tracking-wider text-blue-400 mt-0.5">{role}</p>
                </div>
                <DropdownMenuSeparator className="bg-border/50" />

                <DropdownMenuItem
                    onClick={() => router.push('/dashboard/settings')}
                    className="gap-2 text-muted-foreground hover:text-foreground focus:text-foreground focus:bg-accent cursor-pointer"
                >
                    <Settings className="h-4 w-4" />
                    Settings
                </DropdownMenuItem>

                <DropdownMenuSeparator className="bg-border/50" />

                <DropdownMenuItem
                    onClick={handleSignOut}
                    className="gap-2 text-red-500 hover:text-red-400 focus:text-red-400 focus:bg-red-500/10 cursor-pointer"
                >
                    <LogOut className="h-4 w-4" />
                    Sign Out
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
