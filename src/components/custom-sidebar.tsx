'use client';

import { useState, createContext, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    BarChart3,
    Home,
    Users,
    Activity,
    ShieldCheck,
    Settings,
    LogOut,
    ChevronLeft,
    ChevronRight,
} from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';

type UserRole = 'lead' | 'interviewer' | 'employee';

interface NavItem {
    title: string;
    url: string;
    icon: React.ElementType;
    roles: UserRole[];
}

const navItems: NavItem[] = [
    { title: 'Home', url: '/dashboard', icon: Home, roles: ['lead', 'interviewer'] },
    { title: 'Team', url: '/dashboard/team', icon: Users, roles: ['lead'] },
    { title: 'Analytics', url: '/dashboard/analytics', icon: Activity, roles: ['lead'] },
    { title: 'Audit Logs', url: '/dashboard/audit', icon: ShieldCheck, roles: ['lead'] },
    { title: 'Settings', url: '/dashboard/settings', icon: Settings, roles: ['lead', 'interviewer'] },
];

// Sidebar Context
interface SidebarContextType {
    isCollapsed: boolean;
    toggleSidebar: () => void;
}

const SidebarContext = createContext<SidebarContextType | null>(null);

export function useSidebarContext() {
    const context = useContext(SidebarContext);
    if (!context) {
        throw new Error('useSidebarContext must be used within CustomSidebarProvider');
    }
    return context;
}

// Provider Component
export function CustomSidebarProvider({ children }: { children: React.ReactNode }) {
    const [isCollapsed, setIsCollapsed] = useState(false);

    const toggleSidebar = () => setIsCollapsed(!isCollapsed);

    return (
        <SidebarContext.Provider value={{ isCollapsed, toggleSidebar }}>
            <TooltipProvider delayDuration={0}>{children}</TooltipProvider>
        </SidebarContext.Provider>
    );
}

// Main Sidebar Component
interface CustomSidebarProps {
    role: UserRole;
    email: string;
}

export function CustomSidebar({ role, email }: CustomSidebarProps) {
    const pathname = usePathname();
    const { isCollapsed, toggleSidebar } = useSidebarContext();
    const filteredItems = navItems.filter((item) => item.roles.includes(role));

    const getInitials = (email: string) => email.substring(0, 2).toUpperCase();

    const sidebarVariants = {
        expanded: { width: 280 },
        collapsed: { width: 72 },
    };

    return (
        <motion.aside
            initial={false}
            animate={isCollapsed ? 'collapsed' : 'expanded'}
            variants={sidebarVariants}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="relative flex h-screen flex-col border-r border-white/10 bg-[#0d0d0d]"
        >
            {/* Toggle Button */}
            <button
                onClick={toggleSidebar}
                className="absolute -right-3 top-20 z-50 flex h-6 w-6 items-center justify-center rounded-full border border-white/10 bg-[#0d0d0d] text-muted-foreground shadow-md transition-colors hover:bg-white/5 hover:text-white"
            >
                {isCollapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
            </button>

            {/* Header */}
            <div className="flex h-16 items-center gap-3 border-b border-white/5 px-4">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-600 to-indigo-500 shadow-lg shadow-indigo-500/20">
                    <BarChart3 className="h-5 w-5 text-white" />
                </div>
                <AnimatePresence>
                    {!isCollapsed && (
                        <motion.span
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                            transition={{ duration: 0.2 }}
                            className="text-lg font-bold"
                        >
                            Retention<span className="text-indigo-500">Hub</span>
                        </motion.span>
                    )}
                </AnimatePresence>
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto px-3 py-4">
                <AnimatePresence>
                    {!isCollapsed && (
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="mb-2 px-3 text-xs font-medium uppercase tracking-wider text-muted-foreground"
                        >
                            Navigation
                        </motion.p>
                    )}
                </AnimatePresence>
                <ul className="space-y-1">
                    {filteredItems.map((item) => {
                        const isActive = pathname === item.url;
                        const Icon = item.icon;

                        const linkContent = (
                            <Link
                                href={item.url}
                                className={`group flex items-center gap-3 rounded-lg px-3 py-2.5 transition-all duration-200 ${isActive
                                    ? 'bg-indigo-600/10 text-indigo-400'
                                    : 'text-muted-foreground hover:bg-white/5 hover:text-white'
                                    }`}
                            >
                                <Icon
                                    className={`h-5 w-5 shrink-0 transition-colors ${isActive ? 'text-indigo-400' : 'text-muted-foreground group-hover:text-white'
                                        }`}
                                />
                                <AnimatePresence>
                                    {!isCollapsed && (
                                        <motion.span
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: -10 }}
                                            transition={{ duration: 0.15 }}
                                            className="text-sm font-medium"
                                        >
                                            {item.title}
                                        </motion.span>
                                    )}
                                </AnimatePresence>
                                {isActive && (
                                    <motion.div
                                        layoutId="activeIndicator"
                                        className="absolute left-0 h-8 w-1 rounded-r-full bg-indigo-500"
                                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                                    />
                                )}
                            </Link>
                        );

                        return (
                            <li key={item.title} className="relative">
                                {isCollapsed ? (
                                    <Tooltip>
                                        <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
                                        <TooltipContent side="right" sideOffset={10}>
                                            {item.title}
                                        </TooltipContent>
                                    </Tooltip>
                                ) : (
                                    linkContent
                                )}
                            </li>
                        );
                    })}
                </ul>
            </nav>

            {/* Footer */}
            <div className="border-t border-white/5 p-3">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button className="flex w-full items-center gap-3 rounded-lg p-2 transition-colors hover:bg-white/5 overflow-hidden">
                            <Avatar className="h-9 w-9 shrink-0">
                                <AvatarFallback className="bg-gradient-to-br from-indigo-600 to-purple-600 text-xs font-medium text-white">
                                    {getInitials(email)}
                                </AvatarFallback>
                            </Avatar>
                            {!isCollapsed && (
                                <div className="flex-1 min-w-0 text-left">
                                    <p className="truncate text-sm font-medium text-white">{email}</p>
                                    <p className="text-xs capitalize text-muted-foreground">{role}</p>
                                </div>
                            )}
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" side="top" className="w-56">
                        <form action="/auth/signout" method="post">
                            <DropdownMenuItem asChild>
                                <button type="submit" className="w-full cursor-pointer">
                                    <LogOut className="mr-2 h-4 w-4" />
                                    <span>Sign out</span>
                                </button>
                            </DropdownMenuItem>
                        </form>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </motion.aside>
    );
}

// Header with Trigger (optional, for mobile)
export function CustomSidebarTrigger() {
    const { toggleSidebar } = useSidebarContext();

    return (
        <button
            onClick={toggleSidebar}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-muted-foreground transition-colors hover:bg-white/10 hover:text-white md:hidden"
        >
            <ChevronRight className="h-4 w-4" />
        </button>
    );
}
