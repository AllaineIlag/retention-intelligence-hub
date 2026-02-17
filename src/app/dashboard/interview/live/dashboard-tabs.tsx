"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Calendar, Clock, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { format, parseISO } from 'date-fns';
import { cn } from '@/lib/utils';

interface DashboardTabsProps {
    upcoming: any[];
    pendingReview: any[];
}

export function DashboardTabs({ upcoming, pendingReview }: DashboardTabsProps) {
    return (
        <Tabs defaultValue="upcoming" className="w-full">
            <TabsList className="bg-white/5 border border-white/10">
                <TabsTrigger value="upcoming">Upcoming Schedule</TabsTrigger>
                <TabsTrigger value="pending">Pending Verification</TabsTrigger>
            </TabsList>

            <TabsContent value="upcoming" className="mt-6">
                <div className="space-y-4">
                    {upcoming.length === 0 ? (
                        <p className="text-muted-foreground text-sm pl-2">No upcoming interviews scheduled.</p>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {upcoming.map((c) => (
                                <InterviewCard key={c.id} resignation={c} />
                            ))}
                        </div>
                    )}
                </div>
            </TabsContent>

            <TabsContent value="pending" className="mt-6">
                <div className="space-y-4">
                    {pendingReview.length === 0 ? (
                        <p className="text-muted-foreground text-sm pl-2">No pending verifications.</p>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {pendingReview.map((c) => (
                                <ResignationStatusCard key={c.id} resignation={c} />
                            ))}
                        </div>
                    )}
                </div>
            </TabsContent>
        </Tabs>
    );
}

function InterviewCard({ resignation, priority = false }: { resignation: any, priority?: boolean }) {
    // @ts-ignore
    const employee = resignation.employee_details || {};

    return (
        <Card className={cn(
            "group overflow-hidden transition-all hover:border-indigo-500/50 hover:shadow-lg hover:shadow-indigo-500/10",
            priority ? "border-indigo-500/30 bg-indigo-500/[0.03]" : "bg-white/[0.02] border-white/5"
        )}>
            <CardHeader className="flex flex-row items-center gap-4 pb-3">
                <Avatar className="h-12 w-12 border-2 border-white/10">
                    <AvatarFallback className="bg-indigo-500/20 text-indigo-300 font-bold">
                        {employee.full_name?.charAt(0) || 'E'}</AvatarFallback>
                </Avatar>
                <div>
                    <CardTitle className="text-base font-bold text-white group-hover:text-indigo-300 transition-colors">
                        {employee.full_name || 'Employee'}
                    </CardTitle>
                    <CardDescription className="text-xs">
                        {employee.current_position} • {employee.department}
                    </CardDescription>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <div className="flex items-center text-sm font-medium text-white/80">
                        <Clock className="w-4 h-4 mr-2 text-indigo-400" />
                        {resignation.scheduled_interview_date ? format(parseISO(resignation.scheduled_interview_date), 'h:mm a') : 'Time TBD'}
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                        <Calendar className="w-4 h-4 mr-2 opacity-50" />
                        {resignation.scheduled_interview_date ? format(parseISO(resignation.scheduled_interview_date), 'MMMM do, yyyy') : 'Date TBD'}
                    </div>
                </div>

                <div className="pt-2">
                    <Button className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold shadow-md shadow-indigo-500/20" asChild>
                        <Link href={`/dashboard/interview/${resignation.id}`}>
                            Launch Protocol <ArrowRight className="w-4 h-4 ml-2" />
                        </Link>
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}

function ResignationStatusCard({ resignation }: { resignation: any }) {
    // @ts-ignore
    const employee = resignation.employee_details || {};

    return (
        <Card className="bg-white/[0.02] border-white/5 hover:bg-white/[0.04] transition-colors">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-bold text-white">
                    {employee.full_name || 'Employee'}
                </CardTitle>
                <Badge variant="outline" className="text-[10px] uppercase">{resignation.status}</Badge>
            </CardHeader>
            <CardContent>
                <div className="text-xs text-muted-foreground mb-4">
                    Position: {employee.current_position}
                    <br />
                    Submitted: {format(parseISO(resignation.created_at), 'MMM do')}
                </div>
                <Button size="sm" variant="secondary" className="w-full text-xs" asChild>
                    <Link href={`/dashboard/resignation/${resignation.id}`}>
                        Review Case
                    </Link>
                </Button>
            </CardContent>
        </Card>
    )
}
