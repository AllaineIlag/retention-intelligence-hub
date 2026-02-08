'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { inviteInterviewer } from '@/app/actions/user-actions';
import { Loader2, Mail } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export default function InviteUserCard() {
    const [emails, setEmails] = useState('');
    const [loading, setLoading] = useState(false);
    const [progress, setProgress] = useState('');

    const handleInvite = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!emails) return;

        const emailList = emails.split(',').map(e => e.trim()).filter(e => e.length > 0);

        if (emailList.length === 0) {
            toast.error("Please enter at least one valid email.");
            return;
        }

        setLoading(true);
        let successCount = 0;
        let failCount = 0;

        try {
            for (let i = 0; i < emailList.length; i++) {
                const email = emailList[i];

                // Rate Limit Throttle: Wait 2.5s between requests
                if (i > 0) {
                    setProgress(`Cooling down... (${i}/${emailList.length})`);
                    await sleep(2500);
                }

                setProgress(`Sending to ${email}... (${i + 1}/${emailList.length})`);

                // Determine a name from the email
                const tempName = email.split('@')[0];

                const result = await inviteInterviewer(email, tempName);
                if (result.error) {
                    console.error(`Failed to invite ${email}:`, result.error);
                    failCount++;
                } else {
                    successCount++;
                }
            }

            if (successCount > 0) {
                toast.success(`Successfully invited ${successCount} users.`);
            }
            if (failCount > 0) {
                toast.warning(`Failed to invite ${failCount} users. Check console.`);
            }

            setEmails('');
        } catch (error) {
            toast.error('System error during bulk invite.');
        } finally {
            setLoading(false);
            setProgress('');
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Invite Team Members</CardTitle>
                <CardDescription>
                    Send invitation emails. Separate multiple emails with commas.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleInvite} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="emails">Email Addresses (Comma-separated)</Label>
                        <Textarea
                            id="emails"
                            placeholder="e.g. john@company.com, jane@company.com"
                            value={emails}
                            onChange={(e) => setEmails(e.target.value)}
                            className="min-h-[100px]"
                            required
                        />
                    </div>
                    <Button type="submit" disabled={loading} className="w-full">
                        {loading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                {progress || 'Sending...'}
                            </>
                        ) : (
                            <>
                                <Mail className="mr-2 h-4 w-4" />
                                Send {emails.split(',').filter(e => e.trim()).length > 1 ? 'Invitations' : 'Invitation'}
                            </>
                        )}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}
