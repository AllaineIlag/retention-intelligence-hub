"use client"

import { Label } from "../../ui/label"
import { Checkbox } from "../../ui/checkbox"


interface StepPrivacyProps {
    consent: boolean
    onConsentChange: (checked: boolean) => void
}

export function StepPrivacy({ consent, onConsentChange }: StepPrivacyProps) {
    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="space-y-4">
                <h3 className="text-lg font-medium text-slate-800">Data Privacy & Consent</h3>
                <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 text-sm text-slate-600 leading-relaxed h-64 overflow-y-auto">
                    <p className="mb-4">
                        <strong>Confidentiality Notice:</strong> The information you provide in this exit interview will be used to help us understand why employees leave and to identify opportunities for improvement within the organization.
                    </p>
                    <p className="mb-4">
                        Your responses will be shared with the Human Resources department and generalized data may be shared with senior management. We strive to maintain confidentiality; however, if you disclose information regarding illegal activities, harassment, or safety threats, we may be obligated to investigate and take appropriate action.
                    </p>
                    <p className="mb-4">
                        <strong>Data Usage:</strong> By submitting this form, you consent to the processing of your personal data for the purpose of retention analysis and organizational improvement. Your data will be stored securely and retained in accordance with our data retention policies.
                    </p>
                    <p>
                        <strong>Voluntary Participation:</strong> Participation in this exit interview is typically voluntary. You have the right to decline to answer any specific questions.
                    </p>
                </div>
            </div>

            <div className="flex items-start space-x-3 p-4 border border-slate-200 rounded-lg bg-white">
                <Checkbox
                    id="privacy-consent"
                    checked={consent}
                    onCheckedChange={(checked) => onConsentChange(checked as boolean)}
                />
                <div className="grid gap-1.5 leading-none">
                    <Label
                        htmlFor="privacy-consent"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                    >
                        I acknowledge that I have read and understood the privacy notice above.
                    </Label>
                    <p className="text-sm text-slate-500">
                        I agree to the processing of my exit interview data.
                    </p>
                </div>
            </div>
        </div>
    )
}
