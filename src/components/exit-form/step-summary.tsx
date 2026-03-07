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
    onEdit: (stepId: 'info' | 'questions' | 'terms', questionIndex?: number) => void;
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
                        <SectionHeader title="Employee Information" onEdit={() => onEdit('info')} readOnly={true} />
                    </CardHeader>
                    <CardContent className="pt-6">
                        <InfoItem label="Full Name" value={details.employee_name} />
                        <InfoItem label="Employee ID" value={details.employee_number} />
                        <InfoItem label="Date Hired" value={formatDate(details.date_hired)} />
                        <InfoItem label="Date of Resignation" value={formatDate(details.date_of_resignation)} />
                        <InfoItem label="Position" value={details.position} />
                        <InfoItem label="Department" value={details.department} />
                        <InfoItem label="Business Unit" value={details.business_unit} />
                        <InfoItem label="Supervisor" value={details.intermediate_supervisor} />
                    </CardContent>
                </Card>

                {/* Section 2: Questionnaire Responses */}
                <Card>
                    <CardHeader className="bg-muted/30 pb-4 border-b border-border/50">
                        {/* We use a plain header here to remove the global Edit button */}
                        <h3 className="text-lg font-semibold text-primary flex items-center gap-2">
                            Questionnaire Responses
                        </h3>
                    </CardHeader>
                    <CardContent className="pt-6 space-y-8">

                        {/* Subsection 1: Reason for Leaving */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between border-b border-border/50 pb-2">
                                <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Reason for Leaving</h4>
                                {!readOnly && (
                                    <Button variant="ghost" size="sm" onClick={() => onEdit('questions', 0)} className="h-8 px-3 text-muted-foreground hover:text-primary bg-muted/20">
                                        <Edit2 className="w-3.5 h-3.5 mr-2" /> Edit
                                    </Button>
                                )}
                            </div>
                            <div className="pl-4 border-l-2 border-primary/20 space-y-3">
                                <div>
                                    <span className="text-sm font-medium">Primary Reason:</span>
                                    <div className="flex flex-wrap gap-2 mt-1">
                                        {responses.reason_for_leaving?.map((reason, idx) => (
                                            <span key={idx} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                                                {reason}
                                            </span>
                                        )) || "N/A"}
                                    </div>
                                </div>
                                {responses.reason_for_leaving_country && (
                                    <div className="text-sm">
                                        <span className="font-medium text-muted-foreground">Destination Country: </span>
                                        <span>{responses.reason_for_leaving_country}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Subsection 2: New Opportunity (Conditional) */}
                        {(responses.why_more_desirable?.length || 0) > 0 && (
                            <div className="space-y-4">
                                <div className="flex items-center justify-between border-b border-border/50 pb-2">
                                    <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">New Opportunity</h4>
                                    {!readOnly && (
                                        <Button variant="ghost" size="sm" onClick={() => onEdit('questions', 1)} className="h-8 px-3 text-muted-foreground hover:text-primary bg-muted/20">
                                            <Edit2 className="w-3.5 h-3.5 mr-2" /> Edit
                                        </Button>
                                    )}
                                </div>
                                <div className="pl-4 border-l-2 border-primary/20 space-y-3">
                                    <div>
                                        <span className="text-sm font-medium">Why Desirable:</span>
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
                                            Other: "{responses.why_more_desirable_other}"
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Subsection 3: Work Experience */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between border-b border-border/50 pb-2">
                                <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Work Experience</h4>
                                {!readOnly && (
                                    <Button variant="ghost" size="sm" onClick={() => onEdit('questions', 2)} className="h-8 px-3 text-muted-foreground hover:text-primary bg-muted/20">
                                        <Edit2 className="w-3.5 h-3.5 mr-2" /> Edit
                                    </Button>
                                )}
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pl-4 border-l-2 border-primary/20">
                                <div className="text-sm">
                                    <span className="font-medium text-muted-foreground block mb-1">Career Growth:</span>
                                    <span className="font-medium">{responses.career_growth || '—'}</span>
                                </div>
                                <div className="text-sm">
                                    <span className="font-medium text-muted-foreground block mb-1">Rate of Pay:</span>
                                    <span className="font-medium">{responses.rate_of_pay || '—'}</span>
                                </div>
                            </div>
                        </div>

                        {/* Subsection 4: Environment */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between border-b border-border/50 pb-2">
                                <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Environment</h4>
                                {!readOnly && (
                                    <Button variant="ghost" size="sm" onClick={() => onEdit('questions', 4)} className="h-8 px-3 text-muted-foreground hover:text-primary bg-muted/20">
                                        <Edit2 className="w-3.5 h-3.5 mr-2" /> Edit
                                    </Button>
                                )}
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pl-4 border-l-2 border-primary/20">
                                <div className="text-sm">
                                    <span className="font-medium text-muted-foreground block mb-1">Benefits:</span>
                                    <span className="font-medium">{responses.benefits || '—'}</span>
                                    {responses.benefits_comment && <div className="mt-1 italic text-muted-foreground text-xs">"{responses.benefits_comment}"</div>}
                                </div>
                                <div className="text-sm">
                                    <span className="font-medium text-muted-foreground block mb-1">Workload:</span>
                                    <span className="font-medium">{responses.workload || '—'}</span>
                                    {responses.workload_comment && <div className="mt-1 italic text-muted-foreground text-xs">"{responses.workload_comment}"</div>}
                                </div>
                            </div>
                        </div>

                        {/* Subsection 5: Final Thoughts */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between border-b border-border/50 pb-2">
                                <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Final Thoughts</h4>
                                {!readOnly && (
                                    <Button variant="ghost" size="sm" onClick={() => onEdit('questions', 6)} className="h-8 px-3 text-muted-foreground hover:text-primary bg-muted/20">
                                        <Edit2 className="w-3.5 h-3.5 mr-2" /> Edit
                                    </Button>
                                )}
                            </div>
                            <div className="pl-4 border-l-2 border-primary/20 space-y-3">
                                <div className="text-sm flex items-center gap-2">
                                    <span className="font-medium text-muted-foreground">Recommend Company?</span>
                                    <span className={`font-bold ${responses.recommendation === "Yes" ? "text-green-600" : "text-red-500"}`}>
                                        {responses.recommendation || '—'}
                                    </span>
                                </div>
                                {responses.recommendation_reason && (
                                    <div className="text-sm p-3 bg-muted rounded-md italic text-muted-foreground">
                                        "{responses.recommendation_reason}"
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
    onEdit,
    readOnly
}: {
    title: string;
    onEdit: () => void;
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
                onClick={onEdit}
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
