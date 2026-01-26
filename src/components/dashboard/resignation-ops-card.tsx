"use client";

import * as React from "react";
import { format } from "date-fns";
import {
    CheckCircle2,
    XCircle,
    Clock,
} from "lucide-react";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { DatePicker } from "@/components/date-picker";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";

import { verifyResignation, approveResignation, declineResignation } from "@/app/actions/resignation-ops";

// Define shape of resignation data needed
interface ResignationOpsProps {
    resignation: {
        id: string;
        status: string; // 'pending' | 'verified' | 'scheduled' | 'approved' | 'declined' | 'completed'
        last_working_day?: string | null;
        scheduled_interview_date?: string | null;
        created_at: string;
        employee_id: string;
        reason?: string;
    };
    employeeName: string;
    employeeEmail: string;
}

export function ResignationOpsCard({ resignation, employeeName, employeeEmail }: ResignationOpsProps) {
    const [isPending, startTransition] = React.useTransition();
    const [lastWorkingDay, setLastWorkingDay] = React.useState<Date | undefined>(
        resignation.last_working_day ? new Date(resignation.last_working_day) : undefined
    );
    const [scheduleDate, setScheduleDate] = React.useState<Date | undefined>(
        resignation.scheduled_interview_date ? new Date(resignation.scheduled_interview_date) : undefined
    );

    // Dialog States
    const [showDeclineDialog, setShowDeclineDialog] = React.useState(false);

    // Computed Status Color
    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'pending': return 'bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20';
            case 'verified': return 'bg-blue-500/10 text-blue-500 hover:bg-blue-500/20';
            case 'approved':
            case 'scheduled': return 'bg-purple-500/10 text-purple-500 hover:bg-purple-500/20';
            case 'completed': return 'bg-green-500/10 text-green-500 hover:bg-green-500/20';
            case 'declined': return 'bg-red-500/10 text-red-500 hover:bg-red-500/20';
            default: return 'bg-muted text-muted-foreground';
        }
    };

    // Actions
    const onVerify = () => {
        if (!lastWorkingDay) {
            toast.error("Please select the Last Working Day.");
            return;
        }

        startTransition(async () => {
            const result = await verifyResignation(resignation.id, lastWorkingDay);
            if (result.success) {
                toast.success("Resignation Verified", {
                    description: "Employee has been notified via email."
                });
            } else {
                toast.error("Verification Failed", { description: result.error });
            }
        });
    };

    const onApprove = () => {
        if (!scheduleDate) {
            toast.error("Please select an Interview Date.");
            return;
        }

        startTransition(async () => {
            const result = await approveResignation(resignation.id, scheduleDate);
            if (result.success) {
                toast.success("Interview Scheduled", {
                    description: "Employee has been notified via email."
                });
            } else {
                toast.error("Scheduling Failed", { description: result.error });
            }
        });
    };

    const onDecline = () => {
        startTransition(async () => {
            const result = await declineResignation(resignation.id);
            if (result.success) {
                toast.success("Resignation Declined", {
                    description: "Employee has been notified."
                });
                setShowDeclineDialog(false);
            } else {
                toast.error("Action Failed", { description: result.error });
            }
        });
    };

    return (
        <Card className="w-full h-full border-border/50 shadow-sm">
            <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                    <div className="space-y-1">
                        <CardTitle className="text-xl">Operations Protocol</CardTitle>
                        <CardDescription>Manage resignation Lifecycle</CardDescription>
                    </div>
                    <Badge className={cn("capitalize px-3 py-1", getStatusColor(resignation.status))}>
                        {resignation.status}
                    </Badge>
                </div>
            </CardHeader>
            <Separator />
            <CardContent className="pt-6 space-y-6">

                {/* Step 1: Verification (Only if Pending) */}
                {resignation.status === 'pending' && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-top-4">
                        <div className="flex items-center gap-2 text-primary font-medium">
                            <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-xs">1</div>
                            <span>Verify Details</span>
                        </div>

                        <div className="p-4 rounded-lg bg-accent/50 border border-border/50 space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Last Working Day</label>
                                <DatePicker
                                    date={lastWorkingDay}
                                    onChange={setLastWorkingDay}
                                    placeholder="Select last day..."
                                />
                                <p className="text-xs text-muted-foreground">
                                    Confirming this will send an acknowledgement email to {employeeName}.
                                </p>
                            </div>
                            <Button
                                onClick={onVerify}
                                disabled={isPending}
                                className="w-full"
                            >
                                {isPending ? 'Verifying...' : 'Verify & Send Ack'}
                            </Button>
                        </div>
                    </div>
                )}

                {/* Step 2: Scheduling (Only if Verified) */}
                {resignation.status === 'verified' && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-top-4">
                        <div className="flex items-center gap-2 text-primary font-medium">
                            <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-xs">2</div>
                            <span>Schedule Interview</span>
                        </div>

                        <div className="p-4 rounded-lg bg-accent/50 border border-border/50 space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Interview Date & Time</label>
                                <DatePicker
                                    date={scheduleDate}
                                    onChange={setScheduleDate}
                                    placeholder="Pick date..."
                                />
                                {/* Note: Standard DatePicker is usually date-only. 
                     Ideally we need a TimePicker too, but for MVP date is fine 
                     or we assume a standard time. 
                     Let's stick to Date for now as per "4.1" requirements. */}
                                <p className="text-xs text-muted-foreground">
                                    This will schedule the interview and trigger the "Iron Curtain" lock 24h prior.
                                </p>
                            </div>
                            <Button
                                onClick={onApprove}
                                disabled={isPending}
                                className="w-full"
                            >
                                {isPending ? 'Scheduling...' : 'Approve & Schedule'}
                            </Button>
                        </div>
                    </div>
                )}

                {/* Read Only Views for Completed Steps */}
                {(resignation.status === 'scheduled' || resignation.status === 'approved' || resignation.status === 'completed') && (
                    <div className="space-y-4">
                        <div className="flex items-center gap-3 p-3 rounded-md bg-green-500/10 text-green-600 border border-green-500/20">
                            <CheckCircle2 className="h-5 w-5" />
                            <div className="text-sm">
                                <p className="font-semibold">Interview Scheduled</p>
                                <p className="opacity-90">{resignation.scheduled_interview_date ? format(new Date(resignation.scheduled_interview_date), 'PPP') : 'Date set'}</p>
                            </div>
                        </div>

                        <div className="text-sm text-muted-foreground flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            <span>Last Working Day: {resignation.last_working_day ? format(new Date(resignation.last_working_day), 'PPP') : 'N/A'}</span>
                        </div>
                    </div>
                )}

                {resignation.status === 'declined' && (
                    <div className="flex items-center gap-3 p-3 rounded-md bg-red-500/10 text-red-600 border border-red-500/20">
                        <XCircle className="h-5 w-5" />
                        <div className="text-sm">
                            <p className="font-semibold">Resignation Declined</p>
                            <p className="opacity-90">Employee has been notified to contact HR.</p>
                        </div>
                    </div>
                )}

            </CardContent>

            {/* Footer Actions (Decline is always available unless completed) */}
            {resignation.status !== 'completed' && resignation.status !== 'declined' && (
                <CardFooter className="bg-muted/30 pt-4">
                    <Dialog open={showDeclineDialog} onOpenChange={setShowDeclineDialog}>
                        <DialogTrigger asChild>
                            <Button variant="ghost" className="text-red-500 hover:text-red-600 hover:bg-red-100/50 ml-auto" size="sm">
                                Decline / Request Review
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Decline Resignation?</DialogTitle>
                                <DialogDescription>
                                    This will notify {employeeName} that their resignation requires further discussion.
                                </DialogDescription>
                            </DialogHeader>
                            <DialogFooter>
                                <Button variant="outline" onClick={() => setShowDeclineDialog(false)}>Cancel</Button>
                                <Button variant="destructive" onClick={onDecline} disabled={isPending}>
                                    {isPending ? 'Processing...' : 'Confirm Decline'}
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </CardFooter>
            )}
        </Card>
    );
}
