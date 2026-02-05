'use client';

import { useEffect, useState } from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getTeamMembers, toggleUserPermission } from '@/app/actions/user-actions';
import { Database, RefreshCw, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

type Profile = {
    id: string;
    full_name: string | null;
    email: string | null;
    role: string | null;
    status: string | null;
    can_export_data: boolean | null;
    created_at: string;
};

export default function TeamMembersTable() {
    const [members, setMembers] = useState<Profile[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchMembers = async () => {
        setLoading(true);
        const result = await getTeamMembers();
        if (result.success && result.data) {
            setMembers(result.data as any); // Type assertion needed due to complex DB types
        } else {
            toast.error('Failed to load team members');
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchMembers();
    }, []);

    const handlePermissionToggle = async (userId: string, isChecked: boolean) => {
        // Optimistic update
        setMembers((prev) =>
            prev.map((m) =>
                m.id === userId ? { ...m, can_export_data: isChecked } : m
            )
        );

        const result = await toggleUserPermission(userId, 'can_export_data', isChecked);
        if (result.error) {
            toast.error(result.error);
            // Revert on error
            fetchMembers();
        } else {
            toast.success('Permission updated');
        }
    };

    return (
        <Card className="col-span-1 md:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="space-y-1">
                    <CardTitle>Team Management</CardTitle>
                    <CardDescription>
                        Manage access and permissions for your interviewers.
                    </CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={fetchMembers} disabled={loading}>
                    <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                </Button>
            </CardHeader>
            <CardContent>
                {loading && members.length === 0 ? (
                    <div className="flex justify-center p-8">
                        <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                ) : (
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>User</TableHead>
                                    <TableHead>Role</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Joined</TableHead>
                                    <TableHead>Permissions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {members.map((member) => (
                                    <TableRow key={member.id}>
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <span className="font-medium">{member.full_name || 'N/A'}</span>
                                                <span className="text-xs text-muted-foreground">
                                                    {member.email}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className="capitalize">
                                                {member.role}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Badge
                                                variant={
                                                    member.status === 'active'
                                                        ? 'default'
                                                        : member.status === 'invited'
                                                            ? 'secondary'
                                                            : 'destructive'
                                                }
                                                className="capitalize"
                                            >
                                                {member.status || 'unknown'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            {format(new Date(member.created_at), 'MMM d, yyyy')}
                                        </TableCell>
                                        <TableCell>
                                            {member.role !== 'lead' && (
                                                <div className="flex items-center space-x-2">
                                                    <Switch
                                                        id={`export-${member.id}`}
                                                        checked={member.can_export_data || false}
                                                        onCheckedChange={(checked) =>
                                                            handlePermissionToggle(member.id, checked)
                                                        }
                                                    />
                                                    <Database className="h-4 w-4 text-muted-foreground" />
                                                </div>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {members.length === 0 && !loading && (
                                    <TableRow>
                                        <TableCell colSpan={5} className="h-24 text-center">
                                            No team members found.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
