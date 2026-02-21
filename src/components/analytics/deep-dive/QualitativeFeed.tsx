'use client';

import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Quote } from "lucide-react"

export interface QualitativeComment {
    id: string;
    employeeName: string;
    role: string;
    department: string;
    reasonCategory: string;
    comment: string;
    date: string;
}

interface QualitativeFeedProps {
    comments: QualitativeComment[];
}

function getInitials(name: string) {
    return name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
}

export function QualitativeFeed({ comments }: QualitativeFeedProps) {
    if (!comments || comments.length === 0) {
        return (
            <div className="flex h-full items-center justify-center text-muted-foreground">
                No comments available.
            </div>
        );
    }

    return (
        <ScrollArea className="h-[400px] w-full pr-4">
            <div className="space-y-4">
                {comments.map((item) => (
                    <div
                        key={item.id}
                        className="relative rounded-xl border border-border bg-card/50 p-4 transition-all hover:bg-accent/50"
                    >
                        {/* Header: User Info */}
                        <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                                <Avatar className="h-8 w-8 border border-border">
                                    <AvatarImage src="" /> {/* Using fallback for now */}
                                    <AvatarFallback className="bg-muted text-xs text-muted-foreground">
                                        {getInitials(item.employeeName)}
                                    </AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="text-sm font-medium text-foreground">
                                        {item.employeeName}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        {item.role} • {item.department}
                                    </p>
                                </div>
                            </div>
                            <span className="text-xs text-muted-foreground/60">{item.date}</span>
                        </div>

                        {/* Content: Reason Tag + Comment */}
                        <div className="mt-3 pl-11">
                            <div className="mb-2">
                                <Badge variant="outline" className="text-[10px] text-muted-foreground border-border px-2 py-0 h-5">
                                    {item.reasonCategory}
                                </Badge>
                            </div>
                            <div className="relative">
                                <Quote className="absolute -left-6 -top-1 h-4 w-4 text-primary/10" />
                                <p className="text-sm leading-relaxed text-foreground/80">
                                    {item.comment}
                                </p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </ScrollArea>
    );
}
