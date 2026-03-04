'use client';

import { usePathname } from 'next/navigation';

export function DashboardHeader() {
    const pathname = usePathname();

    const getTitle = (path: string) => {
        if (path === '/dashboard') return 'Overview';
        if (path === '/dashboard/interview/schedule') return 'Schedule';
        if (path.startsWith('/dashboard/interview')) return 'Interviews';
        if (path.startsWith('/dashboard/team')) return 'Team';

        // Analytics Routes
        if (path.startsWith('/dashboard/analytics/reason-for-leaving')) return 'Reason for Leaving';
        if (path.startsWith('/dashboard/analytics/workload-balance')) return 'Workload Balance';
        if (path.startsWith('/dashboard/analytics/career-growth')) return 'Career Growth';
        if (path.startsWith('/dashboard/analytics/compensation')) return 'Compensation';
        if (path.startsWith('/dashboard/analytics/benefits-perks')) return 'Benefits & Perks';
        if (path.startsWith('/dashboard/analytics/promoter-score')) return 'Promoter Score';

        // Main Analytics fallback
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
