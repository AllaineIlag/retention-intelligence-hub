import { redirect } from 'next/navigation';

export default function InterviewsRootRedirect() {
    redirect('/dashboard/interview/schedule');
}
