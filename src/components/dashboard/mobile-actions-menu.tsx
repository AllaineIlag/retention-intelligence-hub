'use client';

import * as React from 'react';
import { usePathname } from 'next/navigation';
import { LayoutGrid, Filter, FilePlus, Download } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { PageFilterBar } from './page-filter-bar';

export function MobileActionsMenu() {
    const pathname = usePathname();
    const [filterOpen, setFilterOpen] = React.useState(false);
    const [resignOpen, setResignOpen] = React.useState(false);
    const [isMounted, setIsMounted] = React.useState(false);

    React.useEffect(() => {
        setIsMounted(true);
    }, []);

    // Filter is only relevant on dashboard and analytics pages
    const isDashboard = pathname === '/dashboard';
    const isAnalytics = pathname.startsWith('/dashboard/analytics');
    const showFilter = isDashboard || isAnalytics;

    if (!isMounted) {
        return (
            <div className="h-9 w-9 bg-muted/30 border border-border/50 rounded-xl" />
        );
    }

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-9 w-9 p-0 text-muted-foreground hover:text-foreground bg-muted/30 hover:bg-muted/50 border border-border/50 rounded-xl"
                    >
                        <LayoutGrid className="h-4 w-4" />
                        <span className="sr-only">Actions</span>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                    align="end"
                    className="w-48 border-border bg-popover text-popover-foreground shadow-2xl"
                >
                    {showFilter && (
                        <>
                            <DropdownMenuItem
                                onClick={() => setFilterOpen(true)}
                                className="gap-2 text-muted-foreground hover:text-foreground focus:text-foreground focus:bg-accent cursor-pointer"
                            >
                                <Filter className="h-4 w-4" />
                                Filter
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="bg-border" />
                        </>
                    )}

                    <DropdownMenuItem
                        onClick={() => setResignOpen(true)}
                        className="gap-2 text-muted-foreground hover:text-foreground focus:text-foreground focus:bg-accent cursor-pointer"
                    >
                        <FilePlus className="h-4 w-4 text-brand-primary" />
                        Log Resignation
                    </DropdownMenuItem>

                    <DropdownMenuSeparator className="bg-white/5" />

                    <DropdownMenuItem
                        disabled
                        className="gap-2 text-zinc-500 cursor-not-allowed"
                    >
                        <Download className="h-4 w-4" />
                        Export
                        <span className="ml-auto text-[10px] text-zinc-600 uppercase">Soon</span>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            {/* Mobile Filter Dialog (centered) */}
            <Dialog open={filterOpen} onOpenChange={setFilterOpen}>
                <DialogContent className="max-w-xs border-border bg-background text-foreground rounded-2xl">
                    <DialogHeader>
                        <DialogTitle className="text-foreground text-sm font-semibold">Time Range Filter</DialogTitle>
                        <DialogDescription className="text-muted-foreground text-xs">
                            Select a date range for dashboard data
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-2 flex justify-center" onClick={() => setTimeout(() => setFilterOpen(false), 200)}>
                        <PageFilterBar />
                    </div>
                </DialogContent>
            </Dialog>

            {/* Resignation Dialog triggered externally */}
            {resignOpen && (
                <MobileResignationTrigger
                    open={resignOpen}
                    onOpenChange={setResignOpen}
                />
            )}
        </>
    );
}

// Lazy-loaded wrapper to open the Dialog without a visible trigger
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { createResignation } from '@/app/actions/resignation-ops';
import { getDepartments, getBusinessUnits, getSupervisors } from '@/app/actions/settings-actions';

