
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    getDepartments, getPositions, addDepartment, toggleDepartmentStatus, addPosition, togglePositionStatus, getProfile,
    getBusinessUnits, addBusinessUnit, toggleBusinessUnitStatus,
    getSupervisors, addSupervisor, toggleSupervisorStatus
} from '@/app/actions/settings-actions';
import { ReferenceTableEditor } from '@/components/dashboard/settings/ReferenceTableEditor';
import { ResetPasswordCard } from '@/components/dashboard/settings/ResetPasswordCard';


export default async function SettingsPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) redirect('/login');

    const profileRes = await getProfile();
    const profile = profileRes.data;

    // Fetch system data (parallel)
    const [deptRes, posRes, buRes, supRes] = await Promise.all([
        getDepartments(),
        getPositions(),
        getBusinessUnits(),
        getSupervisors()
    ]);

    const departments = deptRes.success && deptRes.data ? deptRes.data : [];
    const positions = posRes.success && posRes.data ? posRes.data : [];
    const businessUnits = buRes.success && buRes.data ? buRes.data : [];
    const supervisors = supRes.success && supRes.data ? supRes.data : [];

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <Tabs defaultValue="profile" className="space-y-6">
                {profile?.role === 'lead' && (
                    <TabsList className="bg-muted border border-border">
                        <TabsTrigger value="profile">Profile</TabsTrigger>
                        <TabsTrigger value="system">System Configuration</TabsTrigger>
                    </TabsList>
                )}

                <TabsContent value="profile" className="space-y-4">
                    <Card className="border-border bg-card">
                        <CardHeader>
                            <CardTitle>Profile Information</CardTitle>
                            <CardDescription>Your account details and role.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4 max-w-xl">
                                <div className="space-y-1">
                                    <p className="text-sm font-medium text-muted-foreground">Full Name</p>
                                    <p className="text-foreground">{profile?.full_name}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-sm font-medium text-muted-foreground">Email</p>
                                    <p className="text-foreground">{profile?.email}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-sm font-medium text-muted-foreground">Role</p>
                                    <div className="inline-flex items-center rounded-full border border-blue-500/30 bg-blue-500/10 px-2.5 py-0.5 text-xs font-semibold text-blue-500 capitalize">
                                        {profile?.role}
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <ResetPasswordCard />
                </TabsContent>

                {profile?.role === 'lead' && (
                    <TabsContent value="system" className="space-y-6">
                        <div className="grid gap-6 md:grid-cols-2">
                            <ReferenceTableEditor
                                title="Departments"
                                description="Manage active departments for dropdowns."
                                items={departments}
                                onAdd={addDepartment}
                                onToggle={toggleDepartmentStatus}
                            />
                            <ReferenceTableEditor
                                title="Positions"
                                description="Manage job titles and positions available in the system."
                                items={positions}
                                onAdd={addPosition}
                                onToggle={togglePositionStatus}
                            />
                            <ReferenceTableEditor
                                title="Business Units"
                                description="Manage active business units for dropdowns."
                                items={businessUnits}
                                onAdd={addBusinessUnit}
                                onToggle={toggleBusinessUnitStatus}
                            />
                            <ReferenceTableEditor
                                title="Supervisors"
                                description="Manage intermediate supervisors and managers in the system."
                                items={supervisors}
                                onAdd={addSupervisor}
                                onToggle={toggleSupervisorStatus}
                            />
                        </div>
                    </TabsContent>
                )}
            </Tabs>
        </div>
    );
}
