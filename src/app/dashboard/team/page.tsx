import InviteUserCard from '@/components/dashboard/team/InviteUserCard';
import TeamMembersTable from '@/components/dashboard/team/TeamMembersTable';
import { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
    title: 'Team Management | Retention Intelligence Hub',
    description: 'Manage your team of interviewers.',
};

export default async function TeamPage() {
    // Redirection to the primary sub-sector: Recruitment
    redirect('/dashboard/team/invite');
}

