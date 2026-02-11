'use client';

import React from 'react';
import { usePageFilter, FilterMode } from './page-filter-context';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';

const FILTER_OPTIONS: { label: string; mode: FilterMode }[] = [
    { label: '7d', mode: '7d' },
    { label: '30d', mode: '30d' },
    { label: '3m', mode: '3m' },
    { label: '6m', mode: '6m' },
    { label: '12m', mode: '12m' },
    { label: 'YTD', mode: 'ytd' },
];

export function PageFilterBar() {
    const { pageFilter, setPageFilter, resetPageFilter } = usePageFilter();

    return (
        <div className="flex items-center justify-between gap-4 p-2 mb-6 rounded-2xl border border-white/5 bg-white/[0.02] backdrop-blur-xl animate-in fade-in slide-in-from-top-4 duration-500">
            <div className="flex items-center gap-2 pl-2">
                <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Page Filter</span>
                <div className="flex items-center gap-1 ml-2">
                    {FILTER_OPTIONS.map((opt) => (
                        <Button
                            key={opt.mode}
                            variant="ghost"
                            size="sm"
                            onClick={() => setPageFilter(opt.mode)}
                            className={cn(
                                "h-8 px-3 text-xs rounded-xl transition-all duration-200",
                                pageFilter === opt.mode
                                    ? "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shadow-[0_0_15px_rgba(99,102,241,0.1)]"
                                    : "text-zinc-400 hover:text-zinc-200 hover:bg-white/5 border border-transparent"
                            )}
                        >
                            {opt.label}
                        </Button>
                    ))}
                </div>
            </div>

            {pageFilter && (
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={resetPageFilter}
                    className="h-8 px-3 text-xs text-zinc-500 hover:text-white hover:bg-white/5 rounded-xl transition-all duration-200 group"
                >
                    <X className="w-3.5 h-3.5 mr-1.5 transition-transform duration-200 group-hover:rotate-90" />
                    Reset
                </Button>
            )}
        </div>
    );
}
