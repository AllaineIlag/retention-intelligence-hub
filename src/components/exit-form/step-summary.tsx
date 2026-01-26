import React from "react";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardHeader,
} from "@/components/ui/card";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { EmployeeDetails, QuestionnaireResponses } from "@/app/exit-form/actions";
import { CheckCircle2, Edit2, Loader2, Send } from "lucide-react";

interface StepSummaryProps {
    details: EmployeeDetails;
    responses: QuestionnaireResponses;
    onEdit: (stepId: 'info' | 'questions' | 'terms') => void;
    onSubmit: () => void;
    isSubmitting: boolean;
    readOnly?: boolean;
}

export function StepSummary({
    details,
    responses,
    onEdit,
    onSubmit,
    isSubmitting,
    readOnly = false,
}: StepSummaryProps) {
    // Helper to format dates
    const formatDate = (dateStr?: string) => {
        if (!dateStr) return "N/A";
        try {
            return new Date(dateStr).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
            });
        } catch {
            return dateStr;
        }
    };



    return (
        <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500">
            <div className="text-center space-y-2 mb-8">
                <h2 className="text-2xl font-bold tracking-tight">Review & Submit</h2>
                <p className="text-muted-foreground">
                    Please review your responses carefully. Once submitted, you cannot make changes.
                </p>
            </div>

            <div className="grid grid-cols-1 gap-6">
                {/* Section 1: Employee Information */}
                <Card>
                    <CardHeader className="bg-muted/30 pb-4">
                        <SectionHeader title="Employee Information" editTarget="info" onEdit={onEdit} readOnly={readOnly} />
                    </CardHeader>
                    <CardContent className="pt-6">
                        <InfoItem label="Full Name" value={details.employee_name} />
                        <InfoItem label="Employee ID" value={details.employee_number} />
                        <InfoItem label="Date Hired" value={formatDate(details.date_hired)} />
                        <InfoItem label="Date of Resignation" value={formatDate(details.date_of_resignation)} />
                        <InfoItem label="Position (Hired)" value={details.position_when_hired} />
                        <InfoItem label="Current Position" value={details.current_position} />
                        <InfoItem label="Department / Supervisor" value={details.department_supervisor} />
                    </CardContent>
                </Card>

                {/* Section 2: Questionnaire Responses */}
                <Card>
                    <CardHeader className="bg-muted/30 pb-4">
                        <SectionHeader title="Questionnaire Responses" editTarget="questions" onEdit={onEdit} readOnly={readOnly} />
                    </CardHeader>
                    <CardContent className="pt-6 space-y-6">
                        <div className="space-y-3">
                            <h4 className="text-sm font-semibold text-primary/80">Reason for Leaving</h4>
                            <div className="pl-4 border-l-2 border-primary/20 space-y-2">
                                <div className="text-sm">
                                    <span className="font-medium">Primary Reason:</span>
                                    <div className="flex flex-wrap gap-2 mt-1">
                                        {responses.reason_for_leaving?.map((reason, idx) => (
                                            <span key={idx} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                                                {reason}
                                            </span>
                                        )) || "N/A"}
                                    </div>
                                </div>
                                {responses.reason_for_leaving_country && (
                                    <div className="text-sm mt-1">
                                        <span className="font-medium text-muted-foreground">Destination Country: </span>
                                        {responses.reason_for_leaving_country}
                                    </div>
                                )}
                            </div>
                        </div>

                        {(responses.why_more_desirable?.length || 0) > 0 && (
                            <div className="space-y-3">
                                <h4 className="text-sm font-semibold text-primary/80">New Opportunity</h4>
                                <div className="pl-4 border-l-2 border-primary/20 space-y-2">
                                    <div className="text-sm">
                                        <span className="font-medium">Why Desirable:</span>
                                        <div className="flex flex-wrap gap-2 mt-1">
                                            {responses.why_more_desirable?.map((r, idx) => (
                                                <span key={idx} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-secondary text-secondary-foreground">
                                                    {r}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                    {responses.why_more_desirable_other && (
                                        <div className="text-sm mt-1 italic text-muted-foreground">
                                            Other: &quot;{responses.why_more_desirable_other}&quot;
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-3">
                                <h4 className="text-sm font-semibold text-primary/80">Work Experience</h4>
                                <div className="pl-4 border-l-2 border-primary/20 space-y-2">
                                    <div className="text-sm"><span className="font-medium text-muted-foreground">Career Growth:</span> {responses.career_growth}</div>
                                    <div className="text-sm"><span className="font-medium text-muted-foreground">Rate of Pay:</span> {responses.rate_of_pay}</div>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <h4 className="text-sm font-semibold text-primary/80">Environment</h4>
                                <div className="pl-4 border-l-2 border-primary/20 space-y-2">
                                    <div className="text-sm">
                                        <span className="font-medium text-muted-foreground">Benefits:</span> {responses.benefits}
                                        {responses.benefits_comment && <div className="mt-0.5 italic text-muted-foreground text-xs">&quot;{responses.benefits_comment}&quot;</div>}
                                    </div>
                                    <div className="text-sm">
                                        <span className="font-medium text-muted-foreground">Workload:</span> {responses.workload}
                                        {responses.workload_comment && <div className="mt-0.5 italic text-muted-foreground text-xs">&quot;{responses.workload_comment}&quot;</div>}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <h4 className="text-sm font-semibold text-primary/80">Final Thoughts</h4>
                            <div className="pl-4 border-l-2 border-primary/20 space-y-2">
                                <div className="text-sm">
                                    <span className="font-medium text-muted-foreground">Recommend Company?</span>
                                    <span className={`ml-2 font-bold ${responses.recommendation === "Yes" ? "text-green-600" : "text-red-500"}`}>
                                        {responses.recommendation}
                                    </span>
                                </div>
                                {responses.recommendation_reason && (
                                    <div className="text-sm mt-1 p-3 bg-muted rounded-md italic text-muted-foreground">
                                        &quot;{responses.recommendation_reason}&quot;
                                    </div>
                                )}
                            </div>
                        </div>

                    </CardContent>
                </Card>

                {/* Section 3: Terms */}
                <Card>
                    <CardContent className="pt-6 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <CheckCircle2 className="w-5 h-5 text-green-500" />
                            <span className="text-sm font-medium">Terms and Conditions Accepted</span>
                        </div>
                        {!readOnly && <Button variant="ghost" size="sm" onClick={() => onEdit('terms')}>Edit</Button>}
                    </CardContent>
                </Card>

            </div>

            {!readOnly && (
                <div className="flex justify-end pt-4">
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button
                                size="lg"
                                className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Submitting...
                                    </>
                                ) : (
                                    <>
                                        Confirm & Submit Resignation
                                        <Send className="w-4 h-4 ml-2" />
                                    </>
                                )}
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This action cannot be undone. You are about to formally submit your resignation.
                                    Once submitted, you will be signed out for security purposes.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                    onClick={onSubmit}
                                    className="bg-primary text-primary-foreground hover:bg-primary/90"
                                >
                                    Yes, submit my resignation
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
            )}
            {readOnly && (
                <div className="flex justify-center pt-8">
                    <p className="text-muted-foreground italic">This form has been locked and submitted for review.</p>
                </div>
            )}
        </div>
    );
}

const SectionHeader = ({
    title,
    editTarget,
    onEdit,
    readOnly
}: {
    title: string;
    editTarget: 'info' | 'questions' | 'terms';
    onEdit: (stepId: 'info' | 'questions' | 'terms') => void;
    readOnly?: boolean;
}) => (
    <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-primary flex items-center gap-2">
            {title}
        </h3>
        {!readOnly && (
            <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-primary"
                onClick={() => onEdit(editTarget)}
            >
                <Edit2 className="w-4 h-4 mr-1" />
                Edit
            </Button>
        )}
    </div>
);

const InfoItem = ({ label, value }: { label: string; value: React.ReactNode }) => (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-1 py-2 border-b border-border/50 last:border-0">
        <div className="text-sm font-medium text-muted-foreground sm:col-span-1">{label}</div>
        <div className="text-sm font-medium text-foreground sm:col-span-2">{value || "N/A"}</div>
    </div>
);
