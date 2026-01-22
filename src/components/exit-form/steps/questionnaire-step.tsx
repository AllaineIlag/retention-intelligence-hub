'use client';

import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
    REASONS_FOR_LEAVING,
    REASONS_MORE_DESIRABLE,
    CAREER_GROWTH_OPTIONS,
    PAY_RATE_OPTIONS,
    BENEFITS_OPTIONS,
    WORKLOAD_OPTIONS,
    COUNTRIES,
    type ExitFormData,
} from '@/app/exit-form/actions';

interface StepProps {
    formData: ExitFormData;
    updateFormData: (updates: Partial<ExitFormData>) => void;
    errors: Record<string, string>;
}

export function QuestionnaireStep({ formData, updateFormData, errors }: StepProps) {
    const handleReasonToggle = (value: string) => {
        const current = formData.reasons_for_leaving || [];
        const updated = current.includes(value)
            ? current.filter((r) => r !== value)
            : [...current, value];
        updateFormData({ reasons_for_leaving: updated });
    };

    const handleDesirableToggle = (value: string) => {
        const current = formData.reason_more_desirable || [];
        const updated = current.includes(value)
            ? current.filter((r) => r !== value)
            : [...current, value];
        updateFormData({ reason_more_desirable: updated });
    };

    // Conditional visibility
    const showCountryField = formData.reasons_for_leaving?.includes('another_job_abroad');
    const showDesirableField = formData.reasons_for_leaving?.some((r) =>
        ['another_job_local', 'another_job_abroad', 'business'].includes(r)
    );
    const showOtherDetail = formData.reasons_for_leaving?.includes('other');

    return (
        <div className="space-y-6">
            {/* Q1: Reasons for Leaving */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">
                        What is/are your reason for leaving? <span className="text-destructive">*</span>
                    </CardTitle>
                    <CardDescription>Select all that apply</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        {REASONS_FOR_LEAVING.map((reason) => (
                            <div key={reason.value} className="flex items-center space-x-2">
                                <Checkbox
                                    id={reason.value}
                                    checked={formData.reasons_for_leaving?.includes(reason.value)}
                                    onCheckedChange={() => handleReasonToggle(reason.value)}
                                />
                                <Label htmlFor={reason.value} className="text-sm cursor-pointer">
                                    {reason.label}
                                </Label>
                            </div>
                        ))}
                    </div>
                    {errors.reasons_for_leaving && (
                        <p className="text-sm text-destructive mt-2">{errors.reasons_for_leaving}</p>
                    )}
                </CardContent>
            </Card>

            {/* Q1a: Destination Country (conditional) */}
            {showCountryField && (
                <Card className="border-indigo-500/30 bg-indigo-500/5">
                    <CardHeader>
                        <CardTitle className="text-lg">
                            Which country? <span className="text-destructive">*</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Select
                            value={formData.destination_country}
                            onValueChange={(value) => updateFormData({ destination_country: value })}
                        >
                            <SelectTrigger className={errors.destination_country ? 'border-destructive' : ''}>
                                <SelectValue placeholder="Select country" />
                            </SelectTrigger>
                            <SelectContent>
                                {COUNTRIES.map((country) => (
                                    <SelectItem key={country} value={country}>
                                        {country}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {errors.destination_country && (
                            <p className="text-sm text-destructive mt-2">{errors.destination_country}</p>
                        )}
                    </CardContent>
                </Card>
            )}

            {/* Q1b: Why More Desirable (conditional) */}
            {showDesirableField && (
                <Card className="border-indigo-500/30 bg-indigo-500/5">
                    <CardHeader>
                        <CardTitle className="text-lg">
                            Why do you consider it more desirable? <span className="text-destructive">*</span>
                        </CardTitle>
                        <CardDescription>Select all that apply</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-3 sm:grid-cols-2">
                            {REASONS_MORE_DESIRABLE.map((reason) => (
                                <div key={reason.value} className="flex items-center space-x-2">
                                    <Checkbox
                                        id={`desirable-${reason.value}`}
                                        checked={formData.reason_more_desirable?.includes(reason.value)}
                                        onCheckedChange={() => handleDesirableToggle(reason.value)}
                                    />
                                    <Label htmlFor={`desirable-${reason.value}`} className="text-sm cursor-pointer">
                                        {reason.label}
                                    </Label>
                                </div>
                            ))}
                        </div>
                        {errors.reason_more_desirable && (
                            <p className="text-sm text-destructive mt-2">{errors.reason_more_desirable}</p>
                        )}
                    </CardContent>
                </Card>
            )}

            {/* Q1c: Other Detail (conditional) */}
            {showOtherDetail && (
                <Card className="border-indigo-500/30 bg-indigo-500/5">
                    <CardHeader>
                        <CardTitle className="text-lg">
                            Please specify <span className="text-destructive">*</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Textarea
                            value={formData.other_reason_detail || ''}
                            onChange={(e) => updateFormData({ other_reason_detail: e.target.value })}
                            placeholder="Please describe your reason..."
                            className={errors.other_reason_detail ? 'border-destructive' : ''}
                        />
                        {errors.other_reason_detail && (
                            <p className="text-sm text-destructive mt-2">{errors.other_reason_detail}</p>
                        )}
                    </CardContent>
                </Card>
            )}

            {/* Q2: Career Growth */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">
                        How did you feel about the opportunity for career growth?{' '}
                        <span className="text-destructive">*</span>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <RadioGroup
                        value={formData.career_growth_rating}
                        onValueChange={(value) => updateFormData({ career_growth_rating: value })}
                    >
                        {CAREER_GROWTH_OPTIONS.map((option) => (
                            <div key={option.value} className="flex items-center space-x-2">
                                <RadioGroupItem value={option.value} id={`growth-${option.value}`} />
                                <Label htmlFor={`growth-${option.value}`} className="cursor-pointer">
                                    {option.label}
                                </Label>
                            </div>
                        ))}
                    </RadioGroup>
                    {errors.career_growth_rating && (
                        <p className="text-sm text-destructive mt-2">{errors.career_growth_rating}</p>
                    )}
                </CardContent>
            </Card>

            {/* Q3: Pay Rate */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">
                        How did you feel about the pay rate? <span className="text-destructive">*</span>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <RadioGroup
                        value={formData.pay_rate_rating}
                        onValueChange={(value) => updateFormData({ pay_rate_rating: value })}
                    >
                        {PAY_RATE_OPTIONS.map((option) => (
                            <div key={option.value} className="flex items-center space-x-2">
                                <RadioGroupItem value={option.value} id={`pay-${option.value}`} />
                                <Label htmlFor={`pay-${option.value}`} className="cursor-pointer">
                                    {option.label}
                                </Label>
                            </div>
                        ))}
                    </RadioGroup>
                    {errors.pay_rate_rating && (
                        <p className="text-sm text-destructive mt-2">{errors.pay_rate_rating}</p>
                    )}
                </CardContent>
            </Card>

            {/* Q4: Benefits */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">
                        How did you feel about the benefits? <span className="text-destructive">*</span>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <RadioGroup
                        value={formData.benefits_rating}
                        onValueChange={(value) => updateFormData({ benefits_rating: value })}
                    >
                        {BENEFITS_OPTIONS.map((option) => (
                            <div key={option.value} className="flex items-center space-x-2">
                                <RadioGroupItem value={option.value} id={`benefits-${option.value}`} />
                                <Label htmlFor={`benefits-${option.value}`} className="cursor-pointer">
                                    {option.label}
                                </Label>
                            </div>
                        ))}
                    </RadioGroup>
                    {errors.benefits_rating && (
                        <p className="text-sm text-destructive mt-2">{errors.benefits_rating}</p>
                    )}
                </CardContent>
            </Card>

            {/* Q5: Workload */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">
                        How did you feel about the amount of work? <span className="text-destructive">*</span>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <RadioGroup
                        value={formData.workload_rating}
                        onValueChange={(value) => updateFormData({ workload_rating: value })}
                    >
                        {WORKLOAD_OPTIONS.map((option) => (
                            <div key={option.value} className="flex items-center space-x-2">
                                <RadioGroupItem value={option.value} id={`workload-${option.value}`} />
                                <Label htmlFor={`workload-${option.value}`} className="cursor-pointer">
                                    {option.label}
                                </Label>
                            </div>
                        ))}
                    </RadioGroup>
                    {errors.workload_rating && (
                        <p className="text-sm text-destructive mt-2">{errors.workload_rating}</p>
                    )}
                </CardContent>
            </Card>

            {/* Q6: Would Recommend */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">
                        Would you recommend ABC to a friend as a place to work?
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <RadioGroup
                        value={formData.would_recommend ? 'yes' : 'no'}
                        onValueChange={(value) => updateFormData({ would_recommend: value === 'yes' })}
                    >
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="yes" id="recommend-yes" />
                            <Label htmlFor="recommend-yes" className="cursor-pointer">
                                Yes
                            </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="no" id="recommend-no" />
                            <Label htmlFor="recommend-no" className="cursor-pointer">
                                No
                            </Label>
                        </div>
                    </RadioGroup>
                </CardContent>
            </Card>
        </div>
    );
}
