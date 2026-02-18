'use client';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { formatDistanceToNow } from 'date-fns';
import { ArrowRight, Loader, CalendarClock, CheckCircle2, XCircle, Clock, Download } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { toast } from 'sonner';

interface RecentResignationsTableProps {
    resignations: any[]; // Ideally typed with Database type, but simplified for now
}

export function RecentResignationsTable({ resignations }: RecentResignationsTableProps) {
    if (!resignations || resignations.length === 0) {
        return (
            <Card className="col-span-full border-white/5 bg-white/[0.02] h-full flex flex-col">
                <CardHeader>
                    <CardTitle className="text-base font-medium tracking-tight">Recent Resignations</CardTitle>
                </CardHeader>
                <CardContent className="flex-1 flex items-center justify-center text-muted-foreground text-sm">
                    No recent activity found.
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="col-span-full border-white/5 bg-white/[0.02] h-full">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle className="text-base font-medium tracking-tight">Recent Resignations</CardTitle>
                </div>
            </CardHeader>
            <CardContent className="p-0">
                <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                    <Table>
                        <TableHeader className="sticky top-0 bg-[#09090b] z-10">
                            <TableRow className="hover:bg-transparent border-white/5">
                                <TableHead className="w-[250px] pl-6">Employee</TableHead>
                                <TableHead>Department</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right pr-6">Last Day</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {resignations.map((item) => (
                                <TableRow key={item.id} className="hover:bg-white/5 border-white/5">
                                    <TableCell className="flex items-center gap-3 pl-6">
                                        <div className="flex flex-col">
                                            <span className="font-medium text-sm text-zinc-200">
                                                {item.employee_details?.full_name || 'Unknown'}
                                            </span>
                                            <span className="text-[10px] text-muted-foreground">
                                                {item.employee_details?.profiles?.role || 'N/A'}
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-muted-foreground text-sm">
                                        {item.employee_details?.department || 'Unassigned'}
                                    </TableCell>
                                    <TableCell>
                                        <StatusBadge status={item.status} />
                                    </TableCell>
                                    <TableCell className="text-muted-foreground text-sm text-right pr-6">
                                        {item.last_working_day
                                            ? new Date(item.last_working_day).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                                            : 'Not set'}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    );
}

function StatusBadge({ status }: { status: string }) {
    const config: Record<string, { icon: any, color: string, border: string, bg: string, spin?: boolean, label?: string }> = {
        pending: {
            icon: Loader,
            color: 'text-amber-400',
            border: 'border-white/10',
            bg: 'bg-white/5',
            label: 'Pending'
        },
        scheduled: {
            icon: CalendarClock,
            color: 'text-indigo-400',
            border: 'border-white/10',
            bg: 'bg-white/5'
        },
        completed: {
            icon: CheckCircle2,
            color: 'text-emerald-400',
            border: 'border-white/10',
            bg: 'bg-white/5'
        },
        verified: {
            icon: CheckCircle2,
            color: 'text-emerald-400',
            border: 'border-white/10',
            bg: 'bg-white/5'
        },
        declined: {
            icon: XCircle,
            color: 'text-rose-400',
            border: 'border-white/10',
            bg: 'bg-white/5'
        },
        default: {
            icon: Clock,
            color: 'text-slate-400',
            border: 'border-white/10',
            bg: 'bg-white/5'
        }
    };

    const style = config[status.toLowerCase()] || config.default;
    const Icon = style.icon;

    return (
        <div className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${style.border} ${style.bg} text-muted-foreground`}>
            <Icon className={`h-3.5 w-3.5 ${style.color} ${style.spin ? 'animate-spin' : ''}`} />
            <span className="capitalize">{style.label || status}</span>
        </div>
    );
}
