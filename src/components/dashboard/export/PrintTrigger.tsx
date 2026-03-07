'use client';

import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Printer, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function PrintTrigger() {
    const router = useRouter();

    // Automatically trigger print dialog on mount, but wait a bit for charts to render
    useEffect(() => {
        const timer = setTimeout(() => {
            // window.print();
        }, 1500);
        return () => clearTimeout(timer);
    }, []);

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="flex items-center justify-between gap-4 mb-8 print:hidden bg-muted/30 p-4 rounded-2xl border border-border/50 sticky top-4 z-50 glass">
            <Button
                variant="ghost"
                size="sm"
                onClick={() => router.back()}
                className="gap-2 text-muted-foreground hover:text-foreground"
            >
                <ArrowLeft className="h-4 w-4" />
                Back to Dashboard
            </Button>

            <div className="flex items-center gap-2">
                <p className="text-xs text-muted-foreground mr-2 font-medium">Ready to export?</p>
                <Button
                    onClick={handlePrint}
                    className="bg-brand-primary hover:bg-brand-primary/90 text-white shadow-lg shadow-brand-primary/20 gap-2 px-6"
                >
                    <Printer className="h-4 w-4" />
                    Print Report / Save PDF
                </Button>
            </div>
        </div>
    );
}