function MobileResignationTrigger({
    open,
    onOpenChange,
}: {
    open: boolean;
    onOpenChange: (o: boolean) => void;
}) {
    const [loading, setLoading] = React.useState(false);
    const [selectedDept, setSelectedDept] = React.useState<string>('');
    const [selectedBU, setSelectedBU] = React.useState<string>('');
    const [selectedSupervisor, setSelectedSupervisor] = React.useState<string>('');
    const [departments, setDepartments] = React.useState<string[]>([]);
    const [businessUnits, setBusinessUnits] = React.useState<string[]>([]);
    const [supervisors, setSupervisors] = React.useState<string[]>([]);

    React.useEffect(() => {
        async function fetchSettings() {
            const [dRes, bRes, sRes] = await Promise.all([
                getDepartments(),
                getBusinessUnits(),
                getSupervisors()
            ]);
            if (dRes.success) setDepartments(dRes.data?.filter(d => d.is_active).map(d => d.name) || []);
            if (bRes.success) setBusinessUnits(bRes.data?.filter(b => b.is_active).map(b => b.name) || []);
            if (sRes.success) setSupervisors(sRes.data?.filter(s => s.is_active).map(s => s.name) || []);
        }
        if (open) fetchSettings();
    }, [open]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const formData = new FormData(e.target as HTMLFormElement);
        const name = formData.get('name') as string;
        const email = formData.get('email') as string;
        const lwd = formData.get('lastWorkingDay') as string;

        if (!selectedDept || !selectedBU || !selectedSupervisor) {
            toast.error('Please fill in all required fields');
            setLoading(false);
            return;
        }

        const res = await createResignation({
            name,
            email,
            department: selectedDept,
            businessUnit: selectedBU,
            intermediateSupervisor: selectedSupervisor,
            lastWorkingDay: new Date(lwd),
        });

        if (res.success) {
            if (res.emailError) {
                toast.warning('Case logged, but email failed', {
                    description: `Resignation recorded in database, but invitation email could not be sent: ${res.emailErrorMessage}`,
                });
            } else {
                toast.success('Resignation workflow initiated', {
                    description: 'The employee has been invited via email.',
                });
            }
            onOpenChange(false);
        } else {
            toast.error('Failed to initiate workflow', {
                description: res.error,
            });
        }

        setLoading(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-[calc(100vw-2rem)] sm:max-w-[500px] border-border bg-background text-foreground rounded-2xl">
                <DialogHeader>
                    <DialogTitle>Log New Resignation</DialogTitle>
                    <DialogDescription className="text-zinc-400">
                        Manually initiate the exit process. System will invite the employee via email.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="grid gap-4 py-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="mob-name" className="text-zinc-300">Employee Name</Label>
                            <Input id="mob-name" name="name" placeholder="John Doe" className="border-white/10 bg-white/5 text-white" required />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="mob-email" className="text-zinc-300">Work Email</Label>
                            <Input id="mob-email" name="email" type="email" placeholder="john@company.com" className="border-white/10 bg-white/5 text-white" required />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="mob-department" className="text-zinc-300">Department</Label>
                            <Select value={selectedDept} onValueChange={setSelectedDept} required>
                                <SelectTrigger className="border-border bg-muted/20 text-foreground">
                                    <SelectValue placeholder="Select Dept" />
                                </SelectTrigger>
                                <SelectContent className="border-border bg-popover text-popover-foreground">
                                    {departments.map((d) => (
                                        <SelectItem key={d} value={d}>{d}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="mob-businessUnit" className="text-zinc-300">Business Unit</Label>
                            <Select value={selectedBU} onValueChange={setSelectedBU} required>
                                <SelectTrigger className="border-white/10 bg-white/5 text-white">
                                    <SelectValue placeholder="Select BU" />
                                </SelectTrigger>
                                <SelectContent className="border-border bg-popover text-popover-foreground">
                                    {businessUnits.map((bu) => (
                                        <SelectItem key={bu} value={bu}>{bu}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="mob-supervisor" className="text-zinc-300">Intermediate Supervisor</Label>
                        <Select value={selectedSupervisor} onValueChange={setSelectedSupervisor} required>
                            <SelectTrigger className="border-white/10 bg-white/5 text-white">
                                <SelectValue placeholder="Select Supervisor" />
                            </SelectTrigger>
                            <SelectContent className="border-border bg-popover text-popover-foreground">
                                {supervisors.map((s) => (
                                    <SelectItem key={s} value={s}>{s}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="mob-lastWorkingDay" className="text-zinc-300">Last Working Day</Label>
                        <Input id="mob-lastWorkingDay" name="lastWorkingDay" type="date" className="border-white/10 bg-white/5 text-white" required />
                    </div>
                    <DialogFooter className="mt-4">
                        <Button
                            type="submit"
                            disabled={loading}
                            className="bg-brand-primary hover:bg-brand-primary/90 text-white w-full sm:w-auto"
                        >
                            {loading ? 'Processing...' : 'Start Process'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
