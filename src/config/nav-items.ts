import {
  LayoutDashboard,
  Users,
  FileText,
  Settings,
  BarChart,
  ShieldAlert,
  BookOpen,
} from "lucide-react";

export type NavItem = {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  roles: ("lead" | "interviewer")[];
};

export const navItems: NavItem[] = [
  {
    title: "Overview",
    href: "/dashboard",
    icon: LayoutDashboard,
    roles: ["lead", "interviewer"],
  },
  {
    title: "Team",
    href: "/dashboard/team",
    icon: Users,
    roles: ["lead"],
  },
  {
    title: "Employees",
    href: "/dashboard/employees",
    icon: FileText,
    roles: ["lead", "interviewer"],
  },
  {
    title: "Analytics",
    href: "/dashboard/analytics",
    icon: BarChart,
    roles: ["lead"],
  },
  {
    title: "Resources",
    href: "/dashboard/resources",
    icon: BookOpen,
    roles: ["lead", "interviewer"],
  },
  {
    title: "Audit Logs",
    href: "/dashboard/audit",
    icon: ShieldAlert,
    roles: ["lead"],
  },
  {
    title: "Settings",
    href: "/dashboard/settings",
    icon: Settings,
    roles: ["lead", "interviewer"],
  },
];
