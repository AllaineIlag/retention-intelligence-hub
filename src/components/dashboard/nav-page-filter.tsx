'use client';

import { usePathname } from 'next/navigation';
import { PageFilterBar } from './page-filter-bar';

export function NavPageFilter() {
    const pathname = usePathname();

    // Only show on the main dashboard overview page
    if (pathname !== '/dashboard') {
        return null;
    }

    return (
        <div className="ml-6 hidden lg:block">
            <PageFilterBar />
        </div>
    );
}
