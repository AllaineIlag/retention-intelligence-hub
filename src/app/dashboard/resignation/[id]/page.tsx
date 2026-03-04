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

    // Fetch Resignation Details with Normalized Meta
    const { data: resignation, error } = await supabase
        .from('resignations')
        .select(`
            *,
            company_directory (
                full_name,
                position,
                department,
                date_hired,
                intermediate_supervisor,
                email
            )
        `)
        .eq('id', id)
        .single();


    if (error || !resignation) {
        console.error("Resignation Load Error:", error);
        notFound();
    }

    // Map details for UI
    const dir = Array.isArray((resignation as any).company_directory)
        ? (resignation as any).company_directory[0]
        : (resignation as any).company_directory;

    const details = {
        full_name: dir?.full_name,
        current_position: dir?.position,  // map to the old key for UI compat
        department: dir?.department,
        date_hired: dir?.date_hired,
        immediate_superior: dir?.intermediate_supervisor,
        email: resignation.personal_email || dir?.email,
    };


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
                                <AvatarImage src={undefined} />
                                <AvatarFallback className="text-lg bg-primary/5">{details?.full_name?.charAt(0) || 'E'}</AvatarFallback>
                            </Avatar>
                            <div>
                                <CardTitle>{details?.full_name || 'Unknown Employee'}</CardTitle>
                                <CardDescription className="text-base">{details?.current_position} • {details?.department}</CardDescription>
                                <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                                    <Badge variant="outline">{details?.email}</Badge>
                                    <span>Submitted {formatDistanceToNow(new Date(resignation.created_at), { addSuffix: true })}</span>
                                </div>
                            </div>
                        </CardHeader>
                    </Card>

                    {/* Reason & Details - Removed (Legacy) */}
                </div>

                {/* Right Column: Operations Panel (1/3 width) */}
                <div className="lg:col-span-1">
                    <ResignationOpsCard
                        resignation={resignation}
                        employeeName={details?.full_name || 'Employee'}
                        employeeEmail={details?.email || ''}
                    />

                </div>

            </div>
        </div>
    );
}
