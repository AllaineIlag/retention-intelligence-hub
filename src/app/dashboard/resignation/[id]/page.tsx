import { createClient } from '@/lib/supabase/server';
import { notFound, redirect } from 'next/navigation';
import { ResignationOpsCard } from '@/components/dashboard/resignation-ops-card';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function ResignationPage({ params }: PageProps) {
    const { id } = await params;
    const supabase = await createClient();

    // Auth Check
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect('/login');

    // Fetch Resignation Details with Profile
    const { data: resignation, error } = await supabase
        .from('resignations')
        .select(`
      *,
      profiles:employee_id (
        full_name,
        email,
        job_title,
        department,
        avatar_url
      )
    `)
        .eq('id', id)
        .single();

    if (error || !resignation) {
        console.error("Resignation Load Error:", error);
        notFound();
    }

    // Type assertion for Supabase generic return
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const profile = resignation.profiles as any;

    return (
        <div className="container max-w-6xl py-8 space-y-8 animate-in fade-in duration-500">

            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Resignation Case #{resignation.id.slice(0, 8)}</h1>
                    <p className="text-muted-foreground mt-1">Manage process flow and verification.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Left Column: Employee Info & Context (2/3 width) */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Employee Profile Card */}
                    <Card>
                        <CardHeader className="flex flex-row items-center gap-4 space-y-0">
                            <Avatar className="h-16 w-16 border-2 border-primary/10">
                                <AvatarImage src={profile?.avatar_url} />
                                <AvatarFallback className="text-lg bg-primary/5">{profile?.full_name?.charAt(0) || 'E'}</AvatarFallback>
                            </Avatar>
                            <div>
                                <CardTitle>{profile?.full_name || 'Unknown Employee'}</CardTitle>
                                <CardDescription className="text-base">{profile?.job_title} • {profile?.department}</CardDescription>
                                <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                                    <Badge variant="outline">{profile?.email}</Badge>
                                    <span>Submitted {formatDistanceToNow(new Date(resignation.created_at), { addSuffix: true })}</span>
                                </div>
                            </div>
                        </CardHeader>
                    </Card>

                    {/* Reason & Details */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Submission Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <h3 className="text-sm font-medium text-muted-foreground mb-1">Reason for Leaving</h3>
                                <p className="text-lg">{resignation.reason || 'No specific reason provided in initial notice.'}</p>
                            </div>
                            {/* Note: In Phase 4.3 we will show the full questionnaire answers here */}
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column: Operations Panel (1/3 width) */}
                <div className="lg:col-span-1">
                    <ResignationOpsCard
                        resignation={resignation}
                        employeeName={profile?.full_name || 'Employee'}
                        employeeEmail={profile?.email || ''}
                    />
                </div>

            </div>
        </div>
    );
}
