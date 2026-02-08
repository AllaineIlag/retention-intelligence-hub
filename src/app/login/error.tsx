'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error('Login Page Error:', error);
    }, [error]);

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-[#0a0a0a] text-white p-4">
            <div className="w-full max-w-md rounded-2xl border border-red-500/20 bg-red-500/10 p-6 text-center">
                <div className="mb-4 flex justify-center">
                    <div className="rounded-full bg-red-500/20 p-3">
                        <AlertCircle className="h-8 w-8 text-red-500" />
                    </div>
                </div>
                <h2 className="mb-2 text-xl font-bold text-red-500">Something went wrong!</h2>
                <p className="mb-6 text-sm text-zinc-400">
                    {error.message || 'A client-side error occurred.'}
                </p>
                <code className="mb-6 block rounded bg-black/50 p-2 text-xs text-red-300 font-mono text-left overflow-auto max-h-32">
                    {error.stack}
                </code>
                <Button
                    onClick={() => reset()}
                    className="bg-red-600 hover:bg-red-700 text-white"
                >
                    Try again
                </Button>
            </div>
        </div>
    );
}
