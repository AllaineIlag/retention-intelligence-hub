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
            <div className="flex h-full items-center justify-center text-gray-500">
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
                        className="relative rounded-lg border border-white/5 bg-white/[0.02] p-4 transition-all hover:bg-white/[0.04]"
                    >
                        {/* Header: User Info */}
                        <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                                <Avatar className="h-8 w-8 border border-white/10">
                                    <AvatarImage src="" /> {/* Using fallback for now */}
                                    <AvatarFallback className="bg-[#27272a] text-xs text-gray-400">
                                        {getInitials(item.employeeName)}
                                    </AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="text-sm font-medium text-gray-200">
                                        {item.employeeName}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        {item.role} • {item.department}
                                    </p>
                                </div>
                            </div>
                            <span className="text-xs text-gray-600">{item.date}</span>
                        </div>

                        {/* Content: Reason Tag + Comment */}
                        <div className="mt-3 pl-11">
                            <div className="mb-2">
                                <Badge variant="outline" className="text-[10px] text-gray-400 border-white/10 px-2 py-0 h-5">
                                    {item.reasonCategory}
                                </Badge>
                            </div>
                            <div className="relative">
                                <Quote className="absolute -left-6 -top-1 h-4 w-4 text-white/10" />
                                <p className="text-sm leading-relaxed text-gray-300">
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
