'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { updateNotificationPreferences } from '@/app/actions/settings-actions';
import { toast } from 'sonner';

interface NotificationSectionProps {
    initialEmailNotifications: boolean;
    initialFrequency: 'instant' | 'daily' | 'weekly';
}

export function NotificationSection({
    initialEmailNotifications,
    initialFrequency
}: NotificationSectionProps) {
    const [emailNotifications, setEmailNotifications] = useState(initialEmailNotifications);
    const [frequency, setFrequency] = useState<'instant' | 'daily' | 'weekly'>(initialFrequency);

    const handleToggleEmail = async (checked: boolean) => {
        setEmailNotifications(checked);
        const result = await updateNotificationPreferences(checked, frequency);
        if (result.error) {
            toast.error(result.error);
            setEmailNotifications(!checked); // Revert on error
        } else {
            toast.success('Notification preferences updated');
        }
    };

    const handleFrequencyChange = async (value: 'instant' | 'daily' | 'weekly') => {
        setFrequency(value);
        const result = await updateNotificationPreferences(emailNotifications, value);
        if (result.error) {
            toast.error(result.error);
        } else {
            toast.success('Notification frequency updated');
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>Manage how you receive updates</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                        <Label htmlFor="email-notifications">Email Notifications</Label>
                        <p className="text-sm text-muted-foreground">
                            Receive email updates about resignations and interviews
                        </p>
                    </div>
                    <Switch
                        id="email-notifications"
                        checked={emailNotifications}
                        onCheckedChange={handleToggleEmail}
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="frequency">Notification Frequency</Label>
                    <Select value={frequency} onValueChange={handleFrequencyChange}>
                        <SelectTrigger id="frequency">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="instant">Instant (Real-time)</SelectItem>
                            <SelectItem value="daily">Daily Digest</SelectItem>
                            <SelectItem value="weekly">Weekly Summary</SelectItem>
                        </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                        How often you want to receive notification emails
                    </p>
                </div>
            </CardContent>
        </Card>
    );
}
