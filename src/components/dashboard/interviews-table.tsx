'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search,
    Filter,
    Calendar,
    MoreHorizontal,
    UserCircle,
    ArrowRight,
    Loader,
    CheckCircle2,
    CalendarClock,
    XCircle,
    Clock,
    Lock
} from 'lucide-react';
import { format } from 'date-fns';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
// Badge removed in favor of custom pill design
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface Interview {
    id: string;
    status: 'pending_exit_form' | 'pending_interview' | 'scheduled' | 'completed' | 'cancelled' | 'locked';
    created_at: string;
    scheduled_interview_date: string | null;
    last_working_day: string | null;
    employee: {
        id: string;
        full_name: string | null;
        email: string | null;
        role: string | null;
        department: string | null;
        avatar_url?: string | null;
    } | null;
}

interface InterviewsTableProps {
    data: Interview[];
}

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { scheduleInterview } from "@/app/actions/interview-ops"
import { declineResignation } from "@/app/actions/resignation-ops"
import { toast } from "sonner" // Assuming sonner is used, consistent with previous dialog

export function InterviewsTable({ data }: InterviewsTableProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'scheduled'>('all');

    // Scheduling State
    const [isScheduleOpen, setIsScheduleOpen] = useState(false)
    const [selectedInterview, setSelectedInterview] = useState<Interview | null>(null)
    const [scheduleDate, setScheduleDate] = useState('')
    const [isScheduling, setIsScheduling] = useState(false)

    // Decline State
    const [isDeclineOpen, setIsDeclineOpen] = useState(false)
    const [isDeclining, setIsDeclining] = useState(false)

    const handleOpenSchedule = (interview: Interview) => {
        setSelectedInterview(interview)
        setScheduleDate('')
        setIsScheduleOpen(true)
    }

    const handleScheduleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!selectedInterview || !scheduleDate) return

        setIsScheduling(true)
        const dateObj = new Date(scheduleDate)

        const res = await scheduleInterview(selectedInterview.id, dateObj)

        if (res.success) {
            toast.success("Interview Scheduled", {
                description: `Invitation sent to ${selectedInterview.employee?.full_name}`
            })
            setIsScheduleOpen(false)
        } else {
            toast.error("Scheduling Failed", {
                description: res.error
            })
        }
        setIsScheduling(false)
    }

    const handleOpenDecline = (interview: Interview) => {
        setSelectedInterview(interview)
        setIsDeclineOpen(true)
    }

    const handleDeclineSubmit = async () => {
        if (!selectedInterview) return

        setIsDeclining(true)
        const res = await declineResignation(selectedInterview.id)

        if (res.success) {
            toast.success("Resignation Declined", {
                description: `Notification sent to ${selectedInterview.employee?.full_name}`
            })
            setIsDeclineOpen(false)
        } else {
            toast.error("Action Failed", {
                description: res.error
            })
        }
        setIsDeclining(false)
    }

    const getInitials = (name: string) => name ? name.substring(0, 2).toUpperCase() : '??';

    const getStatusPill = (status: string) => {
        const config: Record<string, { icon: any, color: string, border: string, bg: string, label: string, spin?: boolean }> = {
            scheduled: {
                icon: CalendarClock,
                color: 'text-blue-400',
                border: 'border-white/10',
                bg: 'bg-white/5',
                label: 'Accepted'
            },
            pending_exit_form: {
                icon: Loader,
                color: 'text-amber-400',
                border: 'border-white/10',
                bg: 'bg-white/5',
                label: 'Pending Approval'
            },
            pending_interview: {
                icon: CheckCircle2,
                color: 'text-cyan-400',
                border: 'border-white/10',
                bg: 'bg-white/5',
                label: 'Ready for Interview'
            },
            completed: {
                icon: CheckCircle2,
                color: 'text-emerald-400',
                border: 'border-white/10',
                bg: 'bg-white/5',
                label: 'Completed'
            },
            cancelled: {
                icon: XCircle,
                color: 'text-rose-400',
                border: 'border-white/10',
                bg: 'bg-white/5',
                label: 'Cancelled'
            },
            locked: {
                icon: Lock,
                color: 'text-orange-400',
                border: 'border-white/10',
                bg: 'bg-white/5',
                label: 'Locked'
            },
            default: {
                icon: Clock,
                color: 'text-slate-400',
                border: 'border-white/10',
                bg: 'bg-white/5',
                label: status
            }
        };

        const style = config[status as keyof typeof config] || config.default;
        const Icon = style.icon;

        return (
            <div className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${style.border} ${style.bg} text-muted-foreground`}>
                <Icon className={`h-3.5 w-3.5 ${style.color} ${style.spin ? 'animate-spin' : ''}`} />
                {style.label}
            </div>
        );
    };

    // Tab counts
    const pendingRequestsCount = data.filter(i => i.status === 'pending_exit_form').length;
    const pendingInterviewCount = data.filter(i => ['pending_interview', 'scheduled'].includes(i.status)).length;
    const historyCount = data.filter(i => ['completed', 'cancelled'].includes(i.status)).length;

    return (
        <div className="space-y-4">
            {/* TABS SEGMENTATION — 3 Tabs */}
            <Tabs id="interviews-tabs" defaultValue="pending_requests" className="w-full">
                <div className="flex flex-col sm:flex-row gap-4 items-center justify-between mb-6">
                    <TabsList className="bg-white/5 border border-white/10">
                        <TabsTrigger value="pending_requests">
                            Pending Requests
                            {pendingRequestsCount > 0 && (
                                <span className="ml-1.5 inline-flex items-center justify-center h-5 min-w-5 px-1 rounded-full bg-amber-500/20 text-amber-400 text-[10px] font-bold">
                                    {pendingRequestsCount}
                                </span>
                            )}
                        </TabsTrigger>
                        <TabsTrigger value="pending_interview">
                            Pending for Interview
                            {pendingInterviewCount > 0 && (
                                <span className="ml-1.5 inline-flex items-center justify-center h-5 min-w-5 px-1 rounded-full bg-cyan-500/20 text-cyan-400 text-[10px] font-bold">
                                    {pendingInterviewCount}
                                </span>
                            )}
                        </TabsTrigger>
                        <TabsTrigger value="history">History</TabsTrigger>
                    </TabsList>

                    <div className="flex items-center gap-2 w-full sm:w-auto">
                        <div className="relative w-full sm:w-72">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search by name..."
                                className="pl-9 bg-white/5 border-white/10"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                {/* Tab 1: Pending Requests — Lead accepts or declines here */}
                <TabsContent value="pending_requests" className="mt-0">
                    <DataTable
                        data={data.filter(i => i.status === 'pending_exit_form')}
                        query={searchQuery}
                        onSchedule={handleOpenSchedule}
                        onDecline={handleOpenDecline}
                        getStatusPill={getStatusPill}
                        getInitials={getInitials}
                        tabType="pending_requests"
                    />
                </TabsContent>

                {/* Tab 2: Pending for Interview — Employee submitted form, awaiting interview, or scheduled */}
                <TabsContent value="pending_interview" className="mt-0">
                    <DataTable
                        data={data.filter(i => ['pending_interview', 'scheduled'].includes(i.status))}
                        query={searchQuery}
                        onSchedule={handleOpenSchedule}
                        onDecline={handleOpenDecline}
                        getStatusPill={getStatusPill}
                        getInitials={getInitials}
                        tabType="pending_interview"
                    />
                </TabsContent>

                {/* Tab 3: History — Completed or Cancelled */}
                <TabsContent value="history" className="mt-0">
                    <DataTable
                        data={data.filter(i => ['completed', 'cancelled'].includes(i.status))}
                        query={searchQuery}
                        onSchedule={handleOpenSchedule}
                        onDecline={handleOpenDecline}
                        getStatusPill={getStatusPill}
                        getInitials={getInitials}
                        tabType="history"
                    />
                </TabsContent>
            </Tabs>

            <Dialog open={isScheduleOpen} onOpenChange={setIsScheduleOpen}>
                <DialogContent className="sm:max-w-[425px] border-white/10 bg-[#0f0f11] text-white">
                    <DialogHeader>
                        <DialogTitle>Schedule Exit Interview</DialogTitle>
                        <DialogDescription className="text-zinc-400">
                            Set the official date and time. This will invite the employee to the Exit Process.
                        </DialogDescription>
                    </DialogHeader>
                    {selectedInterview && (
                        <form onSubmit={handleScheduleSubmit} className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label className="text-zinc-300">Employee</Label>
                                <div className="p-3 rounded-lg border border-white/10 bg-white/5 text-sm text-zinc-300">
                                    {selectedInterview.employee?.full_name} {selectedInterview.employee?.email ? `(${selectedInterview.employee.email})` : ''}
                                </div>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="schedule-date" className="text-zinc-300">Interview Date & Time</Label>
                                <Input
                                    id="schedule-date"
                                    type="datetime-local"
                                    className="border-white/10 bg-white/5 text-white [color-scheme:dark]" // force dark calendar icon
                                    required
                                    value={scheduleDate}
                                    onChange={(e) => setScheduleDate(e.target.value)}
                                />
                            </div>
                            <DialogFooter className="mt-4">
                                <Button
                                    type="submit"
                                    disabled={isScheduling}
                                    className="bg-indigo-600 hover:bg-indigo-700 text-white w-full sm:w-auto"
                                >
                                    {isScheduling ? "Scheduling..." : "Confirm & Send Invite"}
                                </Button>
                            </DialogFooter>
                        </form>
                    )}
                </DialogContent>
            </Dialog>

            <Dialog open={isDeclineOpen} onOpenChange={setIsDeclineOpen}>
                <DialogContent className="sm:max-w-[425px] border-rose-900/20 bg-[#0f0f11] text-white">
                    <DialogHeader>
                        <DialogTitle className="text-rose-400">Decline Resignation</DialogTitle>
                        <DialogDescription className="text-zinc-400">
                            Are you sure you want to decline this resignation request? This action cannot be undone.
                            The employee will be notified via email.
                        </DialogDescription>
                    </DialogHeader>
                    {selectedInterview && (
                        <div className="py-4">
                            <div className="p-3 rounded-lg border border-rose-900/20 bg-rose-950/10 text-sm text-zinc-300 mb-4">
                                <span className="font-semibold text-rose-200">Processing for:</span> {selectedInterview.employee?.full_name}
                            </div>
                            <DialogFooter>
                                <Button
                                    variant="ghost"
                                    onClick={() => setIsDeclineOpen(false)}
                                    className="text-zinc-400 hover:text-white"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    variant="destructive"
                                    onClick={handleDeclineSubmit}
                                    disabled={isDeclining}
                                    className="bg-rose-900 hover:bg-rose-800 text-white"
                                >
                                    {isDeclining ? "Declining..." : "Confirm Decline"}
                                </Button>
                            </DialogFooter>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}

function DataTable({
    data,
    query,
    onSchedule,
    onDecline,
    getStatusPill,
    getInitials,
    tabType = 'pending_requests'
}: {
    data: Interview[],
    query: string,
    onSchedule: (i: Interview) => void,
    onDecline: (i: Interview) => void,
    getStatusPill: (s: string) => React.ReactNode,
    getInitials: (n: string) => string,
    tabType?: 'pending_requests' | 'pending_interview' | 'history'
}) {
    const filtered = data.filter((interview) =>
        interview.employee?.full_name?.toLowerCase().includes(query.toLowerCase()) ||
        interview.employee?.email?.toLowerCase().includes(query.toLowerCase())
    );

    return (
        <div className="space-y-4">
            {/* Table */}
            <div className="rounded-xl border border-white/10 bg-[#0a0a0a]/50 overflow-hidden shadow-sm">
                <Table>
                    <TableHeader className="bg-white/5">
                        <TableRow className="hover:bg-white/5 border-white/5">
                            <TableHead className="text-xs uppercase tracking-wider font-semibold text-muted-foreground pl-6">Employee</TableHead>
                            <TableHead className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">Status</TableHead>
                            <TableHead className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">Date</TableHead>
                            <TableHead className="text-xs uppercase tracking-wider font-semibold text-muted-foreground text-right pr-6">Action</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filtered.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} className="h-32 text-center text-muted-foreground">
                                    No interviews found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            filtered.map((interview) => (
                                <TableRow key={interview.id} className="hover:bg-white/5 border-white/5 group transition-colors">
                                    <TableCell className="pl-6">
                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-9 w-9 border border-indigo-500/20">
                                                <AvatarImage src={interview.employee?.avatar_url || ''} alt={interview.employee?.full_name || 'Employee'} />
                                                <AvatarFallback className="bg-indigo-500/10 text-indigo-400 text-xs">
                                                    {getInitials(interview.employee?.full_name || 'U')}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <p className="font-medium text-slate-200 group-hover:text-white transition-colors">
                                                    {interview.employee?.full_name || 'Unknown Employee'}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    {interview.employee?.department || 'No Dept'} • {interview.employee?.role || 'Employee'}
                                                </p>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        {getStatusPill(interview.status)}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col text-sm">
                                            <span className="text-slate-300">
                                                {interview.scheduled_interview_date
                                                    ? format(new Date(interview.scheduled_interview_date), 'MMM d, yyyy')
                                                    : 'Not Scheduled'}
                                            </span>
                                            <span className="text-xs text-muted-foreground">
                                                {interview.scheduled_interview_date
                                                    ? format(new Date(interview.scheduled_interview_date), 'h:mm a')
                                                    : '-'}
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right pr-6">
                                        {tabType === 'pending_requests' ? (
                                            <>
                                                <Button
                                                    size="sm"
                                                    className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-900/20"
                                                    onClick={() => onSchedule(interview)}
                                                >
                                                    Accept & Schedule
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="destructive"
                                                    className="ml-2"
                                                    onClick={() => onDecline(interview)}
                                                >
                                                    Decline
                                                </Button>
                                            </>
                                        ) : tabType === 'pending_interview' ? (
                                            <Button asChild size="sm" className="bg-cyan-600 hover:bg-cyan-700 text-white shadow-lg shadow-cyan-900/20">
                                                <Link href={`/dashboard/interview/${interview.id}`}>
                                                    Go to Interview
                                                    <ArrowRight className="ml-2 h-3 w-3" />
                                                </Link>
                                            </Button>
                                        ) : (
                                            <Button asChild size="sm" variant="default" className="bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white shadow-none">
                                                <Link href={`/dashboard/interview/${interview.id}`}>
                                                    {interview.status === 'completed' ? 'View Report' : 'View Case'}
                                                    <ArrowRight className="ml-2 h-3 w-3" />
                                                </Link>
                                            </Button>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            <div className="text-xs text-center text-muted-foreground pt-4">
                Showing {filtered.length} interviews
            </div>
        </div>
    );
}
