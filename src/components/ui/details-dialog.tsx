'use client';

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ReactNode } from 'react';

interface DetailsDialogProps {
    trigger: ReactNode;
    title: string;
    description?: string;
    children: ReactNode;
    className?: string;
}

export function DetailsDialog({ trigger, title, description, children, className }: DetailsDialogProps) {
    return (
        <Dialog>
            <DialogTrigger asChild>
                {trigger}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] h-[80vh] flex flex-col p-0 gap-0 bg-[#09090b] border-white/10 text-white">
                <DialogHeader className="p-6 border-b border-white/5 bg-white/[0.02]">
                    <DialogTitle className="text-xl font-bold tracking-tight">{title}</DialogTitle>
                    {description && (
                        <DialogDescription className="text-muted-foreground">
                            {description}
                        </DialogDescription>
                    )}
                </DialogHeader>
                <ScrollArea className="flex-1 p-6">
                    {children}
                </ScrollArea>
            </DialogContent>
        </Dialog>
    );
}
