'use client';

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Ban } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

type DeclinedAccount = {
    id: string;
    full_name: string | null;
    email: string | null;
    role: string | null;
    status: string | null;
    avatar_url: string | null;
    created_at: string;
};

interface DeclinedTableProps {
    initialAccounts?: DeclinedAccount[];
}

export default function DeclinedTable({ initialAccounts = [] }: DeclinedTableProps) {
    if (initialAccounts.length === 0) {
        return (
            <div className="mb-8 rounded-xl border border-border bg-card/50 p-6 flex flex-col items-center justify-center text-center">
                <Ban className="h-8 w-8 text-muted-foreground mb-2" />
                <h3 className="text-lg font-medium text-foreground">No Declined Accounts</h3>
                <p className="text-sm text-muted-foreground max-w-sm">There are currently no declined access requests in the system.</p>
            </div>
        );
    }

    return (
        <div className="space-y-4 mb-8">
            <div className="flex flex-col gap-1 px-1">
                <h2 className="text-lg font-medium flex items-center gap-2 text-status-error">
                    <Ban className="h-5 w-5" />
                    Declined Accounts
                </h2>
                <p className="text-sm text-muted-foreground">
                    {initialAccounts.length} account{initialAccounts.length !== 1 ? 's' : ''} denied access.
                </p>
            </div>

            <div className="rounded-xl border border-border/50 bg-background/60 backdrop-blur-md shadow-2xl dark:shadow-black/50 overflow-hidden line-clamp-none">
                <div className="w-full overflow-auto relative scrollbar-thin scrollbar-thumb-muted-foreground/20 scrollbar-track-transparent">
                    <Table className="min-w-[600px]">
                        <TableHeader className="bg-card/40 backdrop-blur-xl sticky top-0 z-10 shadow-[0_1px_0_0_var(--color-border)]">
                            <TableRow className="hover:bg-transparent border-none">
                                <TableHead className="text-xs uppercase tracking-wider font-semibold text-muted-foreground pl-6 w-[280px]">User</TableHead>
                                <TableHead className="text-xs uppercase tracking-wider font-semibold text-muted-foreground w-[200px]">Requested</TableHead>
                                <TableHead className="text-right text-xs uppercase tracking-wider font-semibold text-muted-foreground pr-6 w-[120px]">Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {initialAccounts.map((account) => (
                                <TableRow key={account.id} className="hover:bg-muted/50 border-border group transition-colors">
                                    <TableCell className="py-3 pl-6">
                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-8 w-8 border-status-error/20">
                                                <AvatarImage src={account.avatar_url || ''} />
                                                <AvatarFallback className="bg-status-error/10 text-xs text-status-error">
                                                    {(account.full_name || account.email || '?').substring(0, 2).toUpperCase()}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="flex flex-col">
                                                <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                                                    {account.full_name || 'Unknown User'}
                                                </span>
                                                <span className="text-xs text-muted-foreground">
                                                    {account.email}
                                                </span>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-xs text-muted-foreground">
                                        {formatDistanceToNow(new Date(account.created_at), { addSuffix: true })}
                                    </TableCell>
                                    <TableCell className="text-right pr-6">
                                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border-status-error/20 bg-status-error/10 text-[10px] font-medium text-status-error">
                                            <span className="h-1.5 w-1.5 rounded-full bg-status-error" />
                                            Declined
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </div>
    );
}
