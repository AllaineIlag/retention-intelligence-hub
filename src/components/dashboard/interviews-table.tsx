'use client';

import { useState, useRef, useEffect } from 'react';
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
    Lock,
    Download,
    FileJson,
    FileSpreadsheet,
    Printer,
    ArrowUpDown
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

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
    const [exportTimeRange, setExportTimeRange] = useState<string>('30d');
    const [exportStatus, setExportStatus] = useState<string>('all');
    const [exportDepartment, setExportDepartment] = useState<string>('all');

    // Extract unique departments for the filter dropdown
    const departments = Array.from(new Set(data.map(i => i.employee?.department).filter(Boolean))) as string[];

    const now = new Date();
    const filteredData = data.filter(i => {
        // Time Filter
        const itemDate = new Date(i.created_at);
        const diffTime = Math.abs(now.getTime() - itemDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        let timeMatch = true;
        switch (exportTimeRange) {
            case '7d': timeMatch = diffDays <= 7; break;
            case '30d': timeMatch = diffDays <= 30; break;
            case '3m': timeMatch = diffDays <= 90; break;
            case '6m': timeMatch = diffDays <= 180; break;
            case '12m': timeMatch = diffDays <= 365; break;
            case 'ytd': timeMatch = itemDate.getFullYear() === now.getFullYear(); break;
            case 'all': timeMatch = true; break;
        }

        // Status Filter
        const statusMatch = exportStatus === 'all' || i.status === exportStatus;

        // Department Filter
        const deptMatch = exportDepartment === 'all' || i.employee?.department === exportDepartment;

        return timeMatch && statusMatch && deptMatch;
    });

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

    const handleExportCSV = () => {
        const exportData = filteredData;
        const headers = ['ID', 'Employee Name', 'Email', 'Department', 'Role', 'Status', 'Last Working Day', 'Interview Date', 'Created At'];
        const csvRows = exportData.map(i => [
            i.id,
            `"${i.employee?.full_name || ''}"`,
            `"${i.employee?.email || ''}"`,
            `"${i.employee?.department || ''}"`,
            `"${i.employee?.role || ''}"`,
            i.status,
            i.last_working_day ? format(new Date(i.last_working_day), 'yyyy-MM-dd') : '',
            i.scheduled_interview_date ? format(new Date(i.scheduled_interview_date), 'yyyy-MM-dd HH:mm') : '',
            format(new Date(i.created_at), 'yyyy-MM-dd HH:mm')
        ].join(','));

        const csvString = [headers.join(','), ...csvRows].join('\n');
        const blob = new Blob([csvString], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `interviews-export-${format(new Date(), 'yyyy-MM-dd')}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
    };

    const handleExportJSON = () => {
        const exportData = filteredData;
        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `interviews-export-${format(new Date(), 'yyyy-MM-dd')}.json`;
        a.click();
        window.URL.revokeObjectURL(url);
    };

    const handleExportPDF = () => {
        const exportData = filteredData;

        const printWindow = window.open('', '_blank');
        if (!printWindow) {
            toast.error("Pop-up blocked", { description: "Please allow pop-ups to print the PDF." });
            return;
        }

        const tableStyle = `
            body { font-family: sans-serif; padding: 20px; color: black; background: white; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 12px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; font-weight: bold; }
            h1 { font-size: 20px; margin-bottom: 5px; }
            p { font-size: 14px; color: #555; margin-top: 0; margin-bottom: 20px; }
        `;

        const rowsHtml = exportData.map(i => `
            <tr>
                <td>${i.employee?.full_name || 'N/A'}</td>
                <td>${i.employee?.email || 'N/A'}</td>
                <td>${i.employee?.department || 'N/A'}</td>
                <td>${i.status.replace('_', ' ').toUpperCase()}</td>
                <td>${i.scheduled_interview_date ? format(new Date(i.scheduled_interview_date), 'MMM d, yyyy') : 'N/A'}</td>
                <td>${format(new Date(i.created_at), 'MMM d, yyyy')}</td>
            </tr>
        `).join('');

        const html = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Interview Schedule Export</title>
                <style>${tableStyle}</style>
            </head>
            <body>
                <h1>Interview Schedule Report</h1>
                <p>Generated on ${format(new Date(), 'MMMM d, yyyy')}</p>
                <table>
                    <thead>
                        <tr>
                            <th>Employee</th>
                            <th>Email</th>
                            <th>Department</th>
                            <th>Status</th>
                            <th>Interview Date</th>
                            <th>Created At</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${rowsHtml}
                    </tbody>
                </table>
                <script>
                    window.onload = function() { window.print(); window.close(); }
                </script>
            </body>
            </html>
        `;

        printWindow.document.open();
        printWindow.document.write(html);
        printWindow.document.close();
    };

    const getInitials = (name: string) => name ? name.substring(0, 2).toUpperCase() : '??';

    const getStatusPill = (status: string) => {
        const config: Record<string, { icon: any, color: string, border: string, bg: string, label: string, spin?: boolean }> = {
            scheduled: {
                icon: CalendarClock,
                color: 'text-brand-primary',
                border: 'border-brand-border',
                bg: 'bg-brand-primary/5',
                label: 'Accepted'
            },
            pending_exit_form: {
                icon: Loader,
                color: 'text-amber-500 dark:text-amber-400',
                border: 'border-border',
                bg: 'bg-muted/50',
                label: 'Pending Approval'
            },
            pending_interview: {
                icon: CheckCircle2,
                color: 'text-brand-secondary',
                border: 'border-brand-border',
                bg: 'bg-brand-secondary/5',
                label: 'Ready for Interview'
            },
            completed: {
                icon: CheckCircle2,
                color: 'text-emerald-500 dark:text-emerald-400',
                border: 'border-border',
                bg: 'bg-muted/50',
                label: 'Completed'
            },
            cancelled: {
                icon: XCircle,
                color: 'text-rose-500 dark:text-rose-400',
                border: 'border-border',
                bg: 'bg-muted/50',
                label: 'Cancelled'
            },
            locked: {
                icon: Lock,
                color: 'text-orange-500 dark:text-orange-400',
                border: 'border-border',
                bg: 'bg-muted/50',
                label: 'Locked'
            },
            default: {
                icon: Clock,
                color: 'text-muted-foreground',
                border: 'border-border',
                bg: 'bg-muted/50',
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
    const pendingRequestsCount = filteredData.filter(i => i.status === 'pending_exit_form').length;
    const pendingInterviewCount = filteredData.filter(i => ['pending_interview', 'scheduled'].includes(i.status)).length;
    const historyCount = filteredData.filter(i => ['completed', 'cancelled'].includes(i.status)).length;

    return (
        <div className="space-y-4">
            {/* TABS SEGMENTATION — 3 Tabs */}
            <Tabs id="interviews-tabs" defaultValue="pending_requests" className="w-full">
                <div className="flex flex-col sm:flex-row gap-4 items-center justify-between mb-6">
                    <TabsList className="bg-muted/50 border border-border">
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

                    <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                        <div className="relative w-full sm:w-64 max-w-full">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search by name..."
                                className="pl-9 bg-muted/50 border-border w-full"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>

                        <div className="flex items-center gap-2 ml-auto sm:ml-0 overflow-x-auto pb-1 sm:pb-0">
                            <Select value={exportDepartment} onValueChange={setExportDepartment}>
                                <SelectTrigger className="w-[140px] bg-muted/50 border-border h-9 shrink-0">
                                    <SelectValue placeholder="All Departments" />
                                </SelectTrigger>
                                <SelectContent className="border-border bg-popover text-popover-foreground">
                                    <SelectItem value="all">All Departments</SelectItem>
                                    {departments.map(dept => (
                                        <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            <Select value={exportStatus} onValueChange={setExportStatus}>
                                <SelectTrigger className="w-[130px] bg-muted/50 border-border h-9 shrink-0">
                                    <SelectValue placeholder="All Statuses" />
                                </SelectTrigger>
                                <SelectContent className="border-border bg-popover text-popover-foreground">
                                    <SelectItem value="all">All Statuses</SelectItem>
                                    <SelectItem value="pending_exit_form">Pending Requests</SelectItem>
                                    <SelectItem value="pending_interview">Pending Interview</SelectItem>
                                    <SelectItem value="scheduled">Scheduled</SelectItem>
                                    <SelectItem value="completed">Completed</SelectItem>
                                    <SelectItem value="cancelled">Cancelled</SelectItem>
                                </SelectContent>
                            </Select>

                            <Select value={exportTimeRange} onValueChange={setExportTimeRange}>
                                <SelectTrigger className="w-[130px] bg-muted/50 border-border h-9 shrink-0">
                                    <SelectValue placeholder="All Time" />
                                </SelectTrigger>
                                <SelectContent className="border-border bg-popover text-popover-foreground">
                                    <SelectItem value="all">All Time</SelectItem>
                                    <SelectItem value="7d">Last 7 Days</SelectItem>
                                    <SelectItem value="30d">Last 30 Days</SelectItem>
                                    <SelectItem value="3m">Last 3 Months</SelectItem>
                                    <SelectItem value="6m">Last 6 Months</SelectItem>
                                    <SelectItem value="12m">Last 12 Months</SelectItem>
                                    <SelectItem value="ytd">Year to Date</SelectItem>
                                </SelectContent>
                            </Select>

                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" size="sm" className="h-9 bg-muted/50 border-border text-foreground hover:bg-accent hover:text-accent-foreground">
                                        <Download className="h-4 w-4 mr-2" />
                                        Export
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-48 border-border bg-popover text-popover-foreground">
                                    <DropdownMenuItem onClick={handleExportCSV} className="cursor-pointer focus:bg-accent focus:text-accent-foreground">
                                        <FileSpreadsheet className="mr-2 h-4 w-4 text-emerald-500 dark:text-emerald-400" />
                                        <span>Export CSV</span>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={handleExportJSON} className="cursor-pointer focus:bg-accent focus:text-accent-foreground">
                                        <FileJson className="mr-2 h-4 w-4 text-amber-500 dark:text-amber-400" />
                                        <span>Export JSON</span>
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator className="bg-border" />
                                    <DropdownMenuItem onClick={handleExportPDF} className="cursor-pointer focus:bg-accent focus:text-accent-foreground">
                                        <Printer className="mr-2 h-4 w-4 text-blue-500 dark:text-blue-400" />
                                        <span>Print PDF (Tabled)</span>
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>
                </div>

                {/* Tab 1: Pending Requests — Lead accepts or declines here */}
                <TabsContent value="pending_requests" className="mt-0">
                    <DataTable
                        data={filteredData.filter(i => i.status === 'pending_exit_form')}
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
                        data={filteredData.filter(i => ['pending_interview', 'scheduled'].includes(i.status))}
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
                        data={filteredData.filter(i => ['completed', 'cancelled'].includes(i.status))}
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
                <DialogContent className="sm:max-w-[425px] border-border bg-card text-foreground">
                    <DialogHeader>
                        <DialogTitle>Schedule Exit Interview</DialogTitle>
                        <DialogDescription className="text-muted-foreground">
                            Set the official date and time. This will invite the employee to the Exit Process.
                        </DialogDescription>
                    </DialogHeader>
                    {selectedInterview && (
                        <form onSubmit={handleScheduleSubmit} className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label className="text-foreground">Employee</Label>
                                <div className="p-3 rounded-lg border border-border bg-muted/50 text-sm text-muted-foreground">
                                    {selectedInterview.employee?.full_name} {selectedInterview.employee?.email ? `(${selectedInterview.employee.email})` : ''}
                                </div>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="schedule-date" className="text-foreground">Interview Date & Time</Label>
                                <Input
                                    id="schedule-date"
                                    type="datetime-local"
                                    className="border-border bg-muted/50 text-foreground"
                                    required
                                    value={scheduleDate}
                                    onChange={(e) => setScheduleDate(e.target.value)}
                                />
                            </div>
                            <DialogFooter className="mt-4">
                                <Button
                                    type="submit"
                                    disabled={isScheduling}
                                    className="bg-brand-primary hover:bg-brand-primary/90 text-white w-full sm:w-auto"
                                >
                                    {isScheduling ? "Scheduling..." : "Confirm & Send Invite"}
                                </Button>
                            </DialogFooter>
                        </form>
                    )}
                </DialogContent>
            </Dialog>

            <Dialog open={isDeclineOpen} onOpenChange={setIsDeclineOpen}>
                <DialogContent className="sm:max-w-[425px] border-destructive/20 bg-card text-foreground">
                    <DialogHeader>
                        <DialogTitle className="text-destructive">Decline Resignation</DialogTitle>
                        <DialogDescription className="text-muted-foreground">
                            Are you sure you want to decline this resignation request? This action cannot be undone.
                            The employee will be notified via email.
                        </DialogDescription>
                    </DialogHeader>
                    {selectedInterview && (
                        <div className="py-4">
                            <div className="p-3 rounded-lg border border-destructive/20 bg-destructive/10 text-sm text-foreground mb-4">
                                <span className="font-semibold text-destructive">Processing for:</span> {selectedInterview.employee?.full_name}
                            </div>
                            <DialogFooter>
                                <Button
                                    variant="ghost"
                                    onClick={() => setIsDeclineOpen(false)}
                                    className="text-muted-foreground hover:text-foreground"
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
    const [sortConfig, setSortConfig] = useState<{ key: 'employee' | 'status' | 'date', direction: 'asc' | 'desc' } | null>(null);
    const [visibleCount, setVisibleCount] = useState(20);
    const observerTarget = useRef<HTMLTableRowElement>(null);

    // Reset pagination on search or tab change
    useEffect(() => {
        setVisibleCount(20);
    }, [query, tabType]);

    // Handle Infinite Scroll Observation
    useEffect(() => {
        const observer = new IntersectionObserver(
            entries => {
                if (entries[0].isIntersecting) {
                    setVisibleCount(prev => prev + 20);
                }
            },
            { threshold: 0.1 }
        );

        if (observerTarget.current) {
            observer.observe(observerTarget.current);
        }

        return () => observer.disconnect();
    }, [observerTarget, visibleCount]);

    const handleSort = (key: 'employee' | 'status' | 'date') => {
        setSortConfig(current => {
            if (current?.key === key) {
                return current.direction === 'asc' ? { key, direction: 'desc' } : null;
            }
            return { key, direction: 'asc' };
        });
    };

    let processedData = [...data].filter((interview) =>
        interview.employee?.full_name?.toLowerCase().includes(query.toLowerCase()) ||
        interview.employee?.email?.toLowerCase().includes(query.toLowerCase())
    );

    if (sortConfig) {
        processedData.sort((a, b) => {
            const dir = sortConfig.direction === 'asc' ? 1 : -1;
            if (sortConfig.key === 'employee') {
                const nameA = a.employee?.full_name || '';
                const nameB = b.employee?.full_name || '';
                return nameA.localeCompare(nameB) * dir;
            }
            if (sortConfig.key === 'status') {
                return a.status.localeCompare(b.status) * dir;
            }
            if (sortConfig.key === 'date') {
                const dateA = new Date(a.scheduled_interview_date || a.created_at).getTime();
                const dateB = new Date(b.scheduled_interview_date || b.created_at).getTime();
                return (dateA - dateB) * dir;
            }
            return 0;
        });
    }

    const visibleData = processedData.slice(0, visibleCount);

    return (
        <div className="space-y-4">
            {/* Table */}
            <div className="rounded-xl border border-border/50 bg-background/60 backdrop-blur-md shadow-2xl dark:shadow-black/50 overflow-hidden line-clamp-none">
                <div className="h-[calc(100vh-320px)] w-full overflow-auto relative scrollbar-thin scrollbar-thumb-muted-foreground/20 scrollbar-track-transparent">
                    <Table className="min-w-[850px]">
                        <TableHeader className="bg-card/40 backdrop-blur-xl sticky top-0 z-10 shadow-[0_1px_0_0_var(--color-border)]">
                            <TableRow className="hover:bg-transparent border-none">
                                <TableHead className="text-xs uppercase tracking-wider font-semibold text-muted-foreground pl-6 w-[280px]">
                                    <button onClick={() => handleSort('employee')} className="flex items-center gap-1 hover:text-foreground transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-brand-primary rounded-sm py-1 -ml-1 px-1">
                                        Employee <ArrowUpDown className="h-3 w-3" />
                                    </button>
                                </TableHead>
                                <TableHead className="text-xs uppercase tracking-wider font-semibold text-muted-foreground w-[180px]">
                                    <button onClick={() => handleSort('status')} className="flex items-center gap-1 hover:text-foreground transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-brand-primary rounded-sm py-1 -ml-1 px-1">
                                        Status <ArrowUpDown className="h-3 w-3" />
                                    </button>
                                </TableHead>
                                <TableHead className="text-xs uppercase tracking-wider font-semibold text-muted-foreground w-[160px]">
                                    <button onClick={() => handleSort('date')} className="flex items-center gap-1 hover:text-foreground transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-brand-primary rounded-sm py-1 -ml-1 px-1">
                                        Date <ArrowUpDown className="h-3 w-3" />
                                    </button>
                                </TableHead>
                                <TableHead className="text-xs uppercase tracking-wider font-semibold text-muted-foreground text-right pr-6 w-[230px]">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {processedData.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="h-32 text-center text-muted-foreground">
                                        No interviews found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                visibleData.map((interview) => (
                                    <TableRow key={interview.id} className="hover:bg-muted/50 border-border group transition-colors">
                                        <TableCell className="pl-6">
                                            <div className="flex items-center gap-3">
                                                <Avatar className="h-9 w-9 border-brand-primary/20">
                                                    <AvatarImage src={interview.employee?.avatar_url || ''} alt={interview.employee?.full_name || 'Employee'} />
                                                    <AvatarFallback className="bg-brand-primary/10 text-brand-primary text-xs">
                                                        {getInitials(interview.employee?.full_name || 'U')}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <p className="font-medium text-foreground group-hover:text-primary transition-colors">
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
                                                <span className="text-foreground">
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
                                                <div className="flex items-center justify-end gap-2">
                                                    <Button
                                                        size="sm"
                                                        className="bg-brand-primary hover:bg-brand-primary/90 text-white shadow-lg shadow-brand-primary/20 shrink-0"
                                                        onClick={() => onSchedule(interview)}
                                                    >
                                                        Accept & Schedule
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="destructive"
                                                        className="shrink-0"
                                                        onClick={() => onDecline(interview)}
                                                    >
                                                        Decline
                                                    </Button>
                                                </div>
                                            ) : tabType === 'pending_interview' ? (
                                                <div className="flex justify-end">
                                                    <Button asChild size="sm" className="bg-cyan-600 hover:bg-cyan-700 text-white shadow-lg shadow-cyan-900/20 shrink-0">
                                                        <Link href={`/dashboard/interview/${interview.id}`}>
                                                            Go to Interview
                                                            <ArrowRight className="ml-2 h-3 w-3" />
                                                        </Link>
                                                    </Button>
                                                </div>
                                            ) : (
                                                <div className="flex justify-end">
                                                    <Button asChild size="sm" variant="default" className="bg-muted/50 hover:bg-accent text-muted-foreground hover:text-accent-foreground shadow-none border border-border shrink-0">
                                                        <Link href={`/dashboard/interview/${interview.id}`}>
                                                            {interview.status === 'completed' ? 'View Report' : 'View Case'}
                                                            <ArrowRight className="ml-2 h-3 w-3" />
                                                        </Link>
                                                    </Button>
                                                </div>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                            {visibleCount < processedData.length && (
                                <TableRow ref={observerTarget}>
                                    <TableCell colSpan={4} className="h-16 text-center text-muted-foreground">
                                        <Loader className="h-4 w-4 animate-spin inline-block mr-2" /> Loading records...
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>

            <div className="text-xs text-center text-muted-foreground pt-4">
                Showing {visibleData.length} of {processedData.length} interviews
            </div>
        </div>
    );
}
