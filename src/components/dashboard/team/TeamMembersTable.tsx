'use client';

import { useState } from 'react';
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
import { toggleUserPermission } from '@/app/actions/user-actions';
import { Database, Info } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';

type Profile = {
    id: string;
    full_name: string | null;
    email: string | null;
    role: string | null;
    status: string | null;
    can_export_data: boolean | null;
    created_at: string;
};

interface TeamMembersTableProps {
    initialMembers?: Profile[];
}

export default function TeamMembersTable({ initialMembers = [] }: TeamMembersTableProps) {
    const [members, setMembers] = useState<Profile[]>(initialMembers);

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
            // Revert on error — re-seed from server would require a fetch, so just flip back
            setMembers((prev) =>
                prev.map((m) =>
                    m.id === userId ? { ...m, can_export_data: !isChecked } : m
                )
            );
        } else {
            toast.success('Permission updated');
        }
    };

    return (
        <Card className="col-span-1 md:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="space-y-1">
                    <CardTitle>Active Team</CardTitle>
                    <CardDescription>
                        Active Leads and Interviewers — manage export permissions below.
                    </CardDescription>
                </div>
            </CardHeader>
            <CardContent>
                {members.length === 0 ? (
                    <div className="flex justify-center p-8 text-muted-foreground text-sm">
                        No active team members found.
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
                                    <TableHead>
                                        <div className="flex items-center gap-1.5">
                                            Permissions
                                            <TooltipProvider delayDuration={200}>
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                                                    </TooltipTrigger>
                                                    <TooltipContent side="top" className="max-w-[220px] text-xs">
                                                        Controls whether this interviewer can export data (e.g. CSV reports) from the system. Leads always have full access.
                                                    </TooltipContent>
                                                </Tooltip>
                                            </TooltipProvider>
                                        </div>
                                    </TableHead>
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
                                                <TooltipProvider delayDuration={200}>
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <div className="flex items-center gap-2 w-fit">
                                                                <Switch
                                                                    id={`export-${member.id}`}
                                                                    checked={member.can_export_data || false}
                                                                    onCheckedChange={(checked) =>
                                                                        handlePermissionToggle(member.id, checked)
                                                                    }
                                                                />
                                                                <span className="text-xs text-muted-foreground flex items-center gap-1">
                                                                    <Database className="h-3.5 w-3.5" />
                                                                    Export Data
                                                                </span>
                                                            </div>
                                                        </TooltipTrigger>
                                                        <TooltipContent side="top" className="text-xs">
                                                            {member.can_export_data
                                                                ? 'Revoke: prevent this interviewer from exporting reports'
                                                                : 'Grant: allow this interviewer to export CSV reports'}
                                                        </TooltipContent>
                                                    </Tooltip>
                                                </TooltipProvider>
                                            )}

                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
