'use client';

import { useState } from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription
} from '@/components/ui/card';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';
import { format, parseISO } from 'date-fns';
import { ShieldCheck, User, Filter, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AuditLog } from '@/app/actions/audit-actions';
import { ScrollArea } from '@/components/ui/scroll-area';

interface AuditLogTableProps {
    logs: AuditLog[];
}

export function AuditLogTable({ logs }: AuditLogTableProps) {
    const [actionFilter, setActionFilter] = useState<string>('all');

    // Extract unique actions for filter dropdown
    const uniqueActions = ['all', ...Array.from(new Set(logs.map(log => log.action)))];

    const filteredLogs = logs.filter(log => {
        if (actionFilter === 'all') return true;
        return log.action === actionFilter;
    });

    const getActionColor = (action: string) => {
        if (action.includes('REJECTED') || action.includes('DELETE')) return 'destructive';
        if (action.includes('APPROVED') || action.includes('CREATE')) return 'default'; // primary/indigo
        if (action.includes('UPDATED')) return 'secondary';
        return 'outline';
    };

    return (
        <Card className="border-white/10 bg-[#0d0d0d] text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <div className="space-y-1">
                    <CardTitle className="flex items-center gap-2">
                        <ShieldCheck className="h-5 w-5 text-indigo-400" />
                        System Audit Logs
                    </CardTitle>
                    <CardDescription>
                        Track critical actions and security events.
                    </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                    <Select value={actionFilter} onValueChange={setActionFilter}>
                        <SelectTrigger className="w-[180px] bg-white/5 border-white/10">
                            <Filter className="mr-2 h-4 w-4 text-muted-foreground" />
                            <SelectValue placeholder="Filter by Action" />
                        </SelectTrigger>
                        <SelectContent>
                            {uniqueActions.map(action => (
                                <SelectItem key={action} value={action}>
                                    {action === 'all' ? 'All Actions' : action}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </CardHeader>
            <CardContent>
                <div className="rounded-md border border-white/10">
                    <ScrollArea className="h-[600px]">
                        <Table>
                            <TableHeader>
                                <TableRow className="border-white/10 hover:bg-white/5 bg-white/5">
                                    <TableHead className="text-muted-foreground w-[180px]">Timestamp</TableHead>
                                    <TableHead className="text-muted-foreground w-[150px]">Action</TableHead>
                                    <TableHead className="text-muted-foreground w-[200px]">User</TableHead>
                                    <TableHead className="text-muted-foreground w-[200px]">Target Entity</TableHead>
                                    <TableHead className="text-right text-muted-foreground">Details</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredLogs.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                                            No audit logs found.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredLogs.map((log) => (
                                        <TableRow key={log.id} className="border-white/10 hover:bg-white/5">
                                            <TableCell className="font-mono text-xs text-muted-foreground">
                                                {format(parseISO(log.created_at), 'MMM d, yyyy HH:mm:ss')}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={getActionColor(log.action) as any}>
                                                    {log.action}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <User className="h-3 w-3 text-muted-foreground" />
                                                    <span className="text-sm truncate max-w-[150px]" title={log.user_email || 'System'}>
                                                        {log.user_email || 'System'}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-sm text-muted-foreground font-mono">
                                                {log.entity_table}
                                                <span className="text-xs opacity-50 ml-1">
                                                    ({log.entity_id.substring(0, 8)})
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-right text-xs text-muted-foreground max-w-[300px]">
                                                <div className="truncate" title={JSON.stringify(log.details, null, 2)}>
                                                    {log.details ? JSON.stringify(log.details) : '-'}
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </ScrollArea>
                </div>
            </CardContent>
        </Card>
    );
}
