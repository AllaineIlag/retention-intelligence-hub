'use client'

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface FlightRiskTableProps {
    data: {
        department: string
        hires: number
        dropouts: number
        rate: number
    }[]
    className?: string
}

export function FlightRiskTable({ data, className }: FlightRiskTableProps) {
    return (
        <Card className={cn("border border-white/5 bg-white/[0.02] shadow-sm rounded-3xl relative overflow-hidden", className)}>
            <CardHeader className="pb-2">
                <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Flight Risk List
                </h3>
                <CardDescription className="text-[10px] text-muted-foreground uppercase font-medium">
                    Departments with highest new hire dropout rate
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow className="border-b border-white/5 hover:bg-transparent">
                            <TableHead className="text-xs text-muted-foreground uppercase tracking-wider">Department</TableHead>
                            <TableHead className="text-right text-xs text-muted-foreground uppercase tracking-wider">Hires</TableHead>
                            <TableHead className="text-right text-xs text-muted-foreground uppercase tracking-wider">Dropouts</TableHead>
                            <TableHead className="text-right text-xs text-muted-foreground uppercase tracking-wider">Rate</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {data.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                                    No data available
                                </TableCell>
                            </TableRow>
                        )}
                        {data.map((row) => (
                            <TableRow key={row.department} className="border-b border-white/5 hover:bg-white/[0.02]">
                                <TableCell className="font-medium text-foreground text-sm">{row.department}</TableCell>
                                <TableCell className="text-right text-muted-foreground text-sm">{row.hires}</TableCell>
                                <TableCell className="text-right text-muted-foreground text-sm">{row.dropouts}</TableCell>
                                <TableCell className="text-right">
                                    <Badge
                                        variant="outline"
                                        className={cn(
                                            "text-xs",
                                            row.rate > 20
                                                ? 'text-red-400 border-red-400/20 bg-red-400/10'
                                                : row.rate > 10
                                                    ? 'text-yellow-400 border-yellow-400/20 bg-yellow-400/10'
                                                    : 'text-green-400 border-green-400/20 bg-green-400/10'
                                        )}
                                    >
                                        {row.rate}%
                                    </Badge>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    )
}
