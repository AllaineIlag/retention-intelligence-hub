
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getDepartments, getPositions, addDepartment, toggleDepartmentStatus, addPosition, togglePositionStatus, getProfile } from '@/app/actions/settings-actions';
import { ReferenceTableEditor } from '@/components/dashboard/settings/ReferenceTableEditor';

export default async function SettingsPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) redirect('/login');

    const profileRes = await getProfile();
    const profile = profileRes.data;

    // Fetch system data (parallel)
    const [deptRes, posRes] = await Promise.all([
        getDepartments(),
        getPositions()
    ]);

    const departments = deptRes.success && deptRes.data ? deptRes.data : [];
    const positions = posRes.success && posRes.data ? posRes.data : [];

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight text-white">Settings</h2>
                <p className="text-zinc-400">Manage your profile and system configurations.</p>
            </div>

            <Tabs defaultValue="profile" className="space-y-6">
                <TabsList className="bg-white/5 border border-white/5">
                    <TabsTrigger value="profile">Profile</TabsTrigger>
                    {profile?.role === 'lead' && (
                        <TabsTrigger value="system">System Configuration</TabsTrigger>
                    )}
                </TabsList>

                <TabsContent value="profile" className="space-y-4">
                    <Card className="border-white/5 bg-white/[0.02] backdrop-blur-sm">
                        <CardHeader>
                            <CardTitle>Profile Information</CardTitle>
                            <CardDescription>Your account details and role.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4 max-w-xl">
                                <div className="space-y-1">
                                    <p className="text-sm font-medium text-zinc-400">Full Name</p>
                                    <p className="text-zinc-100">{profile?.full_name}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-sm font-medium text-zinc-400">Email</p>
                                    <p className="text-zinc-100">{profile?.email}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-sm font-medium text-zinc-400">Role</p>
                                    <div className="inline-flex items-center rounded-full border border-blue-500/30 bg-blue-500/10 px-2.5 py-0.5 text-xs font-semibold text-blue-400 capitalize">
                                        {profile?.role}
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
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
                        </div>
                    </TabsContent>
                )}
            </Tabs>
        </div>
    );
}
