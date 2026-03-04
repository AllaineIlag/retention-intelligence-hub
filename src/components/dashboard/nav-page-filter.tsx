'use client';

import { usePathname } from 'next/navigation';
import { PageFilterBar } from './page-filter-bar';

export function NavPageFilter() {
    const pathname = usePathname();

    // Show on main dashboard and analytics pages
    const isDashboard = pathname === '/dashboard';
    const isAnalytics = pathname.startsWith('/dashboard/analytics');

    if (!isDashboard && !isAnalytics) {
        return null;
    }

    return (
        <div className="ml-6 hidden lg:block">
            <PageFilterBar />
        </div>
    );
}
