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
            <Card className="border-white/5 bg-white/[0.02] mb-8">
                <CardHeader className="pb-3">
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <CheckCircle2 className="h-5 w-5" />
                        <CardTitle className="text-lg">Pending Access Requests</CardTitle>
                    </div>
                    <CardDescription>
                        No pending requests. All users are approved.
                    </CardDescription>
                </CardHeader>
            </Card>
        );
    }

    return (
        <Card className="border-amber-500/20 bg-amber-500/5 mb-8">
            <CardHeader className="pb-3">
                <div className="flex items-center gap-2 text-amber-500">
                    <AlertCircle className="h-5 w-5" />
                    <CardTitle className="text-lg">Pending Access Requests</CardTitle>
                </div>
                <CardDescription>
                    New users waiting for approval.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="rounded-md border border-amber-500/10 bg-background/50">
                    <Table>
                        <TableHeader>
                            <TableRow className="hover:bg-transparent border-amber-500/10">
                                <TableHead className="w-[300px]">User</TableHead>
                                <TableHead>Requested On</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {users.map((user) => (
                                <TableRow key={user.id} className="hover:bg-amber-500/5 border-amber-500/10">
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-9 w-9 border border-amber-500/20">
                                                <AvatarImage src={user.avatar_url || ''} />
                                                <AvatarFallback className="bg-amber-500/10 text-amber-500">
                                                    {(user.full_name || user.email || '?').substring(0, 2).toUpperCase()}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="flex flex-col">
                                                <span className="font-medium">{user.full_name}</span>
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
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="border-green-500/20 hover:bg-green-500/10 hover:text-green-500"
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
                                                className="border-red-500/20 hover:bg-red-500/10 hover:text-red-500"
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
            </CardContent>
        </Card>
    );
}
