'use client';

import React, { useEffect, useState } from 'react';
import { usePageFilter, FilterMode } from './page-filter-context';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { X, Building2 } from 'lucide-react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { getDepartments } from "@/app/actions/dashboard";

const FILTER_OPTIONS: { label: string; mode: FilterMode }[] = [
    { label: '7d', mode: '7d' },
    { label: '30d', mode: '30d' },
    { label: '3m', mode: '3m' },
    { label: '6m', mode: '6m' },
    { label: '12m', mode: '12m' },
    { label: 'YTD', mode: 'ytd' },
];

export function PageFilterBar() {
    const { pageFilter, department, setPageFilter, setDepartmentFilter, resetPageFilter } = usePageFilter();
    const [departments, setDepartments] = useState<string[]>([]);

    useEffect(() => {
        getDepartments().then(res => {
            if (res.success && res.data) {
                setDepartments(res.data);
            }
        });
    }, []);

    return (
        <div className="flex items-center gap-2 animate-in fade-in slide-in-from-top-1 duration-300">
            <div className="flex items-center gap-1 bg-muted/30 rounded-lg p-1 border border-border/50">
                {FILTER_OPTIONS.map((opt) => (
                    <Button
                        key={opt.mode}
                        variant="ghost"
                        size="sm"
                        onClick={() => setPageFilter(opt.mode)}
                        className={cn(
                            "h-7 px-2.5 text-[10px] font-medium rounded-md transition-all duration-200",
                            pageFilter === opt.mode
                                ? "bg-brand-primary/20 text-brand-primary shadow-[0_0_10px_rgba(37,99,235,0.1)]"
                                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                        )}
                    >
                        {opt.label}
                    </Button>
                ))}
            </div>

            <Select
                value={department || "all"}
                onValueChange={(v) => setDepartmentFilter(v === "all" ? null : v)}
            >
                <SelectTrigger className="w-[180px] border-border/50 bg-muted/30 hover:bg-muted/50 rounded-lg px-3 h-9 text-xs transition-colors">
                    <Building2 className="mr-2 h-3.5 w-3.5 text-brand-primary" />
                    <SelectValue placeholder="All Departments" />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border rounded-xl">
                    <SelectItem value="all" className="text-xs">All Departments</SelectItem>
                    {departments.map((d) => (
                        <SelectItem key={d} value={d} className="text-xs">
                            {d}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>

            {(pageFilter || department) && (
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={resetPageFilter}
                    className="h-9 w-9 p-0 text-muted-foreground hover:text-red-500 hover:bg-muted/50 rounded-lg transition-all duration-200"
                    title="Reset Filters"
                >
                    <X className="w-4 h-4" />
                    <span className="sr-only">Reset</span>
                </Button>
            )}
        </div>
    );
}
