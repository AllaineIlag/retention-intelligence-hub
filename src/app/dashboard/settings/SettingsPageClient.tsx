'use client';

import { ProfileSection } from '@/components/dashboard/settings/ProfileSection';
import { NotificationSection } from '@/components/dashboard/settings/NotificationSection';
import { ResourcesSection } from '@/components/dashboard/settings/ResourcesSection';
import { ProfileData } from '@/app/actions/settings-actions';

interface SettingsPageClientProps {
    profile: ProfileData;
}

export function SettingsPageClient({ profile }: SettingsPageClientProps) {
    return (
        <div className="flex-1 space-y-4 p-8 pt-6">

            <div className="grid gap-4 md:grid-cols-2">
                <ProfileSection
                    initialName={profile.full_name || ''}
                    email={profile.email}
                />
                <NotificationSection
                    initialEmailNotifications={profile.email_notifications ?? true}
                    initialFrequency={(profile.notification_frequency as 'instant' | 'daily' | 'weekly') || 'instant'}
                />

                <ResourcesSection />
            </div>
        </div>
    );
}
