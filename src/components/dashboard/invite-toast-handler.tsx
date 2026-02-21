'use client';

import { useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';

const TOAST_MESSAGES: Record<string, { message: string; type: 'success' | 'info' }> = {
    already_member: {
        message: "You're already a member. Welcome back!",
        type: 'success',
    },
};

/**
 * Reads ?toast= from the URL on mount, fires the matching sonner toast,
 * then cleans the param from the URL so it doesn't persist on refresh.
 */
export function InviteToastHandler() {
    const searchParams = useSearchParams();
    const router = useRouter();

    useEffect(() => {
        const toastKey = searchParams.get('toast');
        if (!toastKey) return;

        const entry = TOAST_MESSAGES[toastKey];
        if (entry) {
            if (entry.type === 'success') {
                toast.success(entry.message);
            } else {
                toast.info(entry.message);
            }
        }

        // Strip the ?toast= param cleanly from the URL
        const url = new URL(window.location.href);
        url.searchParams.delete('toast');
        router.replace(url.pathname + (url.search || ''), { scroll: false });
    }, [searchParams, router]);

    return null;
}
