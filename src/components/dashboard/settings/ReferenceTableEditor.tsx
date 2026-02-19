'use client';

import { useState, useTransition } from 'react';
import { Plus, Check, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import { ReferenceItem } from '@/app/actions/settings-actions';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

interface ReferenceTableEditorProps {
    title: string;
    description: string;
    items: ReferenceItem[];
    onAdd: (name: string) => Promise<{ success?: boolean; error?: string; data?: any }>;
    onToggle: (id: string, isActive: boolean) => Promise<{ success?: boolean; error?: string }>;
}

export function ReferenceTableEditor({
    title,
    description,
    items,
    onAdd,
    onToggle
}: ReferenceTableEditorProps) {
    const [newItemName, setNewItemName] = useState('');
    const [isPending, startTransition] = useTransition();

    const handleAdd = () => {
        if (!newItemName.trim()) return;

        startTransition(async () => {
            const res = await onAdd(newItemName.trim());
            if (res.error) {
                toast.error(res.error);
            } else {
                toast.success(`${title.slice(0, -1)} added successfully`);
                setNewItemName('');
            }
        });
    };

    const handleToggle = (id: string, currentState: boolean) => {
        // Optimistic toggle could be done here, but we'll rely on server revalidation for safety
        startTransition(async () => {
            const res = await onToggle(id, !currentState);
            if (res.error) {
                toast.error(res.error);
            }
        });
    };

    return (
        <Card className="border-white/5 bg-white/[0.02] backdrop-blur-sm">
            <CardHeader>
                <CardTitle className="text-lg font-medium text-zinc-100">{title}</CardTitle>
                <CardDescription className="text-zinc-500">{description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex gap-2">
                    <Input
                        placeholder={`Add new ${title.toLowerCase().slice(0, -1)}...`}
                        value={newItemName}
                        onChange={(e) => setNewItemName(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                        className="bg-white/5 border-white/10"
                    />
                    <Button
                        onClick={handleAdd}
                        disabled={isPending || !newItemName.trim()}
                        className="bg-indigo-500 hover:bg-indigo-600 text-white"
                    >
                        {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                    </Button>
                </div>

                <ScrollArea className="h-[300px] pr-4">
                    <div className="space-y-2">
                        {items.length === 0 ? (
                            <p className="text-center text-sm text-zinc-500 py-8">No items found.</p>
                        ) : (
                            items.map((item) => (
                                <div
                                    key={item.id}
                                    className={cn(
                                        "flex items-center justify-between p-3 rounded-lg border transition-all",
                                        item.is_active
                                            ? "bg-white/[0.02] border-white/5"
                                            : "bg-red-500/[0.02] border-red-500/10 opacity-60"
                                    )}
                                >
                                    <div className="flex items-center gap-3">
                                        <Badge variant="outline" className={cn(
                                            "w-2 h-2 rounded-full p-0 border-none",
                                            item.is_active ? "bg-emerald-500" : "bg-red-500"
                                        )} />
                                        <span className={cn("text-sm", item.is_active ? "text-zinc-200" : "text-zinc-500 line-through")}>
                                            {item.name}
                                        </span>
                                    </div>
                                    <Switch
                                        checked={item.is_active}
                                        onCheckedChange={() => handleToggle(item.id, item.is_active)}
                                        disabled={isPending}
                                    />
                                </div>
                            ))
                        )}
                    </div>
                </ScrollArea>
            </CardContent>
        </Card>
    );
}
