"use client";

import Link from "next/link";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Eye } from "lucide-react";

export type Resignation = {
  id: string;
  status: "pending" | "approved" | "scheduled" | "completed" | "declined";
  last_working_day: string;
  employee: {
    full_name: string;
    role: string;
    email: string;
  };
};

interface EmployeesTableProps {
  resignations: Resignation[];
}

export function EmployeesTable({ resignations }: EmployeesTableProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Active Resignations</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Employee</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Last Working Day</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {resignations.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-muted-foreground py-8 text-center"
                >
                  No active resignations found.
                </TableCell>
              </TableRow>
            ) : (
              resignations.map((res) => (
                <TableRow key={res.id}>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium">
                        {res.employee.full_name}
                      </span>
                      <span className="text-muted-foreground text-xs">
                        {res.employee.email}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>{res.employee.role}</TableCell>
                  <TableCell>
                    {format(new Date(res.last_working_day), "MMM d, yyyy")}
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusVariant(res.status)}>
                      {res.status.toUpperCase()}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button asChild variant="ghost" size="sm">
                      <Link href={`/dashboard/case/${res.id}`}>
                        <Eye className="mr-2 h-4 w-4" />
                        Details
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

function getStatusVariant(
  status: string,
): "default" | "secondary" | "destructive" | "outline" {
  switch (status) {
    case "pending":
      return "secondary";
    case "approved":
    case "scheduled":
      return "default"; // blue-ish usually
    case "completed":
      return "outline";
    case "declined":
      return "destructive";
    default:
      return "outline";
  }
}
