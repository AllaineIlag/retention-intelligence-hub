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
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { Mail, Clock, User, Shield, CheckCircle2, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { approveUser, rejectUser } from '@/app/actions/user-actions';
import { useRouter } from 'next/navigation';

interface RecentAccount {
    id: string;
    // full_name might be missing from join if not selected properly, but assuming it's there
    full_name: string | null;
    role: string | null;
    created_at: string;
    status: string | null;
    avatar_url?: string | null;
}

interface RecentAccountsTableProps {
    accounts: RecentAccount[];
}

export function RecentAccountsTable({ accounts: initialAccounts }: RecentAccountsTableProps) {
    const [accounts, setAccounts] = useState<RecentAccount[]>(initialAccounts);
    const [processing, setProcessing] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        setAccounts(initialAccounts);
    }, [initialAccounts]);

    const handleApprove = async (userId: string) => {
        setProcessing(userId);
        const result = await approveUser(userId);
        if (result.success) {
            toast.success('User approved successfully');
            // Optimistic update
            setAccounts(prev => prev.map(a => a.id === userId ? { ...a, status: 'active' } : a));
            router.refresh(); // Update sidebar badge count
        } else {
            toast.error(result.error || 'Failed to approve user');
        }
        setProcessing(null);
    };

    const handleReject = async (userId: string) => {
        if (!confirm('Are you sure you want to reject and delete this user?')) return;

        setProcessing(userId);
        const result = await rejectUser(userId);
        if (result.success) {
            toast.success('User rejected');
            // Optimistic update - remove from list
            setAccounts(prev => prev.filter(a => a.id !== userId));
            router.refresh(); // Update sidebar badge count
        } else {
            toast.error(result.error || 'Failed to reject user');
        }
        setProcessing(null);
    };



    if (!accounts || accounts.length === 0) {
        return (
            <Card className="border-white/5 bg-white/[0.02]">
                <CardHeader>
                    <CardTitle className="text-sm font-medium">Recent Accounts</CardTitle>
                    <CardDescription className="text-xs">No recent sign-ups found.</CardDescription>
                </CardHeader>
            </Card>
        );
    }

    return (
        <Card className="border-white/5 bg-white/[0.02]">
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="text-sm font-medium">Recent Accounts</CardTitle>
                        <CardDescription className="text-xs">Newest members of the platform.</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
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
                        {accounts.map((account) => (
                            <TableRow key={account.id} className="hover:bg-white/5 border-white/5">
                                <TableCell className="py-2.5">
                                    <div className="flex flex-col">
                                        <span className="text-sm font-medium text-zinc-200">
                                            {account.full_name || 'Unknown User'}
                                        </span>
                                        <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                                            <User className="h-2.5 w-2.5" />
                                            {account.id.substring(0, 8)}...
                                        </span>
                                    </div>
                                </TableCell>
                                <TableCell className="py-2.5">
                                    <Badge variant="outline" className="text-[10px] font-normal border-white/10 uppercase tracking-wider">
                                        {account.role}
                                    </Badge>
                                </TableCell>
                                <TableCell className="py-2.5">
                                    <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                                        <Clock className="h-3 w-3 text-zinc-500" />
                                        {formatDistanceToNow(new Date(account.created_at), { addSuffix: true })}
                                    </div>
                                </TableCell>
                                <TableCell className="py-2.5 text-right">
                                    {account.status === 'pending' ? (
                                        <div className="flex items-center justify-end gap-1">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-6 w-6 text-green-500 hover:text-green-400 hover:bg-green-500/10"
                                                onClick={() => handleApprove(account.id)}
                                                disabled={!!processing}
                                                title="Approve"
                                            >
                                                {processing === account.id ? (
                                                    <span className="animate-spin h-3 w-3 border-2 border-current border-t-transparent rounded-full" />
                                                ) : (
                                                    <CheckCircle2 className="h-4 w-4" />
                                                )}
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-6 w-6 text-red-500 hover:text-red-400 hover:bg-red-500/10"
                                                onClick={() => handleReject(account.id)}
                                                disabled={!!processing}
                                                title="Reject"
                                            >
                                                <XCircle className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    ) : (
                                        <StatusBadge status={account.status || 'unknown'} />
                                    )}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}

function StatusBadge({ status }: { status: string }) {
    const styles = {
        active: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
        pending: "bg-amber-500/10 text-amber-500 border-amber-500/20",
        suspended: "bg-red-500/10 text-red-500 border-red-500/20",
        invited: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    };

    const style = styles[status as keyof typeof styles] || "bg-zinc-500/10 text-zinc-500 border-zinc-500/20";
    // const icon = status === 'active' ? 'Check' : status === 'pending' ? 'Clock' : 'Shield';

    return (
        <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[10px] font-medium ${style} capitalize`}>
            {status}
        </div>
    );
}

