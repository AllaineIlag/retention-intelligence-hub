'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, X, User, Briefcase, ClipboardList, Shield } from 'lucide-react';
import {
    REASONS_FOR_LEAVING,
    REASONS_MORE_DESIRABLE,
    CAREER_GROWTH_OPTIONS,
    PAY_RATE_OPTIONS,
    BENEFITS_OPTIONS,
    WORKLOAD_OPTIONS,
    type ExitFormData,
} from '@/app/exit-form/actions';

interface StepProps {
    formData: ExitFormData;
    updateFormData: (updates: Partial<ExitFormData>) => void;
    errors: Record<string, string>;
}

const getLabel = (
    options: { value: string; label: string }[],
    value: string | undefined
): string => {
    return options.find((o) => o.value === value)?.label || value || 'Not specified';
};

export function SummaryStep({ formData }: StepProps) {
    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <ClipboardList className="h-5 w-5 text-indigo-500" />
                        Review Your Responses
                    </CardTitle>
                    <CardDescription>
                        Please review your answers before submitting. You can go back to make changes.
                    </CardDescription>
                </CardHeader>
            </Card>

            {/* Employee Information */}
            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                        <User className="h-4 w-4" />
                        Employee Information
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <dl className="grid gap-3 sm:grid-cols-2">
                        <div>
                            <dt className="text-sm text-muted-foreground">Employee Number</dt>
                            <dd className="font-medium">{formData.employee_number || '-'}</dd>
                        </div>
                        <div>
                            <dt className="text-sm text-muted-foreground">Employee Name</dt>
                            <dd className="font-medium">{formData.employee_name || '-'}</dd>
                        </div>
                        <div>
                            <dt className="text-sm text-muted-foreground">Date Hired</dt>
                            <dd className="font-medium">{formData.date_hired || '-'}</dd>
                        </div>
                        <div>
                            <dt className="text-sm text-muted-foreground">Date of Resignation</dt>
                            <dd className="font-medium">{formData.date_of_resignation || '-'}</dd>
                        </div>
                        <div>
                            <dt className="text-sm text-muted-foreground">Position When Hired</dt>
                            <dd className="font-medium">{formData.position_when_hired || '-'}</dd>
                        </div>
                        <div>
                            <dt className="text-sm text-muted-foreground">Current Position</dt>
                            <dd className="font-medium">{formData.current_position || '-'}</dd>
                        </div>
                        <div>
                            <dt className="text-sm text-muted-foreground">Department</dt>
                            <dd className="font-medium">{formData.department || '-'}</dd>
                        </div>
                        <div>
                            <dt className="text-sm text-muted-foreground">Immediate Superior</dt>
                            <dd className="font-medium">{formData.supervisor || '-'}</dd>
                        </div>
                    </dl>
                </CardContent>
            </Card>

            {/* Exit Questionnaire */}
            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                        <Briefcase className="h-4 w-4" />
                        Exit Questionnaire
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <dt className="text-sm text-muted-foreground mb-2">Reasons for Leaving</dt>
                        <dd className="flex flex-wrap gap-2">
                            {formData.reasons_for_leaving?.map((reason) => (
                                <Badge key={reason} variant="secondary">
                                    {REASONS_FOR_LEAVING.find((r) => r.value === reason)?.label || reason}
                                </Badge>
                            )) || <span className="text-muted-foreground">-</span>}
                        </dd>
                    </div>

                    {formData.destination_country && (
                        <div>
                            <dt className="text-sm text-muted-foreground">Destination Country</dt>
                            <dd className="font-medium">{formData.destination_country}</dd>
                        </div>
                    )}

                    {formData.reason_more_desirable && formData.reason_more_desirable.length > 0 && (
                        <div>
                            <dt className="text-sm text-muted-foreground mb-2">Why More Desirable</dt>
                            <dd className="flex flex-wrap gap-2">
                                {formData.reason_more_desirable.map((reason) => (
                                    <Badge key={reason} variant="secondary">
                                        {REASONS_MORE_DESIRABLE.find((r) => r.value === reason)?.label || reason}
                                    </Badge>
                                ))}
                            </dd>
                        </div>
                    )}

                    {formData.other_reason_detail && (
                        <div>
                            <dt className="text-sm text-muted-foreground">Other Reason Details</dt>
                            <dd className="font-medium">{formData.other_reason_detail}</dd>
                        </div>
                    )}

                    <div className="grid gap-3 sm:grid-cols-2 pt-2">
                        <div>
                            <dt className="text-sm text-muted-foreground">Career Growth</dt>
                            <dd className="font-medium">
                                {getLabel(CAREER_GROWTH_OPTIONS, formData.career_growth_rating)}
                            </dd>
                        </div>
                        <div>
                            <dt className="text-sm text-muted-foreground">Pay Rate</dt>
                            <dd className="font-medium">
                                {getLabel(PAY_RATE_OPTIONS, formData.pay_rate_rating)}
                            </dd>
                        </div>
                        <div>
                            <dt className="text-sm text-muted-foreground">Benefits</dt>
                            <dd className="font-medium">
                                {getLabel(BENEFITS_OPTIONS, formData.benefits_rating)}
                            </dd>
                        </div>
                        <div>
                            <dt className="text-sm text-muted-foreground">Workload</dt>
                            <dd className="font-medium">
                                {getLabel(WORKLOAD_OPTIONS, formData.workload_rating)}
                            </dd>
                        </div>
                    </div>

                    <div className="pt-2">
                        <dt className="text-sm text-muted-foreground">Would Recommend ABC</dt>
                        <dd className="font-medium flex items-center gap-1">
                            {formData.would_recommend ? (
                                <>
                                    <Check className="h-4 w-4 text-emerald-500" /> Yes
                                </>
                            ) : (
                                <>
                                    <X className="h-4 w-4 text-destructive" /> No
                                </>
                            )}
                        </dd>
                    </div>
                </CardContent>
            </Card>

            {/* Privacy Consent */}
            <Card className={formData.privacy_consent ? 'border-emerald-500/30' : 'border-destructive'}>
                <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                        <Shield className="h-4 w-4" />
                        Privacy Agreement
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center gap-2">
                        {formData.privacy_consent ? (
                            <>
                                <Check className="h-5 w-5 text-emerald-500" />
                                <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                                    Data Privacy Policy Accepted
                                </span>
                            </>
                        ) : (
                            <>
                                <X className="h-5 w-5 text-destructive" />
                                <span className="text-destructive font-medium">
                                    Data Privacy Policy Not Accepted
                                </span>
                            </>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
