'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
    SAMPLE_POSITIONS,
    SAMPLE_DEPARTMENTS,
    SAMPLE_SUPERVISORS,
    type ExitFormData,
} from '@/app/exit-form/actions';

interface StepProps {
    formData: ExitFormData;
    updateFormData: (updates: Partial<ExitFormData>) => void;
    errors: Record<string, string>;
}

export function EmployeeInfoStep({ formData, updateFormData, errors }: StepProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Employee Information</CardTitle>
                <CardDescription>Please fill in your employment details.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="grid gap-6 sm:grid-cols-2">
                    {/* Employee Number */}
                    <div className="space-y-2">
                        <Label htmlFor="employee_number">
                            Employee Number <span className="text-destructive">*</span>
                        </Label>
                        <Input
                            id="employee_number"
                            value={formData.employee_number}
                            onChange={(e) => updateFormData({ employee_number: e.target.value })}
                            placeholder="e.g., EMP-001"
                            className={errors.employee_number ? 'border-destructive' : ''}
                        />
                        {errors.employee_number && (
                            <p className="text-sm text-destructive">{errors.employee_number}</p>
                        )}
                    </div>

                    {/* Employee Name */}
                    <div className="space-y-2">
                        <Label htmlFor="employee_name">
                            Employee Name <span className="text-destructive">*</span>
                        </Label>
                        <Input
                            id="employee_name"
                            value={formData.employee_name}
                            onChange={(e) => updateFormData({ employee_name: e.target.value })}
                            placeholder="Full name"
                            className={errors.employee_name ? 'border-destructive' : ''}
                        />
                        {errors.employee_name && (
                            <p className="text-sm text-destructive">{errors.employee_name}</p>
                        )}
                    </div>

                    {/* Date Hired */}
                    <div className="space-y-2">
                        <Label htmlFor="date_hired">
                            Date Hired <span className="text-destructive">*</span>
                        </Label>
                        <Input
                            id="date_hired"
                            type="date"
                            value={formData.date_hired}
                            onChange={(e) => updateFormData({ date_hired: e.target.value })}
                            className={errors.date_hired ? 'border-destructive' : ''}
                        />
                        {errors.date_hired && <p className="text-sm text-destructive">{errors.date_hired}</p>}
                    </div>

                    {/* Date of Resignation */}
                    <div className="space-y-2">
                        <Label htmlFor="date_of_resignation">
                            Date of Resignation <span className="text-destructive">*</span>
                        </Label>
                        <Input
                            id="date_of_resignation"
                            type="date"
                            value={formData.date_of_resignation}
                            onChange={(e) => updateFormData({ date_of_resignation: e.target.value })}
                            className={errors.date_of_resignation ? 'border-destructive' : ''}
                        />
                        {errors.date_of_resignation && (
                            <p className="text-sm text-destructive">{errors.date_of_resignation}</p>
                        )}
                    </div>

                    {/* Position When Hired */}
                    <div className="space-y-2">
                        <Label>
                            Position When Hired <span className="text-destructive">*</span>
                        </Label>
                        <Select
                            value={formData.position_when_hired}
                            onValueChange={(value) => updateFormData({ position_when_hired: value })}
                        >
                            <SelectTrigger className={errors.position_when_hired ? 'border-destructive' : ''}>
                                <SelectValue placeholder="Select position" />
                            </SelectTrigger>
                            <SelectContent>
                                {SAMPLE_POSITIONS.map((pos) => (
                                    <SelectItem key={pos} value={pos}>
                                        {pos}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {errors.position_when_hired && (
                            <p className="text-sm text-destructive">{errors.position_when_hired}</p>
                        )}
                    </div>

                    {/* Current Position */}
                    <div className="space-y-2">
                        <Label>
                            Current Position <span className="text-destructive">*</span>
                        </Label>
                        <Select
                            value={formData.current_position}
                            onValueChange={(value) => updateFormData({ current_position: value })}
                        >
                            <SelectTrigger className={errors.current_position ? 'border-destructive' : ''}>
                                <SelectValue placeholder="Select position" />
                            </SelectTrigger>
                            <SelectContent>
                                {SAMPLE_POSITIONS.map((pos) => (
                                    <SelectItem key={pos} value={pos}>
                                        {pos}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {errors.current_position && (
                            <p className="text-sm text-destructive">{errors.current_position}</p>
                        )}
                    </div>

                    {/* Department */}
                    <div className="space-y-2">
                        <Label>
                            Department <span className="text-destructive">*</span>
                        </Label>
                        <Select
                            value={formData.department}
                            onValueChange={(value) => updateFormData({ department: value })}
                        >
                            <SelectTrigger className={errors.department ? 'border-destructive' : ''}>
                                <SelectValue placeholder="Select department" />
                            </SelectTrigger>
                            <SelectContent>
                                {SAMPLE_DEPARTMENTS.map((dept) => (
                                    <SelectItem key={dept} value={dept}>
                                        {dept}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {errors.department && <p className="text-sm text-destructive">{errors.department}</p>}
                    </div>

                    {/* Supervisor */}
                    <div className="space-y-2">
                        <Label>
                            Immediate Superior <span className="text-destructive">*</span>
                        </Label>
                        <Select
                            value={formData.supervisor}
                            onValueChange={(value) => updateFormData({ supervisor: value })}
                        >
                            <SelectTrigger className={errors.supervisor ? 'border-destructive' : ''}>
                                <SelectValue placeholder="Select supervisor" />
                            </SelectTrigger>
                            <SelectContent>
                                {SAMPLE_SUPERVISORS.map((sup) => (
                                    <SelectItem key={sup} value={sup}>
                                        {sup}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {errors.supervisor && <p className="text-sm text-destructive">{errors.supervisor}</p>}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
