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
                    <ExportButton />
                </div>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow className="hover:bg-white/5 border-white/5">
                            <TableHead className="w-[250px]">Employee</TableHead>
                            <TableHead>Department</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Last Day</TableHead>
                            <TableHead className="text-right">Action</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {resignations.map((item) => (
                            <TableRow key={item.id} className="hover:bg-white/5 border-white/5">
                                <TableCell className="flex items-center gap-3">
                                    <div className="flex flex-col">
                                        <span className="font-medium text-sm text-zinc-200">{item.profiles?.full_name || 'Unknown'}</span>
                                        <span className="text-[10px] text-muted-foreground">{item.profiles?.role}</span>
                                    </div>
                                </TableCell>
                                <TableCell className="text-muted-foreground text-sm">
                                    {item.profiles?.department || 'Unassigned'}
                                </TableCell>
                                <TableCell>
                                    <StatusBadge status={item.status} />
                                </TableCell>
                                <TableCell className="text-muted-foreground text-sm">
                                    {item.last_working_day
                                        ? new Date(item.last_working_day).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                                        : 'Not set'}
                                </TableCell>
                                <TableCell className="text-right">
                                    <Link
                                        href={`/dashboard/resignation/${item.id}`}
                                        className="inline-flex items-center justify-center rounded-md text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-white/10 bg-white/5 shadow-sm hover:bg-white/10 hover:text-white h-7 w-7"
                                    >
                                        <ArrowRight className="h-3.5 w-3.5" />
                                        <span className="sr-only">View</span>
                                    </Link>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}



function ExportButton() {
    // We need to check permission client-side or just let the server reject it.
    // For better UX, we could pass permission as prop, but for now let's try-catch the action.
    const [loading, setLoading] = useState(false);

    const handleExport = async () => {
        setLoading(true);
        try {
            const { exportResignations } = await import('@/app/actions/user-actions');
            const result = await exportResignations();

            if (result.error) {
                toast.error(result.error);
                return;
            }

            if (!result.data || result.data.length === 0) {
                toast.info("No data to export.");
                return;
            }

            // Convert to CSV
            const headers = ['Employee', 'Department', 'Role', 'Status', 'Last Day', 'Created At'];
            const csvContent = [
                headers.join(','),
                ...result.data.map((r: any) => [
                    `"${r.profiles?.full_name || 'Unknown'}"`,
                    `"${r.profiles?.department || 'N/A'}"`,
                    `"${r.profiles?.role || 'N/A'}"`,
                    r.status,
                    r.last_working_day || '',
                    r.created_at
                ].join(','))
            ].join('\n');

            // Download
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.setAttribute('href', url);
            link.setAttribute('download', `resignations_export_${new Date().toISOString().split('T')[0]}.csv`);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            toast.success("Export successful.");
        } catch (error) {
            toast.error("Export failed.");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
            disabled={loading}
            className="h-8 border-white/10 bg-white/5 hover:bg-white/10 text-xs"
        >
            {loading ? <Loader className="mr-2 h-3.5 w-3.5 animate-spin" /> : <Download className="mr-2 h-3.5 w-3.5" />}
            Export CSV
        </Button>
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
