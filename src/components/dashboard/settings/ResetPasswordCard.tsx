'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { KeyRound, Loader2, Eye, EyeOff } from 'lucide-react';

export function ResetPasswordCard() {
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleReset = async (e: React.FormEvent) => {
        e.preventDefault();

        if (newPassword.length < 8) {
            toast.error('Password must be at least 8 characters');
            return;
        }

        if (newPassword !== confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }

        setLoading(true);
        const supabase = createClient();

        const { error } = await supabase.auth.updateUser({ password: newPassword });

        if (error) {
            toast.error('Failed to update password', { description: error.message });
        } else {
            toast.success('Password updated successfully');
            setNewPassword('');
            setConfirmPassword('');
        }

        setLoading(false);
    };

    return (
        <Card className="border-border bg-card">
            <CardHeader>
                <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                        <KeyRound className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                        <CardTitle>Reset Password</CardTitle>
                        <CardDescription>Set a new password for your account.</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleReset} className="space-y-4 max-w-sm">
                    <div className="space-y-2">
                        <Label htmlFor="new-password" className="text-sm font-medium text-muted-foreground">
                            New Password
                        </Label>
                        <div className="relative">
                            <Input
                                id="new-password"
                                type={showNew ? 'text' : 'password'}
                                placeholder="Min. 8 characters"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="pr-10 border-border/50 bg-muted/20 rounded-xl"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowNew(!showNew)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                            >
                                {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="confirm-password" className="text-sm font-medium text-muted-foreground">
                            Confirm Password
                        </Label>
                        <div className="relative">
                            <Input
                                id="confirm-password"
                                type={showConfirm ? 'text' : 'password'}
                                placeholder="Repeat new password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="pr-10 border-border/50 bg-muted/20 rounded-xl"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirm(!showConfirm)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                            >
                                {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                        </div>
                    </div>

                    <Button
                        type="submit"
                        disabled={loading || !newPassword || !confirmPassword}
                        className="w-full rounded-xl"
                    >
                        {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                        Update Password
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}
