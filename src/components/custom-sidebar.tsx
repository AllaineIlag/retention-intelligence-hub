'use client';

import { useState, createContext, useContext, useEffect } from 'react';
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
    Menu,
    X,
    ClipboardCheck, // For Corrections

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
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
} from '@/components/ui/sheet';

import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible';

// Update navItems logic to handle dynamic badges (moved inside component for access to props, or pass badges as map)
// Re-defining navItems inside component or accepting a prop to render badges.
// Strategy: pass 'pendingCount' to SidebarInner and modify the loop.

type UserRole = 'lead' | 'interviewer' | 'employee';

interface NavItem {
    title: string;
    url: string;
    icon: React.ElementType;
    roles: UserRole[];
    subItems?: { title: string; url: string; badge?: number }[];
    badge?: number; // Add badge support
}

const navItems: NavItem[] = [
    { title: 'Overview', url: '/dashboard', icon: Home, roles: ['lead', 'interviewer'] },
    {
        title: 'Interviews',
        url: '/dashboard/interview',
        icon: Users,
        roles: ['lead', 'interviewer'],
        subItems: [
            { title: 'Schedule', url: '/dashboard/interview/schedule' },
        ],
    },
    {
        title: 'Team',
        url: '/dashboard/team',
        icon: Users,
        roles: ['lead'],
        subItems: [
            { title: 'Recruitment', url: '/dashboard/team/recruitment' },
            { title: 'Manage Team', url: '/dashboard/team/manage' },
        ],
    },
    {
        title: 'Deep Dive',
        url: '/dashboard/analytics',
        icon: Activity,
        roles: ['lead'],
        subItems: [
            { title: 'Trends', url: '/dashboard/analytics/trends' },
            { title: 'Exit Drivers', url: '/dashboard/analytics/exit-drivers' },
            { title: '(Legacy) Deep Dive', url: '/dashboard/analytics/deep-dive' },
            { title: 'Attrition Drivers', url: '/dashboard/deep-dive/reason' },
            { title: 'Career Architecture', url: '/dashboard/deep-dive/career-growth' },
            { title: 'Compensation', url: '/dashboard/deep-dive/pay-rate' },
            { title: 'Benefits & Perks', url: '/dashboard/deep-dive/benefits' },
            { title: 'Workload Balance', url: '/dashboard/deep-dive/workload' },
            { title: 'Promoter Score', url: '/dashboard/deep-dive/recommend' },
        ],
    },
    // { title: 'Corrections', url: '/dashboard/corrections', icon: ClipboardCheck, roles: ['lead'] }, // Moved to sub-menu
    { title: 'Settings', url: '/dashboard/settings', icon: Settings, roles: ['lead', 'interviewer'] },
    { title: 'System Audit', url: '/dashboard/audit', icon: ShieldCheck, roles: ['lead'] },

];

const MOBILE_BREAKPOINT = 768;

function useIsMobile() {
    const [isMobile, setIsMobile] = useState<boolean>(false);

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    return isMobile;
}

// Sidebar Context
interface SidebarContextType {
    isCollapsed: boolean;
    isMobileOpen: boolean;
    isMobile: boolean;
    toggleSidebar: () => void;
    toggleMobile: () => void;
    closeMobile: () => void;
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
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const isMobile = useIsMobile();

    const toggleSidebar = () => setIsCollapsed(!isCollapsed);
    const toggleMobile = () => setIsMobileOpen(!isMobileOpen);
    const closeMobile = () => setIsMobileOpen(false);

    return (
        <SidebarContext.Provider value={{ isCollapsed, isMobileOpen, isMobile, toggleSidebar, toggleMobile, closeMobile }}>
            <TooltipProvider delayDuration={0}>{children}</TooltipProvider>
        </SidebarContext.Provider>
    );
}

// Sidebar Content (shared between desktop and mobile)
interface SidebarContentProps {
    role: UserRole;
    email: string;
    isCollapsed: boolean;
    onNavClick?: () => void;
    pendingCount: number;
}

