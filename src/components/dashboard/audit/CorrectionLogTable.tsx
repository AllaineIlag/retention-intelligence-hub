'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { CorrectionLog } from '@/app/actions/audit-actions';
import { format } from 'date-fns';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';

interface CorrectionLogTableProps {
    corrections: CorrectionLog[];
}

export function CorrectionLogTable({ corrections }: CorrectionLogTableProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Interview Corrections Log</CardTitle>
            </CardHeader>
            <CardContent>
                <ScrollArea className="h-[600px]">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Date</TableHead>
                                <TableHead>Employee</TableHead>
                                <TableHead>Question</TableHead>
                                <TableHead>Original</TableHead>
                                <TableHead>Corrected</TableHead>
                                <TableHead>Note</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {corrections.map((correction) => (
                                <TableRow key={correction.id}>
                                    <TableCell className="font-mono text-xs">
                                        {format(new Date(correction.created_at), 'MMM dd, yyyy')}
                                    </TableCell>
                                    <TableCell className="font-medium">
                                        {correction.employee_name}
                                    </TableCell>
                                    <TableCell className="max-w-[200px] truncate">
                                        {correction.question_text}
                                    </TableCell>
                                    <TableCell className="max-w-[150px]">
                                        <div className="truncate text-sm text-muted-foreground">
                                            {correction.original_answer}
                                        </div>
                                    </TableCell>
                                    <TableCell className="max-w-[150px]">
                                        <div className="truncate text-sm font-medium">
                                            {correction.corrected_answer}
                                        </div>
                                    </TableCell>
                                    <TableCell className="max-w-[150px]">
                                        {correction.interviewer_note ? (
                                            <div className="truncate text-xs italic">
                                                {correction.interviewer_note}
                                            </div>
                                        ) : (
                                            <span className="text-muted-foreground">-</span>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                            {corrections.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-24 text-center">
                                        No corrections recorded yet.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </ScrollArea>
            </CardContent>
        </Card>
    );
}
