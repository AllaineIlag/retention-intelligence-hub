import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import InterviewClient from './interview-client';

interface InterviewPageProps {
  params: Promise<{ id: string }>;
}

export default async function InterviewPage({ params }: InterviewPageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Check role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!profile || !['interviewer', 'lead'].includes(profile.role)) {
    redirect('/dashboard');
  }

  return <InterviewClient resignationId={id} />;
}
