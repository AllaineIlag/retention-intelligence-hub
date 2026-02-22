'use client';

import { useState, useRef, useEffect } from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { format, parseISO } from 'date-fns';
import { ShieldCheck, User, Search, Download, FileSpreadsheet, FileJson, Printer, ArrowUpDown, Loader } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { AuditLog } from '@/app/actions/audit-actions';
import { toast } from 'sonner';

interface AuditLogTableProps {
    logs: AuditLog[];
}

export function AuditLogTable({ logs }: AuditLogTableProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [actionFilter, setActionFilter] = useState<string>('all');
    const [timeRangeFilter, setTimeRangeFilter] = useState<string>('all');
    const [sortConfig, setSortConfig] = useState<{ key: 'timestamp' | 'action' | 'user' | 'entity', direction: 'asc' | 'desc' } | null>(null);

    const [visibleCount, setVisibleCount] = useState(50);
    const observerTarget = useRef<HTMLTableRowElement>(null);

    // Reset pagination on search or filter change
    useEffect(() => {
        setVisibleCount(50);
    }, [searchQuery, actionFilter, timeRangeFilter]);

    // Handle Infinite Scroll Observation
    useEffect(() => {
        const observer = new IntersectionObserver(
            entries => {
                if (entries[0].isIntersecting) {
                    setVisibleCount(prev => prev + 50);
                }
            },
            { threshold: 0.1 }
        );

        if (observerTarget.current) {
            observer.observe(observerTarget.current);
        }

        return () => observer.disconnect();
    }, [observerTarget, visibleCount]);

    // Extract unique actions for filter dropdown
    const uniqueActions = ['all', ...Array.from(new Set(logs.map(log => log.action)))];
    const now = new Date();

    let processedLogs = logs.filter(log => {
        // Search filter
        const searchMatch = !searchQuery ||
            log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (log.user_email && log.user_email.toLowerCase().includes(searchQuery.toLowerCase())) ||
            log.entity_table.toLowerCase().includes(searchQuery.toLowerCase());

        // Action filter
        const actionMatch = actionFilter === 'all' || log.action === actionFilter;

        // Time filter
        const itemDate = parseISO(log.created_at);
        const diffTime = Math.abs(now.getTime() - itemDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        let timeMatch = true;
        switch (timeRangeFilter) {
            case '7d': timeMatch = diffDays <= 7; break;
            case '30d': timeMatch = diffDays <= 30; break;
            case '3m': timeMatch = diffDays <= 90; break;
            case '6m': timeMatch = diffDays <= 180; break;
            case '12m': timeMatch = diffDays <= 365; break;
            case 'ytd': timeMatch = itemDate.getFullYear() === now.getFullYear(); break;
            case 'all': timeMatch = true; break;
        }

        return searchMatch && actionMatch && timeMatch;
    });

    if (sortConfig) {
        processedLogs.sort((a, b) => {
            const dir = sortConfig.direction === 'asc' ? 1 : -1;
            if (sortConfig.key === 'timestamp') {
                const dateA = parseISO(a.created_at).getTime();
                const dateB = parseISO(b.created_at).getTime();
                return (dateA - dateB) * dir;
            }
            if (sortConfig.key === 'action') {
                return a.action.localeCompare(b.action) * dir;
            }
            if (sortConfig.key === 'user') {
                const userA = a.user_email || '';
                const userB = b.user_email || '';
                return userA.localeCompare(userB) * dir;
            }
            if (sortConfig.key === 'entity') {
                return a.entity_table.localeCompare(b.entity_table) * dir;
            }
            return 0;
        });
    }

    const visibleLogs = processedLogs.slice(0, visibleCount);

    const getActionColor = (action: string) => {
        if (action.includes('REJECTED') || action.includes('DELETE')) return 'destructive';
        if (action.includes('APPROVED') || action.includes('CREATE')) return 'default';
        if (action.includes('UPDATED')) return 'secondary';
        return 'outline';
    };

    const handleSort = (key: 'timestamp' | 'action' | 'user' | 'entity') => {
        setSortConfig(current => {
            if (current?.key === key) {
                return current.direction === 'asc' ? { key, direction: 'desc' } : null;
            }
            return { key, direction: 'asc' };
        });
    };

    const handleExportCSV = () => {
        const headers = ['Timestamp', 'Action', 'User', 'Target Table', 'Target ID', 'Details'];
        const csvRows = processedLogs.map(i => [
            format(parseISO(i.created_at), 'yyyy-MM-dd HH:mm:ss'),
            `"${i.action}"`,
            `"${i.user_email || 'System'}"`,
            `"${i.entity_table}"`,
            `"${i.entity_id}"`,
            `"${JSON.stringify(i.details).replace(/"/g, '""')}"`
        ].join(','));

        const csvString = [headers.join(','), ...csvRows].join('\n');
        const blob = new Blob([csvString], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `audit-logs-export-${format(new Date(), 'yyyy-MM-dd')}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
    };

    const handleExportJSON = () => {
        const blob = new Blob([JSON.stringify(processedLogs, null, 2)], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `audit-logs-export-${format(new Date(), 'yyyy-MM-dd')}.json`;
        a.click();
        window.URL.revokeObjectURL(url);
    };

    const handleExportPDF = () => {
        const printWindow = window.open('', '_blank');
        if (!printWindow) {
            toast.error("Pop-up blocked", { description: "Please allow pop-ups to print the PDF." });
            return;
        }

        const tableStyle = `
            body { font-family: sans-serif; padding: 20px; color: black; background: white; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 12px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; font-weight: bold; }
            h1 { font-size: 20px; margin-bottom: 5px; }
            p { font-size: 14px; color: #555; margin-top: 0; margin-bottom: 20px; }
        `;

        const rowsHtml = processedLogs.map(i => `
            <tr>
                <td>${format(parseISO(i.created_at), 'MMM d, yyyy HH:mm:ss')}</td>
                <td>${i.action}</td>
                <td>${i.user_email || 'System'}</td>
                <td>${i.entity_table} (${i.entity_id.substring(0, 8)})</td>
            </tr>
        `).join('');

        const html = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Audit Logs Export</title>
                <style>${tableStyle}</style>
            </head>
            <body>
                <h1>System Audit Logs</h1>
                <p>Generated on ${format(new Date(), 'MMMM d, yyyy')}</p>
                <table>
                    <thead>
                        <tr>
                            <th>Timestamp</th>
                            <th>Action</th>
                            <th>User</th>
                            <th>Target Entity</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${rowsHtml}
                    </tbody>
                </table>
                <script>
                    window.onload = function() { window.print(); window.close(); }
                </script>
            </body>
            </html>
        `;

        printWindow.document.open();
        printWindow.document.write(html);
        printWindow.document.close();
    };

    return (
        <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-end mb-6">

                <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                    <div className="relative w-full sm:w-64 max-w-full">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search logs..."
                            className="pl-9 bg-muted/50 border-border w-full"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    <div className="flex items-center gap-2 ml-auto sm:ml-0 overflow-x-auto pb-1 sm:pb-0">
                        <Select value={actionFilter} onValueChange={setActionFilter}>
                            <SelectTrigger className="w-[150px] bg-muted/50 border-border h-9 shrink-0">
                                <SelectValue placeholder="All Actions" />
                            </SelectTrigger>
                            <SelectContent className="border-border bg-popover text-popover-foreground">
                                {uniqueActions.map(action => (
                                    <SelectItem key={action} value={action}>
                                        {action === 'all' ? 'All Actions' : action}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Select value={timeRangeFilter} onValueChange={setTimeRangeFilter}>
                            <SelectTrigger className="w-[130px] bg-muted/50 border-border h-9 shrink-0">
                                <SelectValue placeholder="All Time" />
                            </SelectTrigger>
                            <SelectContent className="border-border bg-popover text-popover-foreground">
                                <SelectItem value="all">All Time</SelectItem>
                                <SelectItem value="7d">Last 7 Days</SelectItem>
                                <SelectItem value="30d">Last 30 Days</SelectItem>
                                <SelectItem value="3m">Last 3 Months</SelectItem>
                                <SelectItem value="6m">Last 6 Months</SelectItem>
                                <SelectItem value="12m">Last 12 Months</SelectItem>
                                <SelectItem value="ytd">Year to Date</SelectItem>
                            </SelectContent>
                        </Select>

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="sm" className="h-9 bg-muted/50 border-border text-foreground hover:bg-accent hover:text-accent-foreground">
                                    <Download className="h-4 w-4 mr-2" />
                                    Export
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48 border-border bg-popover text-popover-foreground">
                                <DropdownMenuItem onClick={handleExportCSV} className="cursor-pointer focus:bg-accent focus:text-accent-foreground">
                                    <FileSpreadsheet className="mr-2 h-4 w-4 text-emerald-500 dark:text-emerald-400" />
                                    <span>Export CSV</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={handleExportJSON} className="cursor-pointer focus:bg-accent focus:text-accent-foreground">
                                    <FileJson className="mr-2 h-4 w-4 text-amber-500 dark:text-amber-400" />
                                    <span>Export JSON</span>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator className="bg-border" />
                                <DropdownMenuItem onClick={handleExportPDF} className="cursor-pointer focus:bg-accent focus:text-accent-foreground">
                                    <Printer className="mr-2 h-4 w-4 text-brand-primary" />
                                    <span>Print PDF (Tabled)</span>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="rounded-xl border border-border/50 bg-background/60 backdrop-blur-md shadow-2xl dark:shadow-black/50 overflow-hidden line-clamp-none">
                <div className="h-[calc(100vh-280px)] w-full overflow-auto relative scrollbar-thin scrollbar-thumb-muted-foreground/20 scrollbar-track-transparent">
                    <Table>
                        <TableHeader className="bg-card/40 backdrop-blur-xl sticky top-0 z-10 shadow-[0_1px_0_0_var(--color-border)]">
                            <TableRow className="hover:bg-transparent border-none">
                                <TableHead className="text-xs uppercase tracking-wider font-semibold text-muted-foreground pl-6 w-[180px]">
                                    <button onClick={() => handleSort('timestamp')} className="flex items-center gap-1 hover:text-foreground transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-brand-primary rounded-sm py-1 -ml-1 px-1">
                                        Timestamp <ArrowUpDown className="h-3 w-3" />
                                    </button>
                                </TableHead>
                                <TableHead className="text-xs uppercase tracking-wider font-semibold text-muted-foreground w-[180px]">
                                    <button onClick={() => handleSort('action')} className="flex items-center gap-1 hover:text-foreground transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-brand-primary rounded-sm py-1 -ml-1 px-1">
                                        Action <ArrowUpDown className="h-3 w-3" />
                                    </button>
                                </TableHead>
                                <TableHead className="text-xs uppercase tracking-wider font-semibold text-muted-foreground w-[220px]">
                                    <button onClick={() => handleSort('user')} className="flex items-center gap-1 hover:text-foreground transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-brand-primary rounded-sm py-1 -ml-1 px-1">
                                        User <ArrowUpDown className="h-3 w-3" />
                                    </button>
                                </TableHead>
                                <TableHead className="text-xs uppercase tracking-wider font-semibold text-muted-foreground w-[200px]">
                                    <button onClick={() => handleSort('entity')} className="flex items-center gap-1 hover:text-foreground transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-brand-primary rounded-sm py-1 -ml-1 px-1">
                                        Target Entity <ArrowUpDown className="h-3 w-3" />
                                    </button>
                                </TableHead>
                                <TableHead className="text-right text-xs uppercase tracking-wider font-semibold text-muted-foreground pr-6">Details</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {processedLogs.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                                        No audit logs found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                visibleLogs.map((log) => (
                                    <TableRow key={log.id} className="hover:bg-muted/50 border-border group transition-colors">
                                        <TableCell className="pl-6 font-mono text-xs text-muted-foreground">
                                            {format(parseISO(log.created_at), 'MMM d, yyyy HH:mm:ss')}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={getActionColor(log.action) as any}>
                                                {log.action}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2 text-foreground group-hover:text-brand-primary transition-colors">
                                                <User className="h-3.5 w-3.5 shrink-0" />
                                                <span className="text-sm truncate max-w-[180px]" title={log.user_email || 'System'}>
                                                    {log.user_email || 'System'}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-sm text-foreground font-mono">
                                            {log.entity_table}
                                            <span className="text-xs text-muted-foreground ml-1.5">
                                                ({log.entity_id.substring(0, 8)})
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-right pr-6">
                                            <div className="text-xs text-muted-foreground truncate max-w-[300px] ml-auto" title={JSON.stringify(log.details, null, 2)}>
                                                {log.details ? JSON.stringify(log.details) : '-'}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                            {visibleCount < processedLogs.length && (
                                <TableRow ref={observerTarget}>
                                    <TableCell colSpan={5} className="h-16 text-center text-muted-foreground">
                                        <Loader className="h-4 w-4 animate-spin inline-block mr-2" /> Loading records...
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>

            <div className="text-xs text-center text-muted-foreground pt-4">
                Showing {visibleLogs.length} of {processedLogs.length} logs
            </div>
        </div>
    );
}
