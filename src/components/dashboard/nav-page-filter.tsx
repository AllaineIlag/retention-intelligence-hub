'use client';

import { usePathname } from 'next/navigation';
import { PageFilterBar } from './page-filter-bar';

export function NavPageFilter() {
    const pathname = usePathname();

    // Show on main dashboard and deep-dive pages
    const isDashboard = pathname === '/dashboard';
    const isDeepDive = pathname.startsWith('/dashboard/deep-dive');

    if (!isDashboard && !isDeepDive) {
        return null;
    }

    return (
        <div className="ml-6 hidden lg:block">
            <PageFilterBar />
        </div>
    );
}
