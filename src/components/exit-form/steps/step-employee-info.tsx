import { Label } from "../../ui/label"
import { Input } from "../../ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../ui/select"
import { Database } from "@/lib/database.types"
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"

type Resignation = Database['public']['Tables']['resignations']['Row']

import { EmployeeDetails } from "@/app/exit-form/actions"

interface StepEmployeeInfoProps {
    resignation: Resignation
    employeeDetails: EmployeeDetails
}

export function StepEmployeeInfo({
    resignation,
    employeeDetails,
}: StepEmployeeInfoProps) {
    // Helper to render read-only fields consistently
    const ReadOnlyField = ({ label, value }: { label: string, value: string | undefined }) => (
        <div className="space-y-2">
            <Label className="text-muted-foreground">{label}</Label>
            <Input
                readOnly
                value={value || ''}
                className="bg-muted cursor-not-allowed text-foreground"
            />
        </div>
    );

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ReadOnlyField
                    label="Full Name"
                    value={employeeDetails.employee_name}
                />
                <ReadOnlyField
                    label="Employee Number"
                    value={employeeDetails.employee_number}
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ReadOnlyField
                    label="Date of Hire"
                    value={employeeDetails.date_hired ? format(new Date(employeeDetails.date_hired), "PPP") : 'Not Specified'}
                />
                <ReadOnlyField
                    label="Date of Resignation"
                    value={resignation.exit_date || employeeDetails.date_of_resignation ? format(new Date(resignation.exit_date || employeeDetails.date_of_resignation), "PPP") : 'Not Specified'}
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ReadOnlyField
                    label="Position"
                    value={employeeDetails.position}
                />
                <ReadOnlyField
                    label="Department"
                    value={employeeDetails.department}
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ReadOnlyField
                    label="Business Unit"
                    value={employeeDetails.business_unit}
                />
                <ReadOnlyField
                    label="Department/Immediate Supervisor"
                    value={employeeDetails.intermediate_supervisor}
                />
            </div>
        </div>
    )
}
