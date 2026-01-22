'use client';

import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Lock, FileText } from 'lucide-react';
import type { ExitFormData } from '@/app/exit-form/actions';

interface StepProps {
    formData: ExitFormData;
    updateFormData: (updates: Partial<ExitFormData>) => void;
    errors: Record<string, string>;
}

export function PrivacyStep({ formData, updateFormData, errors }: StepProps) {
    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Shield className="h-5 w-5 text-indigo-500" />
                        Data Privacy Agreement
                    </CardTitle>
                    <CardDescription>
                        Please read and acknowledge our data privacy policy before proceeding.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Privacy Policy Text */}
                    <div className="rounded-lg border bg-muted/50 p-6 space-y-4 max-h-[400px] overflow-y-auto">
                        <div className="flex items-center gap-2 text-sm font-medium">
                            <FileText className="h-4 w-4" />
                            Employee Exit Interview Data Privacy Notice
                        </div>

                        <div className="space-y-4 text-sm text-muted-foreground">
                            <p>
                                <strong>1. Purpose of Data Collection</strong>
                                <br />
                                The information collected through this exit interview form will be used solely for
                                the purpose of improving workplace conditions, understanding employee turnover
                                patterns, and enhancing organizational policies.
                            </p>

                            <p>
                                <strong>2. Data Handling</strong>
                                <br />
                                Your responses will be:
                            </p>
                            <ul className="list-disc list-inside ml-4 space-y-1">
                                <li>Stored securely in our encrypted database</li>
                                <li>Accessible only to authorized HR personnel and management</li>
                                <li>Used for aggregate analysis and reporting</li>
                                <li>Retained in accordance with company data retention policies</li>
                            </ul>

                            <p>
                                <strong>3. Confidentiality</strong>
                                <br />
                                While your identity is recorded for administrative purposes, your feedback will be
                                treated with the utmost confidentiality. Individual responses will not be shared
                                with your direct supervisor or department without your explicit consent.
                            </p>

                            <p>
                                <strong>4. Your Rights</strong>
                                <br />
                                Under the Data Privacy Act, you have the right to:
                            </p>
                            <ul className="list-disc list-inside ml-4 space-y-1">
                                <li>Access your personal data</li>
                                <li>Request correction of inaccurate information</li>
                                <li>Object to processing under certain circumstances</li>
                                <li>Request deletion of your data after the retention period</li>
                            </ul>

                            <p>
                                <strong>5. Contact</strong>
                                <br />
                                For questions regarding your data privacy rights, please contact the HR Department
                                or the Data Protection Officer.
                            </p>
                        </div>
                    </div>

                    {/* Agreement Checkbox */}
                    <div
                        className={`rounded-lg border p-4 ${errors.privacy_consent ? 'border-destructive bg-destructive/5' : 'bg-muted/30'}`}
                    >
                        <div className="flex items-start space-x-3">
                            <Checkbox
                                id="privacy_consent"
                                checked={formData.privacy_consent}
                                onCheckedChange={(checked) =>
                                    updateFormData({ privacy_consent: checked as boolean })
                                }
                                className="mt-0.5"
                            />
                            <div className="space-y-1">
                                <Label htmlFor="privacy_consent" className="cursor-pointer font-medium">
                                    I have read and agree to the Data Privacy Policy{' '}
                                    <span className="text-destructive">*</span>
                                </Label>
                                <p className="text-sm text-muted-foreground">
                                    By checking this box, you acknowledge that you have read, understood, and agree to
                                    the terms outlined in the Data Privacy Notice above.
                                </p>
                            </div>
                        </div>
                        {errors.privacy_consent && (
                            <p className="text-sm text-destructive mt-2 ml-6">{errors.privacy_consent}</p>
                        )}
                    </div>

                    {/* Security Note */}
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Lock className="h-4 w-4" />
                        <span>Your data is encrypted and securely stored.</span>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
