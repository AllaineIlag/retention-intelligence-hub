'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { usePathname } from 'next/navigation';

export type FilterMode = '7d' | '30d' | '3m' | '6m' | '12m' | 'ytd';

interface PageFilterContextType {
    pageFilter: FilterMode | null;
    version: number;
    setPageFilter: (mode: FilterMode) => void;
    resetPageFilter: () => void;
}

const PageFilterContext = createContext<PageFilterContextType | undefined>(undefined);

export function PageFilterProvider({ children }: { children: React.ReactNode }) {
    const [pageFilter, setPageFilterState] = useState<FilterMode | null>(null);
    const [version, setVersion] = useState(0);
    const pathname = usePathname();

    const setPageFilter = useCallback((mode: FilterMode) => {
        setPageFilterState(mode);
        setVersion((v) => v + 1);
    }, []);

    const resetPageFilter = useCallback(() => {
        setPageFilterState(null);
        setVersion((v) => v + 1);
    }, []);

    // Reset filter on route change
    useEffect(() => {
        resetPageFilter();
    }, [pathname, resetPageFilter]);

    return (
        <PageFilterContext.Provider value={{ pageFilter, version, setPageFilter, resetPageFilter }}>
            {children}
        </PageFilterContext.Provider>
    );
}

export function usePageFilter() {
    const context = useContext(PageFilterContext);
    if (context === undefined) {
        throw new Error('usePageFilter must be used within a PageFilterProvider');
    }
    return context;
}
