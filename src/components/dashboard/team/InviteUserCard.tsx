'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { inviteInterviewer } from '@/app/actions/user-actions';
import { Loader2, Mail } from 'lucide-react';

export default function InviteUserCard() {
    const [email, setEmail] = useState('');
    const [fullName, setFullName] = useState('');
    const [loading, setLoading] = useState(false);

    const handleInvite = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email || !fullName) return;

        setLoading(true);
        try {
            const result = await inviteInterviewer(email, fullName);
            if (result.error) {
                toast.error(result.error);
            } else {
                toast.success(`Invitation sent to ${email}`);
                setEmail('');
                setFullName('');
            }
        } catch (error) {
            toast.error('Failed to send invitation');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Invite Team Member</CardTitle>
                <CardDescription>
                    Send an invitation email to a new Interviewer.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleInvite} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="fullName">Full Name</Label>
                        <Input
                            id="fullName"
                            placeholder="e.g. John Doe"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="email">Email Address</Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="e.g. john@company.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <Button type="submit" disabled={loading} className="w-full">
                        {loading ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                            <Mail className="mr-2 h-4 w-4" />
                        )}
                        Send Invitation
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}
