'use client'

import { Card, CardContent, CardHeader, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface UnhappyRow {
    name: string
    payRating: string
    workloadRating: string
    superiorName: string
    recommendationScore: number
}

interface UnhappyTableProps {
    data: UnhappyRow[]
    className?: string
}

function ratingBadge(rating: string) {
    const lowValues = ['Very low', 'Uncompetitive', 'None', 'Poor', 'Very heavy', 'Heavy'];
    const isLow = lowValues.includes(rating);

    return (
        <Badge
            variant="outline"
            className={cn(
                "text-[10px] font-medium border-none",
                isLow
                    ? "bg-rose-500/15 text-rose-400"
                    : "bg-amber-500/15 text-amber-400"
            )}
        >
            {rating}
        </Badge>
    );
}

export function UnhappyTable({ data, className }: UnhappyTableProps) {
    return (
        <Card className={cn("border border-white/5 bg-white/[0.02] shadow-sm rounded-3xl relative overflow-hidden", className)}>
            <CardHeader className="pb-2">
                <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    The &ldquo;Unhappy&rdquo; List
                </h3>
                <CardDescription className="text-[10px] text-muted-foreground uppercase font-medium">
                    Employees who rated Pay or Workload as Low / Very Low
                </CardDescription>
            </CardHeader>
            <CardContent>
                {data.length === 0 ? (
                    <div className="h-[200px] flex items-center justify-center text-muted-foreground text-sm">
                        No unhappy respondents found — lucky you.
                    </div>
                ) : (
                    <div className="max-h-[360px] overflow-y-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="border-b border-white/5 hover:bg-transparent">
                                    <TableHead className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Name</TableHead>
                                    <TableHead className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Pay Rating</TableHead>
                                    <TableHead className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Workload</TableHead>
                                    <TableHead className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Superior</TableHead>
                                    <TableHead className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium text-right">Recommend</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {data.map((row, i) => (
                                    <TableRow key={i} className="border-b border-white/5 hover:bg-white/[0.03]">
                                        <TableCell className="font-medium text-xs text-zinc-200">{row.name}</TableCell>
                                        <TableCell>{ratingBadge(row.payRating)}</TableCell>
                                        <TableCell>{ratingBadge(row.workloadRating)}</TableCell>
                                        <TableCell className="text-xs text-zinc-400">{row.superiorName}</TableCell>
                                        <TableCell className="text-right">
                                            <span className={cn(
                                                "text-xs font-bold",
                                                row.recommendationScore < 30 ? "text-rose-400" :
                                                    row.recommendationScore < 50 ? "text-amber-400" :
                                                        "text-zinc-400"
                                            )}>
                                                {row.recommendationScore >= 0 ? `${row.recommendationScore}/100` : 'N/A'}
                                            </span>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
