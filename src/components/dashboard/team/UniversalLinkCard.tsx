'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Check, Copy, Link as LinkIcon, Users } from 'lucide-react';

export default function UniversalLinkCard() {
    const [copied, setCopied] = useState(false);
    // Hardcoded for now based on mission control, but could be dynamic if we implement team slugs
    const inviteLink = 'https://retentionhub.cloud/join/hr-team';

    const handleCopy = () => {
        navigator.clipboard.writeText(inviteLink);
        setCopied(true);
        toast.success("Invite link copied to clipboard");
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <Card className="border-white/5 bg-white/[0.02]">
            <CardHeader>
                <div className="flex items-center gap-2">
                    <div className="p-2 bg-indigo-500/10 rounded-lg">
                        <Users className="h-5 w-5 text-indigo-500" />
                    </div>
                    <div>
                        <CardTitle className="text-lg font-medium">Invite Your Team</CardTitle>
                        <CardDescription>
                            Share this link to onboard new interviewers.
                        </CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="link" className="text-xs text-muted-foreground">Universal Invite Link</Label>
                    <div className="flex gap-2">
                        <div className="relative flex-1">
                            <LinkIcon className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                id="link"
                                value={inviteLink}
                                readOnly
                                className="pl-9 font-mono text-xs bg-zinc-950/50 border-white/5 h-10"
                            />
                        </div>
                        <Button
                            onClick={handleCopy}
                            variant="outline"
                            className="w-[100px] border-white/10 hover:bg-white/5 transition-all duration-300"
                        >
                            {copied ? (
                                <>
                                    <Check className="mr-2 h-4 w-4 text-emerald-500" />
                                    Copied
                                </>
                            ) : (
                                <>
                                    <Copy className="mr-2 h-4 w-4" />
                                    Copy
                                </>
                            )}
                        </Button>
                    </div>
                </div>

                <div className="rounded-lg bg-indigo-500/5 border border-indigo-500/10 p-4">
                    <h4 className="text-xs font-semibold text-indigo-400 mb-1 flex items-center gap-1.5">
                        <ShieldCheckIcon className="h-3.5 w-3.5" />
                        Admin Approval Required
                    </h4>
                    <p className="text-[11px] text-zinc-400 leading-relaxed">
                        Users who join via this link will be placed in a
                        <span className="text-amber-400 font-medium ml-1">Pending State</span>.
                        You must approve them in the
                        <span className="text-zinc-200 font-medium mx-1">Command Sector</span>
                        before they can access any data.
                    </p>
                </div>
            </CardContent>
        </Card>
    );
}

function ShieldCheckIcon({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
            <path d="m9 12 2 2 4-4" />
        </svg>
    )
}
