'use client';

import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarRail,
} from '@/components/ui/sidebar';
import { BarChart3, Home, Users, Activity, ShieldCheck, Settings, LogOut } from 'lucide-react';
import Link from 'next/link';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

type UserRole = 'lead' | 'interviewer' | 'employee';

interface NavItem {
    title: string;
    url: string;
    icon: React.ElementType;
    roles: UserRole[];
}

const navItems: NavItem[] = [
    {
        title: 'Overview',
        url: '/dashboard',
        icon: Home,
        roles: ['lead', 'interviewer'],
    },
    {
        title: 'Recruitment',
        url: '/dashboard/team/invite',
        icon: Users,
        roles: ['lead'],
    },
    {
        title: 'Manage Team',
        url: '/dashboard/team/manage',
        icon: ShieldCheck,
        roles: ['lead'],
    },
    {
        title: 'Analytics',
        url: '/dashboard/analytics',
        icon: Activity,
        roles: ['lead'],
    },
    {
        title: 'Audit Logs',
        url: '/dashboard/audit',
        icon: ShieldCheck,
        roles: ['lead'],
    },
    {
        title: 'Settings',
        url: '/dashboard/settings',
        icon: Settings,
        roles: ['lead', 'interviewer'],
    },
];

interface AppSidebarProps {
    role: UserRole;
    email: string;
}

export function AppSidebar({ role, email }: AppSidebarProps) {
    const filteredItems = navItems.filter((item) => item.roles.includes(role));

    const getInitials = (email: string) => {
        return email.substring(0, 2).toUpperCase();
    };

    return (
        <Sidebar collapsible="icon">
            <SidebarHeader className="p-4">
                <Link href="/dashboard" className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                        <BarChart3 className="text-white h-5 w-5" />
                    </div>
                    <span className="font-bold text-lg group-data-[collapsible=icon]:hidden">
                        Retention<span className="text-indigo-500">Hub</span>
                    </span>
                </Link>
            </SidebarHeader>

            <Separator className="group-data-[collapsible=icon]:hidden" />

            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel>Navigation</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {filteredItems.map((item) => (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton asChild tooltip={item.title}>
                                        <Link href={item.url}>
                                            <item.icon className="h-4 w-4" />
                                            <span>{item.title}</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>

            <SidebarFooter className="p-4">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button className="flex w-full items-center gap-3 rounded-lg p-2 hover:bg-sidebar-accent transition-colors">
                            <Avatar className="h-8 w-8">
                                <AvatarFallback className="bg-indigo-600 text-white text-xs">
                                    {getInitials(email)}
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 text-left text-sm group-data-[collapsible=icon]:hidden">
                                <p className="font-medium truncate">{email}</p>
                                <p className="text-xs text-muted-foreground capitalize">{role}</p>
                            </div>
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-56">
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
            </SidebarFooter>
            <SidebarRail />
        </Sidebar>
    );
}
