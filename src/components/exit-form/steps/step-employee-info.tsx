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

interface ReferenceData {
    positions: string[]
    departments: string[]
    supervisors: string[]
}

interface EmployeeDetails {
    employeeId: string
    name: string
    dateHired: string
    positionHired: string
}

interface StepEmployeeInfoProps {
    resignation: Resignation
    referenceData: ReferenceData
    onChange: (updates: Partial<Resignation>) => void
    employeeDetails: EmployeeDetails
    onDetailsChange: (update: (prev: EmployeeDetails) => EmployeeDetails) => void
}

export function StepEmployeeInfo({
    resignation,
    referenceData,
    onChange,
    employeeDetails,
    onDetailsChange
}: StepEmployeeInfoProps) {
    const handleDetailsChange = (field: keyof EmployeeDetails, value: string) => {
        onDetailsChange((prev) => ({ ...prev, [field]: value }))
    }

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Employee Number - New */}
                <div className="space-y-2">
                    <Label htmlFor="employee_id_display">Employee Number <span className="text-destructive">*</span></Label>
                    <Input
                        id="employee_id_display"
                        placeholder="E.g. EMP-001"
                    // Bind to local/transient state if available, or just visual for now as per plan
                    // "For this UI implementation, they will be handled as local state only"
                    // I will assume the parent passes a 'formData' object that extends Resignation
                    />
                </div>

                {/* Employee Name - New */}
                <div className="space-y-2">
                    <Label htmlFor="employee_name">Employee Name <span className="text-destructive">*</span></Label>
                    <Input
                        id="employee_name"
                        placeholder="Full Name"
                        value={employeeDetails.name}
                        onChange={(e) => handleDetailsChange('name', e.target.value)}
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Date Hired - New */}
                <div className="space-y-2">
                    <Label>Date Hired <span className="text-destructive">*</span></Label>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                variant={"outline"}
                                className={cn(
                                    "w-full justify-start text-left font-normal bg-background border-input",
                                    !employeeDetails.dateHired && "text-muted-foreground"
                                )}
                            >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {employeeDetails.dateHired ? format(new Date(employeeDetails.dateHired), "PPP") : <span>Pick a date</span>}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                                mode="single"
                                selected={employeeDetails.dateHired ? new Date(employeeDetails.dateHired) : undefined}
                                onSelect={(date) => date && handleDetailsChange('dateHired', date.toISOString())}
                                initialFocus
                            />
                        </PopoverContent>
                    </Popover>
                </div>

                {/* Position When Hired - New */}
                <div className="space-y-2">
                    <Label htmlFor="position_hired">Position when Hired <span className="text-destructive">*</span></Label>
                    <Select
                        value={employeeDetails.positionHired}
                        onValueChange={(val) => handleDetailsChange('positionHired', val)}
                    >
                        <SelectTrigger className="w-full bg-background border-input">
                            <SelectValue placeholder="Select position" />
                        </SelectTrigger>
                        <SelectContent>
                            {referenceData.positions.map(pos => (
                                <SelectItem key={pos} value={pos}>{pos}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Current Position (Existing) */}
                <div className="space-y-2">
                    <Label htmlFor="position">Current Position <span className="text-destructive">*</span></Label>
                    <Select defaultValue="">
                        <SelectTrigger className="w-full bg-background border-input">
                            <SelectValue placeholder="Select your position" />
                        </SelectTrigger>
                        <SelectContent>
                            {referenceData.positions.map(pos => (
                                <SelectItem key={pos} value={pos}>{pos}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Department (Existing) */}
                <div className="space-y-2">
                    <Label htmlFor="department">Department <span className="text-destructive">*</span></Label>
                    <Select defaultValue="">
                        <SelectTrigger className="w-full bg-background border-input">
                            <SelectValue placeholder="Select your department" />
                        </SelectTrigger>
                        <SelectContent>
                            {referenceData.departments.map(dept => (
                                <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Supervisor (Existing) */}
                <div className="space-y-2">
                    <Label htmlFor="supervisor">Immediate Superior <span className="text-destructive">*</span></Label>
                    <Select defaultValue="">
                        <SelectTrigger className="w-full bg-background border-input">
                            <SelectValue placeholder="Select your supervisor" />
                        </SelectTrigger>
                        <SelectContent>
                            {referenceData.supervisors.map(sup => (
                                <SelectItem key={sup} value={sup}>{sup}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Exit Date - Required (Existing) */}
                <div className="space-y-2">
                    <Label htmlFor="exit_date">Date of Resignation <span className="text-destructive">*</span></Label>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                variant={"outline"}
                                className={cn(
                                    "w-full justify-start text-left font-normal bg-background border-input",
                                    !resignation.exit_date && "text-muted-foreground"
                                )}
                            >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {resignation.exit_date ? format(new Date(resignation.exit_date), "PPP") : <span>Pick a date</span>}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                                mode="single"
                                selected={resignation.exit_date ? new Date(resignation.exit_date) : undefined}
                                onSelect={(date) => date && onChange({ exit_date: format(date, 'yyyy-MM-dd') })}
                                initialFocus
                            />
                        </PopoverContent>
                    </Popover>
                </div>
            </div>
        </div>
    )
}
