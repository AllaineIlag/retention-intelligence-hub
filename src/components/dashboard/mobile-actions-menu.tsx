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

    // Filter is only relevant on dashboard and deep-dive pages
    const isDashboard = pathname === '/dashboard';
    const isDeepDive = pathname.startsWith('/dashboard/deep-dive');
    const showFilter = isDashboard || isDeepDive;

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-9 w-9 p-0 text-zinc-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl"
                    >
                        <LayoutGrid className="h-4 w-4" />
                        <span className="sr-only">Actions</span>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                    align="end"
                    className="w-48 border-white/10 bg-[#0f0f11] text-white shadow-2xl shadow-black/50"
                >
                    {showFilter && (
                        <>
                            <DropdownMenuItem
                                onClick={() => setFilterOpen(true)}
                                className="gap-2 text-zinc-300 hover:text-white focus:text-white focus:bg-white/5 cursor-pointer"
                            >
                                <Filter className="h-4 w-4" />
                                Filter
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="bg-white/5" />
                        </>
                    )}

                    <DropdownMenuItem
                        onClick={() => setResignOpen(true)}
                        className="gap-2 text-zinc-300 hover:text-white focus:text-white focus:bg-white/5 cursor-pointer"
                    >
                        <FilePlus className="h-4 w-4" />
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
                <DialogContent className="max-w-xs border-white/10 bg-[#0f0f11] text-white rounded-2xl">
                    <DialogHeader>
                        <DialogTitle className="text-white text-sm font-semibold">Time Range Filter</DialogTitle>
                        <DialogDescription className="text-zinc-500 text-xs">
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
import { DEPARTMENTS, BUSINESS_UNITS, INTERMEDIATE_SUPERVISORS } from '@/constants/enums';

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
            <DialogContent className="max-w-[calc(100vw-2rem)] sm:max-w-[500px] border-white/10 bg-[#0f0f11] text-white rounded-2xl">
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
                                <SelectTrigger className="border-white/10 bg-white/5 text-white">
                                    <SelectValue placeholder="Select Dept" />
                                </SelectTrigger>
                                <SelectContent className="border-white/10 bg-[#18181b] text-white">
                                    {DEPARTMENTS.map((d) => (
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
                                <SelectContent className="border-white/10 bg-[#18181b] text-white">
                                    {BUSINESS_UNITS.map((bu) => (
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
                            <SelectContent className="border-white/10 bg-[#18181b] text-white">
                                {INTERMEDIATE_SUPERVISORS.map((s) => (
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
                            className="bg-indigo-600 hover:bg-indigo-700 text-white w-full sm:w-auto"
                        >
                            {loading ? 'Processing...' : 'Start Process'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
