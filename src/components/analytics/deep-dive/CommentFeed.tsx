'use client';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Comment } from '@/app/dashboard/analytics/deep-dive/actions-trend';

export function CommentFeed({ comments, title }: { comments: Comment[], title: string }) {
    return (
        <Card className="col-span-2">
            <CardHeader>
                <CardTitle>{title}</CardTitle>
            </CardHeader>
            <CardContent>
                {comments.length === 0 ? (
                    <div className="text-center text-muted-foreground py-8">No comments available.</div>
                ) : (
                    <div className="space-y-4">
                        {comments.map((c) => (
                            <div key={c.id} className="border-b p-2">
                                <p>{c.text}</p>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
