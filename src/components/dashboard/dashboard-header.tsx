'use client';

import { usePathname } from 'next/navigation';

export function DashboardHeader() {
    const pathname = usePathname();

    const getTitle = (path: string) => {
        if (path === '/dashboard') return 'Overview';
        if (path.startsWith('/dashboard/interviews') || path.startsWith('/dashboard/interview/')) return 'Interviews';
        if (path.startsWith('/dashboard/team')) return 'Team';
        if (path.startsWith('/dashboard/analytics')) return 'Analytics';
        if (path.startsWith('/dashboard/corrections')) return 'Corrections';
        if (path.startsWith('/dashboard/settings')) return 'Settings';
        if (path.startsWith('/dashboard/audit')) return 'System Audit';

        return 'Overview'; // Default fallback
    };

    return (
        <h2 className="text-lg font-semibold animate-in fade-in duration-300">
            {getTitle(pathname)}
        </h2>
    );
}