function SidebarInner({ role, email, isCollapsed, onNavClick, pendingCount }: SidebarContentProps) {
    const pathname = usePathname();
    const filteredItems = navItems.filter((item) => item.roles.includes(role));
    const getInitials = (email: string) => email.substring(0, 2).toUpperCase();

    // Map over items to inject badge
    const itemsWithBadges = filteredItems.map(item => {
        // If it's the Team dropdown, inject badge into sub-item
        if (item.title === 'Team' && item.subItems) {
            return {
                ...item,
                subItems: item.subItems.map(sub => {
                    if (sub.title === 'Recruitment' && pendingCount > 0) {
                        return { ...sub, badge: pendingCount };
                    }
                    return sub;
                }),
                // Optionally keep badge on parent if you want both, or remove from parent
                // User: "Move badge to Access Requests" -> Now "Recruitment"
                badge: pendingCount > 0 ? pendingCount : undefined, // Keep generic badge on parent for collapsed state visibility? Or specific?
                // Step 842 said "misplaced" on parent. If I keep it on parent, they might still say it's misplaced.
                // But step 813 said "inside a dropdown Team".
                // Let's TRY putting it on user request specific item. But if parent is collapsed, we lose it.
                // Compromise: Parent gets a simple dot or same count?
                // The prompt says "I think it should be beside Access Requests?".
                // I will add it to the subItem.
                // I will ALSO keep it on the parent for now but maybe styled differently? 
                // Wait, if I keep it on parent, I revert the "misplaced" fix potentially.
                // Let's put it on subItem. 
                // To solve collapsed visibility: The parent should probably have it too.
                // Let's assume for now we just move it to subItem as requested.
                // But wait, the `itemsWithBadges` logic below still had:
                /*
                 if (item.title === 'Team' && pendingCount > 0) {
                    return { ...item, badge: pendingCount };
                }
                */
                // I need to change that to NOT put it on parent if we only want it on child?
                // Actually, user likely wants to see it on the child when expanded.
                // If I remove from parent, they won't see it when collapsed.
                // I will keep it on parent (for collapsed/summary view) AND put it on child?
                // The user said "misplaced" previously. Maybe they meant "it shouldn't be on the parent label if the parent label is just a category".
                // But Categories usually sum up notifications.
                // Let's look at the request: "I think it should be beside Access Requests?"
                // This implies they want it visibly *next to* that specific text.
                // I will implement it on the child.
            };
        }
        return item;
    });

    // Fix hydration mismatch by only rendering Radix components on client
    const [isMounted, setIsMounted] = useState(false);
    useEffect(() => {
        setIsMounted(true);
    }, []);

    // Helper to check if any child is active
    const isChildActive = (item: NavItem) => {
        return item.subItems?.some(sub => pathname.startsWith(sub.url)) || false;
    };

    // Initialize/Update controlled open state for groups
    const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});

    // Sync initial state and navigations
    useEffect(() => {
        const activeItem = navItems.find((item) => isChildActive(item));
        if (activeItem) {
            setOpenGroups((prev) => ({ ...prev, [activeItem.title]: true }));
        }
    }, [pathname]);


    if (!isMounted) {
        return null; // or a loading skeleton if preferred
    }

    return (
        <>
            {/* Header */}
            <div className="flex h-16 items-center gap-3 border-b border-white/5 px-4">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-600 to-indigo-500 shadow-lg shadow-indigo-500/40 border border-white/10">
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
                    {itemsWithBadges.map((item) => {
                        const Icon = item.icon;
                        const hasSubItems = item.subItems && item.subItems.length > 0;
                        const active = pathname === item.url || isChildActive(item);
                        const isActiveParent = hasSubItems && isChildActive(item);

                        // Parent Link Content - Decoupled Navigation Logic
                        const content = (
                            <>
                                <Icon
                                    className={`h-5 w-5 shrink-0 transition-colors ${active ? 'text-indigo-400' : 'text-muted-foreground group-hover:text-white'
                                        }`}
                                />
                                <AnimatePresence>
                                    {!isCollapsed && (
                                        <motion.span
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: -10 }}
                                            transition={{ duration: 0.15 }}
                                            className="text-sm font-medium flex-1 truncate pr-2"
                                        >
                                            {item.title}
                                        </motion.span>
                                    )}
                                </AnimatePresence>
                                {/* Only show badge on parent if it has one AND not collapsed (or if generic logic requires it) */}
                                {/* Update: If collapsed, we might want to show it on parent still? */}
                                {/* Flow: If we put badge on child, parent might need one to indicate "hey look inside". */}
                                {/* But user explicitly asked for "beside Access Requests". */}
                                {/* Let's keep parent badge logic but maybe clarify. */}
                                {/* Actually, if I modify itemsWithBadges to inject to subItems, item.badge might be undefined if I don't set it. */}
                                {/* My new logic sets BOTH.  */}
                                {!isCollapsed && item.badge && item.badge > 0 && (
                                    <span className="inline-flex items-center justify-center rounded-full bg-amber-500/20 text-amber-500 text-[10px] font-bold h-5 min-w-[20px] px-1 border border-amber-500/10 mr-2">
                                        {item.badge}
                                    </span>
                                )}
                                {active && !hasSubItems && (
                                    <motion.div
                                        layoutId="activeIndicator"
                                        className="absolute left-0 h-6 w-[3px] rounded-r-full bg-indigo-500 shadow-[0_0_12px_rgba(99,102,241,0.8)]"
                                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                                    />
                                )}
                                {hasSubItems && !isCollapsed && (
                                    <ChevronRight className="h-4 w-4 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                                )}
                            </>
                        );

                        const commonClasses = `group flex items-center gap-3 rounded-lg px-3 py-2.5 transition-all duration-200 cursor-pointer ${active
                            ? 'bg-indigo-600/10 text-indigo-400'
                            : 'text-muted-foreground hover:bg-white/5 hover:text-white'
                            }`;

                        const linkContent = hasSubItems ? (
                            <div className={commonClasses}>
                                {content}
                            </div>
                        ) : (
                            <Link
                                href={item.url}
                                onClick={() => {
                                    if (onNavClick) onNavClick();
                                }}
                                className={commonClasses}
                            >
                                {content}
                            </Link>
                        );

                        // Render Nested Menu
                        if (hasSubItems) {
                            return (
                                <li key={item.title} className="relative">
                                    <Collapsible
                                        open={!!openGroups[item.title]}
                                        onOpenChange={(isOpen) =>
                                            setOpenGroups((prev) => ({ ...prev, [item.title]: isOpen }))
                                        }
                                        className="group/collapsible"
                                    >
                                        <CollapsibleTrigger asChild>
                                            {linkContent}
                                        </CollapsibleTrigger>
                                        <CollapsibleContent>
                                            {!isCollapsed && (
                                                <ul className="mt-1 space-y-1 px-2 border-l border-white/10 ml-4">
                                                    {item.subItems?.map((sub) => {
                                                        const isSubActive = pathname === sub.url;
                                                        return (
                                                            <li key={sub.title}>
                                                                <Link
                                                                    href={sub.url}
                                                                    onClick={onNavClick}
                                                                    className={`flex items-center justify-between rounded-md px-3 py-2 text-sm transition-colors ${isSubActive
                                                                        ? 'text-indigo-400 font-medium bg-indigo-500/10'
                                                                        : 'text-muted-foreground hover:text-white hover:bg-white/5'
                                                                        }`}
                                                                >
                                                                    <span>{sub.title}</span>
                                                                    {sub.badge && sub.badge > 0 && (
                                                                        <span className="inline-flex items-center justify-center rounded-full bg-amber-500/20 text-amber-500 text-[10px] font-bold h-5 min-w-[20px] px-1 border border-amber-500/10">
                                                                            {sub.badge}
                                                                        </span>
                                                                    )}
                                                                </Link>
                                                            </li>
                                                        );
                                                    })}
                                                </ul>
                                            )}
                                        </CollapsibleContent>
                                    </Collapsible>
                                </li>
                            );
                        }

                        // Standard Menu Item
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
                        <button
                            className="flex w-full items-center gap-3 rounded-lg p-2 transition-colors hover:bg-white/5 overflow-hidden"
                            suppressHydrationWarning
                        >
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
        </>
    );
}

// Main Sidebar Component
interface CustomSidebarProps {
    role: UserRole;
    email: string;
    pendingCount?: number;
}

export function CustomSidebar({ role, email, pendingCount = 0 }: CustomSidebarProps) {
    const { isCollapsed, isMobileOpen, isMobile, toggleSidebar, closeMobile } = useSidebarContext();

    const sidebarVariants = {
        expanded: { width: 280 },
        collapsed: { width: 72 },
    };

    // Mobile: Sheet overlay
    if (isMobile) {
        return (
            <Sheet open={isMobileOpen} onOpenChange={closeMobile}>
                <SheetContent
                    side="left"
                    className="w-[280px] p-0 bg-[#0a0a0a] border-r border-white/5 [&>button]:hidden shadow-2xl shadow-indigo-500/5"
                >
                    <SheetHeader className="sr-only">
                        <SheetTitle>Navigation Menu</SheetTitle>
                        <SheetDescription>Main navigation sidebar</SheetDescription>
                    </SheetHeader>
                    <div className="flex h-full flex-col">
                        <SidebarInner
                            role={role}
                            email={email}
                            isCollapsed={false}
                            onNavClick={closeMobile}
                            pendingCount={pendingCount}
                        />
                    </div>
                </SheetContent>
            </Sheet>
        );
    }

    // Desktop: Animated collapsible sidebar
    return (
        <motion.aside
            initial={false}
            animate={isCollapsed ? 'collapsed' : 'expanded'}
            variants={sidebarVariants}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="relative hidden md:flex h-screen flex-col border-r border-white/10 bg-[#0d0d0d]"
        >
            {/* Toggle Button */}
            <button
                onClick={toggleSidebar}
                className="absolute -right-3 top-20 z-50 flex h-6 w-6 items-center justify-center rounded-full border border-white/10 bg-[#0d0d0d] text-muted-foreground shadow-md transition-colors hover:bg-white/5 hover:text-white"
            >
                {isCollapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
            </button>

            <SidebarInner role={role} email={email} isCollapsed={isCollapsed} pendingCount={pendingCount} />
        </motion.aside>
    );
}

// Mobile Trigger Button (hamburger menu)
export function CustomSidebarTrigger() {
    const { isMobileOpen, isMobile, toggleMobile } = useSidebarContext();

    // Only show on mobile
    if (!isMobile) return null;

    return (
        <button
            onClick={toggleMobile}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-muted-foreground transition-colors hover:bg-white/10 hover:text-white"
            aria-label={isMobileOpen ? 'Close menu' : 'Open menu'}
        >
            {isMobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </button>
    );
}
