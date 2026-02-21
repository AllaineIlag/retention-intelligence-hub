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
import { Badge } from '@/components/ui/badge';
import { Users } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

type Account = {
    id: string;
    full_name: string | null;
    email: string | null;
    role: string | null;
    status: string | null;
    avatar_url: string | null;
    created_at: string;
};

interface AccountsTableProps {
    initialAccounts?: Account[];
}

const statusStyles: Record<string, string> = {
    active: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    rejected: 'bg-red-500/10 text-red-400 border-red-500/20',
};

const statusDot: Record<string, string> = {
    active: 'bg-emerald-400',
    rejected: 'bg-red-400',
};

export default function AccountsTable({ initialAccounts = [] }: AccountsTableProps) {
    if (initialAccounts.length === 0) {
        return (
            <Card className="border-white/5 bg-white/[0.02]">
                <CardHeader>
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <Users className="h-5 w-5" />
                        <CardTitle className="text-lg">All Accounts</CardTitle>
                    </div>
                    <CardDescription>No interviewer accounts on record yet.</CardDescription>
                </CardHeader>
            </Card>
        );
    }

    return (
        <Card className="border-white/5 bg-white/[0.02]">
            <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-zinc-400" />
                    <CardTitle className="text-lg text-white">All Accounts</CardTitle>
                </div>
                <CardDescription>
                    {initialAccounts.length} interviewer account{initialAccounts.length !== 1 ? 's' : ''} on record.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="rounded-md border border-white/5 bg-background/50">
                    <Table>
                        <TableHeader>
                            <TableRow className="hover:bg-transparent border-white/5">
                                <TableHead className="h-9 text-xs">User</TableHead>
                                <TableHead className="h-9 text-xs">Role</TableHead>
                                <TableHead className="h-9 text-xs">Joined</TableHead>
                                <TableHead className="h-9 text-xs text-right">Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {initialAccounts.map((account) => (
                                <TableRow key={account.id} className="hover:bg-white/5 border-white/5">
                                    <TableCell className="py-3">
                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-8 w-8 border border-white/10">
                                                <AvatarImage src={account.avatar_url || ''} />
                                                <AvatarFallback className="bg-white/5 text-xs text-zinc-400">
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
                                    <TableCell>
                                        <Badge variant="outline" className="text-[10px] font-normal border-white/10 uppercase tracking-wider">
                                            {account.role}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-xs text-muted-foreground">
                                        {formatDistanceToNow(new Date(account.created_at), { addSuffix: true })}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div
                                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-medium capitalize ${statusStyles[account.status || ''] || 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20'}`}
                                        >
                                            <span className={`h-1.5 w-1.5 rounded-full ${statusDot[account.status || ''] || 'bg-zinc-400'}`} />
                                            {account.status}
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
