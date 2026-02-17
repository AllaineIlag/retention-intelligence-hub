"use client"

import { Database } from "@/lib/database.types"
import { Badge } from "../../ui/badge"
import { Separator } from "../../ui/separator"
import { format } from "date-fns"
import { Star } from "lucide-react"
import { Label } from "@/components/ui/label"

type Resignation = Database['public']['Tables']['resignations']['Row']
type Question = Database['public']['Tables']['questions']['Row']

interface StepReviewProps {
    resignation: Resignation
    responses: Record<string, { rating?: number, responseText?: string }>
    questions: Question[]
    employeeDetails: {
        employeeId: string
        name: string
        dateHired: string
        positionHired: string
        position: string
        department: string
        supervisor: string
    }
}

export function StepReview({ resignation, responses, questions, employeeDetails }: StepReviewProps) {
    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Section 1: Employee Details */}
            <div className="rounded-lg border border-border bg-card shadow-sm overflow-hidden">
                <div className="bg-muted px-4 py-3 border-b border-border">
                    <h3 className="font-semibold">Employee Information</h3>
                </div>

                <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                    <div>
                        <Label className="text-muted-foreground text-xs uppercase">Employee ID</Label>
                        <p className="font-medium">{employeeDetails.employeeId || "Not set"}</p>
                    </div>
                    <div>
                        <Label className="text-muted-foreground text-xs uppercase">Name</Label>
                        <p className="font-medium">{employeeDetails.name || "Not set"}</p>
                    </div>
                    <div>
                        <Label className="text-muted-foreground text-xs uppercase">Date Hired</Label>
                        <p className="font-medium">
                            {employeeDetails.dateHired ? format(new Date(employeeDetails.dateHired), "PPP") : "Not set"}
                        </p>
                    </div>
                    <div>
                        <Label className="text-muted-foreground text-xs uppercase">Position when Hired</Label>
                        <p className="font-medium">{employeeDetails.positionHired || "Not set"}</p>
                    </div>
                    <div>
                        <Label className="text-muted-foreground text-xs uppercase">Current Position</Label>
                        <p className="font-medium">{employeeDetails.position || "Not selected"}</p>
                    </div>
                    <div>
                        <Label className="text-muted-foreground text-xs uppercase">Department</Label>
                        <p className="font-medium">{employeeDetails.department || "Not selected"}</p>
                    </div>
                    <div>
                        <Label className="text-muted-foreground text-xs uppercase">Immediate Supervisor</Label>
                        <p className="font-medium">{employeeDetails.supervisor || "Not selected"}</p>
                    </div>
                    <div>
                        <Label className="text-muted-foreground text-xs uppercase">Last Day of Work</Label>
                        <p className="font-medium">
                            {resignation.exit_date ? format(new Date(resignation.exit_date), "PPP") : "Not selected"}
                        </p>
                    </div>
                </div>
            </div>

            {/* Section 2: Questionnaire Response */}
            <div className="rounded-lg border border-border bg-card shadow-sm overflow-hidden">
                <div className="bg-muted px-4 py-3 border-b border-border">
                    <h3 className="font-semibold">Exit Interview Responses</h3>
                </div>

                <div className="p-4 space-y-6">
                    {/* Reason */}
                    <div>
                        <Label className="text-xs font-medium text-muted-foreground uppercase">Primary Reason for Leaving</Label>
                        <div className="mt-1">
                            <Badge variant="secondary" className="text-base px-3 py-1">
                                {responses['reason_for_leaving']?.responseText || "Not specified"}
                            </Badge>
                        </div>
                    </div>

                    {/* Basic visual check for responses since we moved to hardcoded structure and didn't map every key to visual yet */}
                    {Object.keys(responses).length > 0 ? (
                        <div className="grid gap-2">
                            <Label className="text-xs font-medium text-muted-foreground uppercase">Feedback Recorded</Label>
                            <div className="bg-muted p-3 rounded text-sm text-muted-foreground italic">
                                Responses for {Object.keys(responses).length} items captured.
                            </div>
                        </div>
                    ) : (
                        <p className="text-sm text-muted-foreground italic">No questionnaire responses recorded.</p>
                    )}
                </div>
            </div>

            <div className="rounded-lg bg-primary/10 p-4 border border-primary/20 text-primary text-sm flex gap-3 items-start">
                <div className="shrink-0 mt-0.5">ℹ️</div>
                <div>
                    Please review your responses above. Once you click &quot;Submit&quot;, your exit interview will be finalized and sent to HR for review. You will not be able to follow up or edit these responses after submission.
                </div>
            </div>
        </div>
    )
}
