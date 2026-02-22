'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { CheckCircle2, XCircle, Clock, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { getPendingUsers, approveUser, rejectUser } from '@/app/actions/user-actions';
import { format } from 'date-fns';
import { useRouter } from 'next/navigation';

type Profile = {
    id: string;
    full_name: string | null;
    email: string | null;
    avatar_url: string | null;
    created_at: string;
};

interface PendingUsersTableProps {
    initialUsers?: Profile[];
}

export default function PendingUsersTable({ initialUsers = [] }: PendingUsersTableProps) {
    // Seed from SSR-provided data — no initial fetch needed
    const [users, setUsers] = useState<Profile[]>(initialUsers);
    const [processing, setProcessing] = useState<string | null>(null);
    const router = useRouter();

    const fetchUsers = async () => {
        const result = await getPendingUsers();
        if (result.success && result.data) {
            setUsers(result.data as Profile[]);
        }
    };

    useEffect(() => {
        // Realtime: auto-refresh when a new pending profile is inserted
        const supabase = createClient();
        const channel = supabase
            .channel('pending-profiles-watcher')
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'profiles', filter: 'status=eq.pending' },
                () => { fetchUsers(); }
            )
            .subscribe();

        return () => { supabase.removeChannel(channel); };
    }, []);

    const handleApprove = async (userId: string) => {
        setProcessing(userId);
        const result = await approveUser(userId);
        if (result.success) {
            toast.success('User approved successfully');
            setUsers(prev => prev.filter(u => u.id !== userId));
            router.refresh(); // Update sidebar badge count
        } else {
            toast.error(result.error || 'Failed to approve user');
        }
        setProcessing(null);
    };

    const handleReject = async (userId: string) => {
        if (!confirm('Reject this user? They will be denied access and cannot re-enter the system.')) return;

        setProcessing(userId);
        const result = await rejectUser(userId);
        if (result.success) {
            toast.success('User rejected and removed');
            setUsers(prev => prev.filter(u => u.id !== userId));
            router.refresh(); // Update sidebar badge count
        } else {
            toast.error(result.error || 'Failed to reject user');
        }
        setProcessing(null);
    };

    if (users.length === 0) {
        return (
            <div className="mb-8 rounded-xl border border-border bg-card/50 p-6 flex flex-col items-center justify-center text-center">
                <CheckCircle2 className="h-8 w-8 text-status-success mb-2" />
                <h3 className="text-lg font-medium text-foreground">No Pending Requests</h3>
                <p className="text-sm text-muted-foreground max-w-sm">All users in the queue have been successfully reviewed and approved.</p>
            </div>
        );
    }

    return (
        <div className="space-y-4 mb-8">
            <div className="flex flex-col gap-1 px-1">
                <h2 className="text-lg font-medium flex items-center gap-2 text-status-warning">
                    <AlertCircle className="h-5 w-5" />
                    Pending Access Requests
                </h2>
                <p className="text-sm text-muted-foreground">
                    New users waiting for approval.
                </p>
            </div>

            <div className="rounded-xl border border-border/50 bg-background/60 backdrop-blur-md shadow-2xl dark:shadow-black/50 overflow-hidden line-clamp-none">
                <div className="w-full overflow-auto relative scrollbar-thin scrollbar-thumb-muted-foreground/20 scrollbar-track-transparent">
                    <Table className="min-w-[700px]">
                        <TableHeader className="bg-card/40 backdrop-blur-xl sticky top-0 z-10 shadow-[0_1px_0_0_var(--color-border)]">
                            <TableRow className="hover:bg-transparent border-none">
                                <TableHead className="w-[300px] text-xs uppercase tracking-wider font-semibold text-muted-foreground pl-6">User</TableHead>
                                <TableHead className="w-[200px] text-xs uppercase tracking-wider font-semibold text-muted-foreground">Requested On</TableHead>
                                <TableHead className="text-right text-xs uppercase tracking-wider font-semibold text-muted-foreground pr-6 w-[200px]">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {users.map((user) => (
                                <TableRow key={user.id} className="hover:bg-muted/50 border-border group transition-colors">
                                    <TableCell className="pl-6">
                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-9 w-9 border-status-warning/20">
                                                <AvatarImage src={user.avatar_url || ''} />
                                                <AvatarFallback className="bg-status-warning/10 text-status-warning text-xs">
                                                    {(user.full_name || user.email || '?').substring(0, 2).toUpperCase()}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="flex flex-col">
                                                <span className="font-medium text-foreground group-hover:text-primary transition-colors">{user.full_name}</span>
                                                <span className="text-xs text-muted-foreground">{user.email}</span>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-muted-foreground">
                                        <div className="flex items-center gap-2">
                                            <Clock className="h-3 w-3" />
                                            {format(new Date(user.created_at), 'MMM d, p')}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right pr-6">
                                        <div className="flex justify-end gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="border-status-success/20 hover:bg-status-success/10 hover:text-status-success transition-colors"
                                                onClick={() => handleApprove(user.id)}
                                                disabled={!!processing}
                                            >
                                                {processing === user.id ? (
                                                    <span className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
                                                ) : (
                                                    <CheckCircle2 className="h-4 w-4 mr-1" />
                                                )}
                                                Approve
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="border-status-error/20 hover:bg-status-error/10 hover:text-status-error transition-colors"
                                                onClick={() => handleReject(user.id)}
                                                disabled={!!processing}
                                            >
                                                <XCircle className="h-4 w-4 mr-1" />
                                                Reject
                                            </Button>
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
