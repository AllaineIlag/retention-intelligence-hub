'use client';

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { Mail, Clock, ShieldAlert } from 'lucide-react';

interface Invite {
    id: string;
    email: string;
    full_name: string | null;
    status: string;
    created_at: string;
}

interface RecentInvitesTableProps {
    invites: Invite[];
}

export function RecentInvitesTable({ invites }: RecentInvitesTableProps) {
    if (!invites || invites.length === 0) {
        return (
            <Card className="border-white/5 bg-white/[0.02]">
                <CardHeader>
                    <CardTitle className="text-sm font-medium">Recent Invitations</CardTitle>
                    <CardDescription className="text-xs">No pending invitations found.</CardDescription>
                </CardHeader>
            </Card>
        );
    }

    return (
        <Card className="border-white/5 bg-white/[0.02]">
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="text-sm font-medium">Recent Invitations</CardTitle>
                        <CardDescription className="text-xs">Tracking active recruitment efforts.</CardDescription>
                    </div>
                    <Badge variant="outline" className="bg-amber-500/10 text-amber-500 border-amber-500/20 text-[10px] h-5">
                        {invites.length} Pending
                    </Badge>
                </div>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow className="hover:bg-transparent border-white/5">
                            <TableHead className="h-9 text-xs">Personnel</TableHead>
                            <TableHead className="h-9 text-xs">Sent</TableHead>
                            <TableHead className="h-9 text-xs text-right">Status</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {invites.map((invite) => (
                            <TableRow key={invite.id} className="hover:bg-white/5 border-white/5">
                                <TableCell className="py-2.5">
                                    <div className="flex flex-col">
                                        <span className="text-sm font-medium text-zinc-200">
                                            {invite.full_name || 'Prospect'}
                                        </span>
                                        <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                                            <Mail className="h-2.5 w-2.5" />
                                            {invite.email}
                                        </span>
                                    </div>
                                </TableCell>
                                <TableCell className="py-2.5">
                                    <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                                        <Clock className="h-3 w-3 text-zinc-500" />
                                        {formatDistanceToNow(new Date(invite.created_at), { addSuffix: true })}
                                    </div>
                                </TableCell>
                                <TableCell className="py-2.5 text-right">
                                    <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-[10px] text-amber-500 font-medium">
                                        <ShieldAlert className="h-2.5 w-2.5" />
                                        Invited
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
