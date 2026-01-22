'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { EmployeeInfoStep } from './steps/employee-info-step';
import { QuestionnaireStep } from './steps/questionnaire-step';
import { PrivacyStep } from './steps/privacy-step';
import { SummaryStep } from './steps/summary-step';
import { submitExitForm, type ExitFormData } from '@/app/exit-form/actions';
import { toast } from 'sonner';

const STEPS = [
    { id: 1, title: 'Employee Information', component: EmployeeInfoStep },
    { id: 2, title: 'Exit Questionnaire', component: QuestionnaireStep },
    { id: 3, title: 'Privacy & Agreement', component: PrivacyStep },
    { id: 4, title: 'Summary & Confirmation', component: SummaryStep },
];

const initialFormData: ExitFormData = {
    employee_number: '',
    employee_name: '',
    date_hired: '',
    position_when_hired: '',
    current_position: '',
    department: '',
    supervisor: '',
    date_of_resignation: '',
    reasons_for_leaving: [],
    destination_country: '',
    reason_more_desirable: [],
    other_reason_detail: '',
    career_growth_rating: '',
    pay_rate_rating: '',
    benefits_rating: '',
    workload_rating: '',
    would_recommend: false,
    privacy_consent: false,
};

interface ExitFormWizardProps {
    resignationId: string;
    existingData?: Partial<ExitFormData>;
}

export function ExitFormWizard({ resignationId, existingData }: ExitFormWizardProps) {
    const [currentStep, setCurrentStep] = useState(1);
    const [formData, setFormData] = useState<ExitFormData>({
        ...initialFormData,
        ...existingData,
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);

    const progress = (currentStep / STEPS.length) * 100;

    const updateFormData = (updates: Partial<ExitFormData>) => {
        setFormData((prev) => ({ ...prev, ...updates }));
        // Clear errors for updated fields
        const clearedErrors = { ...errors };
        Object.keys(updates).forEach((key) => delete clearedErrors[key]);
        setErrors(clearedErrors);
    };

    const validateStep = (step: number): boolean => {
        const newErrors: Record<string, string> = {};

        if (step === 1) {
            if (!formData.employee_name) newErrors.employee_name = 'Required';
            if (!formData.employee_number) newErrors.employee_number = 'Required';
            if (!formData.date_hired) newErrors.date_hired = 'Required';
            if (!formData.position_when_hired) newErrors.position_when_hired = 'Required';
            if (!formData.current_position) newErrors.current_position = 'Required';
            if (!formData.department) newErrors.department = 'Required';
            if (!formData.supervisor) newErrors.supervisor = 'Required';
            if (!formData.date_of_resignation) newErrors.date_of_resignation = 'Required';
        }

        if (step === 2) {
            if (formData.reasons_for_leaving.length === 0) {
                newErrors.reasons_for_leaving = 'Select at least one reason';
            }
            // Conditional: If abroad, country is required
            if (formData.reasons_for_leaving.includes('another_job_abroad') && !formData.destination_country) {
                newErrors.destination_country = 'Required when selecting abroad';
            }
            // Conditional: If job-related, desirable reasons required
            const jobReasons = ['another_job_local', 'another_job_abroad', 'business'];
            if (
                formData.reasons_for_leaving.some((r) => jobReasons.includes(r)) &&
                (!formData.reason_more_desirable || formData.reason_more_desirable.length === 0)
            ) {
                newErrors.reason_more_desirable = 'Required when leaving for another opportunity';
            }
            // Conditional: If other, detail required
            if (formData.reasons_for_leaving.includes('other') && !formData.other_reason_detail) {
                newErrors.other_reason_detail = 'Please specify';
            }
            if (!formData.career_growth_rating) newErrors.career_growth_rating = 'Required';
            if (!formData.pay_rate_rating) newErrors.pay_rate_rating = 'Required';
            if (!formData.benefits_rating) newErrors.benefits_rating = 'Required';
            if (!formData.workload_rating) newErrors.workload_rating = 'Required';
        }

        if (step === 3) {
            if (!formData.privacy_consent) {
                newErrors.privacy_consent = 'You must agree to the privacy policy';
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleNext = () => {
        if (validateStep(currentStep)) {
            setCurrentStep((prev) => Math.min(prev + 1, STEPS.length));
        }
    };

    const handlePrev = () => {
        setCurrentStep((prev) => Math.max(prev - 1, 1));
    };

    const handleSubmit = async () => {
        if (!validateStep(currentStep)) return;

        setIsSubmitting(true);
        const result = await submitExitForm(resignationId, formData);

        if (result.error) {
            toast.error(result.error);
        } else {
            setIsSubmitted(true);
            toast.success('Exit form submitted successfully!');
        }
        setIsSubmitting(false);
    };

    if (isSubmitted) {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center py-16 text-center"
            >
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/10 mb-6">
                    <Check className="h-10 w-10 text-emerald-500" />
                </div>
                <h2 className="text-2xl font-bold mb-2">Thank You!</h2>
                <p className="text-muted-foreground max-w-md">
                    Your exit form has been submitted successfully. We appreciate your honest feedback.
                </p>
            </motion.div>
        );
    }

    const CurrentStepComponent = STEPS[currentStep - 1].component;

    return (
        <div className="space-y-8">
            {/* Progress */}
            <div className="space-y-2">
                <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                        Step {currentStep} of {STEPS.length}
                    </span>
                    <span className="font-medium">{STEPS[currentStep - 1].title}</span>
                </div>
                <Progress value={progress} className="h-2" />
            </div>

            {/* Step Indicators */}
            <div className="flex justify-between">
                {STEPS.map((step) => (
                    <div
                        key={step.id}
                        className={`flex items-center gap-2 ${step.id === currentStep
                                ? 'text-primary'
                                : step.id < currentStep
                                    ? 'text-emerald-500'
                                    : 'text-muted-foreground'
                            }`}
                    >
                        <div
                            className={`flex h-8 w-8 items-center justify-center rounded-full border-2 text-sm font-medium transition-colors ${step.id === currentStep
                                    ? 'border-primary bg-primary text-primary-foreground'
                                    : step.id < currentStep
                                        ? 'border-emerald-500 bg-emerald-500 text-white'
                                        : 'border-muted-foreground/30'
                                }`}
                        >
                            {step.id < currentStep ? <Check className="h-4 w-4" /> : step.id}
                        </div>
                        <span className="hidden sm:inline text-sm">{step.title}</span>
                    </div>
                ))}
            </div>

            {/* Step Content */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={currentStep}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                >
                    <CurrentStepComponent
                        formData={formData}
                        updateFormData={updateFormData}
                        errors={errors}
                    />
                </motion.div>
            </AnimatePresence>

            {/* Navigation */}
            <div className="flex justify-between pt-6 border-t">
                <Button variant="outline" onClick={handlePrev} disabled={currentStep === 1}>
                    <ChevronLeft className="mr-2 h-4 w-4" />
                    Previous
                </Button>

                {currentStep < STEPS.length ? (
                    <Button onClick={handleNext}>
                        Next
                        <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                ) : (
                    <Button onClick={handleSubmit} disabled={isSubmitting}>
                        {isSubmitting ? 'Submitting...' : 'Submit Exit Form'}
                    </Button>
                )}
            </div>
        </div>
    );
}
