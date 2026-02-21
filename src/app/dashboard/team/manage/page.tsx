import { redirect } from 'next/navigation';

// /manage has been consolidated into /recruitment (Active Team tab)
export default function ManagePage() {
    redirect('/dashboard/team/recruitment');
}
