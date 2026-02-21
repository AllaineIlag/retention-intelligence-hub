'use client';

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
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
            <Card className="border-white/5 bg-white/[0.02]">
                <CardHeader>
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <Ban className="h-5 w-5" />
                        <CardTitle className="text-lg">Declined Accounts</CardTitle>
                    </div>
                    <CardDescription>No declined accounts. All requests were approved.</CardDescription>
                </CardHeader>
            </Card>
        );
    }

    return (
        <Card className="border-red-500/10 bg-red-500/[0.02]">
            <CardHeader className="pb-3">
                <div className="flex items-center gap-2 text-red-400">
                    <Ban className="h-5 w-5" />
                    <CardTitle className="text-lg text-white">Declined Accounts</CardTitle>
                </div>
                <CardDescription>
                    {initialAccounts.length} account{initialAccounts.length !== 1 ? 's' : ''} denied access.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="rounded-md border border-red-500/10 bg-background/50">
                    <Table>
                        <TableHeader>
                            <TableRow className="hover:bg-transparent border-red-500/10">
                                <TableHead className="h-9 text-xs">User</TableHead>
                                <TableHead className="h-9 text-xs">Requested</TableHead>
                                <TableHead className="h-9 text-xs text-right">Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {initialAccounts.map((account) => (
                                <TableRow key={account.id} className="hover:bg-red-500/5 border-red-500/10">
                                    <TableCell className="py-3">
                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-8 w-8 border border-red-500/20">
                                                <AvatarImage src={account.avatar_url || ''} />
                                                <AvatarFallback className="bg-red-500/10 text-xs text-red-400">
                                                    {(account.full_name || account.email || '?').substring(0, 2).toUpperCase()}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="flex flex-col">
                                                <span className="text-sm font-medium text-zinc-200">
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
                                    <TableCell className="text-right">
                                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-red-500/20 bg-red-500/10 text-[10px] font-medium text-red-400">
                                            <span className="h-1.5 w-1.5 rounded-full bg-red-400" />
                                            Declined
                                        </div>
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
