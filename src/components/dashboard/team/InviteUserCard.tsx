'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Copy, Check } from 'lucide-react';

export default function InviteUserCard() {
    const [inviteLink, setInviteLink] = useState('');
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        // Generate the link based on the current window location
        if (typeof window !== 'undefined') {
            setInviteLink(`${window.location.origin}/join/hr-team`);
        }
    }, []);

    const handleCopy = async () => {
        if (!inviteLink) return;

        try {
            await navigator.clipboard.writeText(inviteLink);
            setCopied(true);
            toast.success('Invite link copied to clipboard');

            // Reset copied state after 2 seconds
            setTimeout(() => {
                setCopied(false);
            }, 2000);
        } catch (err) {
            toast.error('Failed to copy link');
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Invite Team Members</CardTitle>
                <CardDescription>
                    Share this link to invite new members to the HR team.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="invite-link">Team Invite Link</Label>
                    <div className="flex gap-2">
                        <Input
                            id="invite-link"
                            value={inviteLink}
                            readOnly
                            className="bg-muted/50 font-mono text-sm"
                        />
                        <Button
                            onClick={handleCopy}
                            variant="outline"
                            className="shrink-0 min-w-[100px]"
                        >
                            {copied ? (
                                <>
                                    <Check className="mr-2 h-4 w-4 text-green-500" />
                                    Copied
                                </>
                            ) : (
                                <>
                                    <Copy className="mr-2 h-4 w-4" />
                                    Copy Link
                                </>
                            )}
                        </Button>
                    </div>
                </div>
                <p className="text-xs text-muted-foreground">
                    Anyone with this link can request to join the workspace. Access requires admin approval.
                </p>
            </CardContent>
        </Card>
    );
}
