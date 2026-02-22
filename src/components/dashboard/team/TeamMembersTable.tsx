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
        <div className="space-y-4 mb-8">
            <div className="flex flex-col gap-1 px-1">
                <h2 className="text-lg font-medium flex items-center gap-2">
                    Active Team
                </h2>
                <p className="text-sm text-muted-foreground">
                    Active Leads and Interviewers — manage export permissions below.
                </p>
            </div>

            <div className="rounded-xl border border-border/50 bg-background/60 backdrop-blur-md shadow-2xl dark:shadow-black/50 overflow-hidden line-clamp-none">
                {members.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-12 text-center">
                        <p className="text-sm text-muted-foreground">No active team members found.</p>
                    </div>
                ) : (
                    <div className="w-full overflow-auto relative scrollbar-thin scrollbar-thumb-muted-foreground/20 scrollbar-track-transparent">
                        <Table className="min-w-[850px]">
                            <TableHeader className="bg-card/40 backdrop-blur-xl sticky top-0 z-10 shadow-[0_1px_0_0_var(--color-border)]">
                                <TableRow className="hover:bg-transparent border-none">
                                    <TableHead className="text-xs uppercase tracking-wider font-semibold text-muted-foreground pl-6 w-[280px]">User</TableHead>
                                    <TableHead className="text-xs uppercase tracking-wider font-semibold text-muted-foreground w-[150px]">Role</TableHead>
                                    <TableHead className="text-xs uppercase tracking-wider font-semibold text-muted-foreground w-[150px]">Status</TableHead>
                                    <TableHead className="text-xs uppercase tracking-wider font-semibold text-muted-foreground w-[150px]">Joined</TableHead>
                                    <TableHead className="text-xs uppercase tracking-wider font-semibold text-muted-foreground pr-6 w-[160px]">
                                        <div className="flex items-center gap-1.5 justify-end">
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
                                    <TableRow key={member.id} className="hover:bg-muted/50 border-border group transition-colors">
                                        <TableCell className="pl-6">
                                            <div className="flex flex-col">
                                                <span className="font-medium text-foreground group-hover:text-primary transition-colors">{member.full_name || 'N/A'}</span>
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
                                        <TableCell className="text-muted-foreground text-sm">
                                            {format(new Date(member.created_at), 'MMM d, yyyy')}
                                        </TableCell>
                                        <TableCell className="pr-6">
                                            {member.role !== 'lead' && (
                                                <TooltipProvider delayDuration={200}>
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <div className="flex items-center justify-end gap-2 w-full">
                                                                <Switch
                                                                    id={`export-${member.id}`}
                                                                    checked={member.can_export_data || false}
                                                                    onCheckedChange={(checked) =>
                                                                        handlePermissionToggle(member.id, checked)
                                                                    }
                                                                />
                                                                <span className="text-xs text-foreground flex items-center gap-1 font-medium whitespace-nowrap">
                                                                    <Database className="h-3.5 w-3.5 text-muted-foreground" />
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
            </div>
        </div>
    );
}
