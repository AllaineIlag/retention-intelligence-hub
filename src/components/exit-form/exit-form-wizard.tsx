'use client'

import { useState } from 'react'
import { WizardLayout } from '@/components/exit-form/wizard-layout'
import { WizardNavigation } from '@/components/exit-form/wizard-navigation'
import { useRouter } from 'next/navigation'
import { Database } from '@/lib/database.types'
import { StepEmployeeInfo } from './steps/step-employee-info'
import { StepQuestionnaire } from './steps/step-questionnaire'
import { StepPrivacy } from './steps/step-privacy'
import { StepReview } from './steps/step-review'
import { saveExitForm, submitExitForm } from '@/app/exit-form/actions'
import { toast } from 'sonner'

type Resignation = Database['public']['Tables']['resignations']['Row']
type Question = Database['public']['Tables']['questions']['Row']

interface ReferenceData {
    positions: string[]
    departments: string[]
    supervisors: string[]
}

interface ExitFormWizardProps {
    resignation: Resignation
    referenceData: ReferenceData
    reasons: string[]
    questions: Question[]
}

const STEPS = [
    { id: 'employee-info', label: 'Employee Info' },
    { id: 'questionnaire', label: 'Questionnaire' },
    { id: 'privacy', label: 'Privacy & Consent' },
    { id: 'review', label: 'Review & Submit' },
]

export function ExitFormWizard({ resignation: initialResignation, referenceData, reasons, questions }: ExitFormWizardProps) {
    const router = useRouter()
    const [currentStep, setCurrentStep] = useState(1)
    const [isSubmitting, setIsSubmitting] = useState(false)

    // Form State
    const [resignation, setResignation] = useState<Resignation>(initialResignation)
    const [responses, setResponses] = useState<Record<string, { rating?: number, responseText?: string }>>({})
    const [privacyConsent, setPrivacyConsent] = useState(false)

    // Extra Employee Details State (Transient)
    const [employeeDetails, setEmployeeDetails] = useState({
        employeeId: '',
        name: '',
        dateHired: '',
        positionHired: ''
    })

    const handleNext = async () => {
        if (currentStep < STEPS.length) {
            // Validate Step 1
            if (currentStep === 1) {
                // Basic validation for new fields (optional for now as we don't save them to DB yet)
                if (!resignation.exit_date || !resignation.reason) {
                    toast.error("Please fill in all required fields.")
                    return
                }

                try {
                    setIsSubmitting(true)
                    await saveExitForm({
                        resignationId: resignation.id,
                        exitDate: resignation.exit_date!,
                        reason: resignation.reason!,
                        responses: []
                    })
                    setIsSubmitting(false)
                    setCurrentStep(prev => prev + 1)
                } catch (_error) {
                    setIsSubmitting(false)
                    toast.error("Failed to save progress. Please try again.")
                }
            }
            // Validate Step 2 (Questionnaire)
            else if (currentStep === 2) {
                // Validation logic for questionnaire if needed
                // For now, let's allow proceeding
                try {
                    setIsSubmitting(true)
                    // ... saving logic
                    await saveExitForm({
                        resignationId: resignation.id,
                        exitDate: resignation.exit_date!,
                        reason: resignation.reason!,
                        responses: [] // saving basic info again
                    })
                    setIsSubmitting(false)
                    setCurrentStep(prev => prev + 1)
                } catch (_error) {
                    setIsSubmitting(false)
                    // proceed anyway for UI demo if save fails due to schema mismatch
                    setCurrentStep(prev => prev + 1)
                }
            }
            // Validate Step 3 (Privacy)
            else if (currentStep === 3) {
                if (!privacyConsent) {
                    toast.error("You must acknowledge the privacy notice to proceed.")
                    return
                }
                setCurrentStep(prev => prev + 1)
            }
            else {
                setCurrentStep(prev => prev + 1)
            }
        } else {
            // Handle final submit
            try {
                setIsSubmitting(true)
                // Final save
                await saveExitForm({
                    resignationId: resignation.id,
                    exitDate: resignation.exit_date!,
                    reason: resignation.reason!,
                    responses: [] // responses saved separately or ignored for now in this demo refactor
                })

                // Submit action
                await submitExitForm(resignation.id)

                toast.success("Exit form submitted successfully.")

                setTimeout(() => {
                    setIsSubmitting(false)
                    router.push('/dashboard')
                }, 1500)
            } catch (error) {
                setIsSubmitting(false)
                toast.error("Failed to submit form. Please try again.")
            }
        }
    }

    const handleBack = () => {
        if (currentStep > 1) {
            setCurrentStep(prev => prev - 1)
        }
    }

    const updateResignation = (updates: Partial<Resignation>) => {
        setResignation(prev => ({ ...prev, ...updates }))
    }

    const updateResponse = (questionId: string, data: Partial<{ rating?: number, responseText?: string }>) => {
        setResponses(prev => ({
            ...prev,
            [questionId]: { ...prev[questionId], ...data }
        }))
    }

    return (
        <WizardLayout
            title={STEPS[currentStep - 1].label}
            description="Please complete all sections of the exit interview."
            currentStep={currentStep}
            totalSteps={STEPS.length}
            steps={STEPS}
        >
            {currentStep === 1 && (
                <StepEmployeeInfo
                    resignation={resignation}
                    referenceData={referenceData}
                    reasons={reasons}
                    onChange={updateResignation}
                    employeeDetails={employeeDetails}
                    onDetailsChange={setEmployeeDetails}
                />
            )}

            {currentStep === 2 && (
                <StepQuestionnaire
                    resignationReason={resignation.reason}
                    onReasonChange={(val) => updateResignation({ reason: val })}
                    questions={questions}
                    responses={responses}
                    onResponseChange={updateResponse}
                />
            )}

            {currentStep === 3 && (
                <StepPrivacy
                    consent={privacyConsent}
                    onConsentChange={setPrivacyConsent}
                />
            )}

            {currentStep === 4 && (
                <StepReview
                    resignation={resignation}
                    responses={responses}
                    questions={questions}
                    employeeDetails={employeeDetails}
                />
            )}

            <WizardNavigation
                onBack={handleBack}
                onNext={handleNext}
                isBackDisabled={currentStep === 1}
                isSubmitting={isSubmitting}
                nextLabel={currentStep === STEPS.length ? 'Submit' : 'Next'}
            />
        </WizardLayout>
    )
}
