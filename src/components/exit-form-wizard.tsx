'use client';

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  Field,
  FieldLabel,
  FieldGroup
} from '@/components/ui/field';
import { DatePicker } from '@/components/date-picker';
import {
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  Loader2,
  Check,
  ChevronsUpDown,
  ArrowDown
} from 'lucide-react';
import { saveExitForm, submitExitForm, EmployeeDetails, QuestionnaireResponses, Question } from '@/app/exit-form/actions';
import { StepSummary } from './exit-form/step-summary';
import { toast } from 'sonner';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";
import { type CheckedState } from "@radix-ui/react-checkbox";
import { COUNTRIES } from "@/lib/countries";
import {
  getDepartments,
  getBusinessUnits,
  getSupervisors,
  getPositions
} from '@/app/actions/settings-actions';

interface ExitFormWizardProps {
  user: { id: string; email?: string } | null;
  resignation: { id: string; exit_date: string; status: string; last_working_day?: string };
  profile: Partial<EmployeeDetails & { full_name: string }> | null;
  questions: Question[];
  initialResponse: {
    employee_details?: Partial<EmployeeDetails>;
    questionnaire_responses?: Partial<QuestionnaireResponses>;
  } | null;
  readOnly?: boolean;
}

const STEPS = [
  { id: 'info', title: 'Employee Information' },
  { id: 'questions', title: 'Exit Questionnaire' },
  { id: 'terms', title: 'Terms & Conditions' },
  { id: 'summary', title: 'Summary' },
];

const QUESTIONNAIRE_STEPS_COUNT = 7;

export function ExitFormWizard({
  resignation,
  profile,
  initialResponse,
  readOnly = false,
}: ExitFormWizardProps) {
  // 1. REVERT SMART RESUME
  // Form always starts at the beginning unless in read-only mode
  const initialStep = readOnly ? 3 : 0;
  const [currentStep, setCurrentStep] = useState(initialStep);
  const [questionnaireStep, setQuestionnaireStep] = useState(0);
  const [direction, setDirection] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [countryOpen, setCountryOpen] = useState(false);
  const [consent, setConsent] = useState<boolean>(false);
  const [canAcceptTerms, setCanAcceptTerms] = useState(false);
  const [isEditingFromSummary, setIsEditingFromSummary] = useState(false);

  const [details, setDetails] = useState<EmployeeDetails>({
    employee_number: initialResponse?.employee_details?.employee_number || profile?.employee_number || '',
    employee_name: initialResponse?.employee_details?.employee_name || profile?.full_name || '',
    date_hired: initialResponse?.employee_details?.date_hired || profile?.date_hired || '',
    position_when_hired: initialResponse?.employee_details?.position_when_hired || profile?.position_when_hired || '',
    current_position: initialResponse?.employee_details?.current_position || profile?.current_position || '',
    business_unit: initialResponse?.employee_details?.business_unit || profile?.business_unit || '',
    intermediate_supervisor: initialResponse?.employee_details?.intermediate_supervisor || profile?.intermediate_supervisor || '',
    department: initialResponse?.employee_details?.department || profile?.department || '',
    date_of_resignation: initialResponse?.employee_details?.date_of_resignation || resignation?.last_working_day || '',
  });

  const [responses, setResponses] = useState<QuestionnaireResponses>({
    reason_for_leaving: initialResponse?.questionnaire_responses?.reason_for_leaving || [],
    reason_for_leaving_country: initialResponse?.questionnaire_responses?.reason_for_leaving_country || '',
    why_more_desirable: initialResponse?.questionnaire_responses?.why_more_desirable || [],
    why_more_desirable_other: initialResponse?.questionnaire_responses?.why_more_desirable_other || '',
    career_growth: initialResponse?.questionnaire_responses?.career_growth || '',
    rate_of_pay: initialResponse?.questionnaire_responses?.rate_of_pay || '',
    benefits: initialResponse?.questionnaire_responses?.benefits || '',
    benefits_comment: initialResponse?.questionnaire_responses?.benefits_comment || '',
    workload: initialResponse?.questionnaire_responses?.workload || '',
    workload_comment: initialResponse?.questionnaire_responses?.workload_comment || '',
    recommendation: initialResponse?.questionnaire_responses?.recommendation || '',
    recommendation_reason: initialResponse?.questionnaire_responses?.recommendation_reason || '',
  });

  const [departments, setDepartments] = useState<string[]>([]);
  const [businessUnits, setBusinessUnits] = useState<string[]>([]);
  const [supervisors, setSupervisors] = useState<string[]>([]);
  const [positions, setPositions] = useState<string[]>([]);

  useEffect(() => {
    async function fetchSettings() {
      const [dRes, bRes, sRes, pRes] = await Promise.all([
        getDepartments(),
        getBusinessUnits(),
        getSupervisors(),
        getPositions()
      ]);
      if (dRes.success) setDepartments(dRes.data?.filter(d => d.is_active).map(d => d.name) || []);
      if (bRes.success) setBusinessUnits(bRes.data?.filter(b => b.is_active).map(b => b.name) || []);
      if (sRes.success) setSupervisors(sRes.data?.filter(s => s.is_active).map(s => s.name) || []);
      if (pRes.success) setPositions(pRes.data?.filter(p => p.is_active).map(p => p.name) || []);
    }
    fetchSettings();
  }, []);

  // Dynamic progress calculation
  const progress = React.useMemo(() => {
    const baseProgress = (currentStep / STEPS.length) * 100;
    if (currentStep === 1) {
      const stepWeight = 100 / STEPS.length;
      const subProgress = (questionnaireStep / QUESTIONNAIRE_STEPS_COUNT) * stepWeight;
      return baseProgress + subProgress;
    }
    return baseProgress;
  }, [currentStep, questionnaireStep]);

  // 2. BROWSER WARNING FOR UNSAVED CHANGES
  const hasUnsavedChanges = useRef(false);
  const isFinalSubmitting = useRef(false);

  useEffect(() => {
    // A. External Navigation Guard (Refresh, Tab Close, External Links)
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges.current && !readOnly && !isFinalSubmitting.current) {
        const message = "Changes you made may not be saved.";
        e.preventDefault();
        e.returnValue = message;
        return message;
      }
    };

    // B. Internal Navigation Guard (Next.js Client-side Links)
    const handleInternalNavigation = (e: MouseEvent) => {
      if (!hasUnsavedChanges.current || readOnly || isFinalSubmitting.current) return;

      const target = e.target as HTMLElement;
      const link = target.closest('a');

      if (link && link.href) {
        const url = new URL(link.href, window.location.origin);
        // Only warn if navigating away from the current form path
        if (url.origin === window.location.origin && !url.pathname.startsWith('/exit-form')) {
          if (!window.confirm("Changes you made may not be saved. Are you sure you want to leave?")) {
            e.preventDefault();
            e.stopPropagation();
          }
        }
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('click', handleInternalNavigation, true); // Use capture phase

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('click', handleInternalNavigation, true);
    };
  }, [readOnly]);

  const updateDetail = (field: keyof EmployeeDetails, value: string) => {
    setDetails(prev => ({ ...prev, [field]: value }));
    hasUnsavedChanges.current = true;
  };

  const updateResponse = (updates: Partial<QuestionnaireResponses>) => {
    setResponses(prev => ({ ...prev, ...updates }));
    hasUnsavedChanges.current = true;
  };

  const toggleSelection = (field: keyof QuestionnaireResponses, value: string) => {
    const currentList = (responses[field] as string[]) || [];
    const newList = currentList.includes(value)
      ? currentList.filter(item => item !== value)
      : [...currentList, value];
    updateResponse({ [field]: newList });
  };

  const MAX_REASONS = 3;

  const handleReasonToggle = (option: string) => {
    const currentList = responses.reason_for_leaving || [];

    // Special handling for "Another Job" parent toggle
    if (option === "Another Job") {
      const isCurrentlySelected = currentList.some(r => r.includes("Another Job"));

      if (isCurrentlySelected) {
        // Uncheck: Remove ALL "Another Job" variants
        const newList = currentList.filter(r => !r.includes("Another Job"));
        updateResponse({
          reason_for_leaving: newList,
          reason_for_leaving_country: ""
        });
      } else {
        // Check: Enforce cap before adding
        if (currentList.length >= MAX_REASONS) return;
        updateResponse({ reason_for_leaving: [...currentList, "Another Job"] });
      }
      return;
    }

    // Check for cap before adding a new selection
    const isAlreadySelected = currentList.includes(option);
    if (!isAlreadySelected && currentList.length >= MAX_REASONS) return;

    toggleSelection('reason_for_leaving', option);
  };

  const isStepValid = React.useMemo(() => {
    if (currentStep === 0) {
      const requiredFields: (keyof EmployeeDetails)[] = [
        'employee_name',
        'employee_number',
        'date_hired',
        'date_of_resignation',
        'position_when_hired',
        'current_position',
        'department',
        'business_unit',
        'intermediate_supervisor',
      ];
      return requiredFields.every(field => !!details[field]);
    }

    if (currentStep === 1) {
      // Q1: Reason for leaving
      if (questionnaireStep === 0) {
        if (!responses.reason_for_leaving || responses.reason_for_leaving.length === 0) return false;

        // Block if the generic "Another Job" is present (must be specialized to Local or Abroad)
        const hasUnspecializedJob = responses.reason_for_leaving.some(r => r === 'Another Job');
        if (hasUnspecializedJob) return false;

        if (responses.reason_for_leaving.includes('Another Job (Abroad)') && !responses.reason_for_leaving_country) return false;
      }
      // Q2: Why more desirable (Conditional)
      if (questionnaireStep === 1) {
        return (responses.why_more_desirable?.length || 0) > 0;
      }
      // Q3: Career Growth
      if (questionnaireStep === 2) return !!responses.career_growth;
      // Q4: Rate of Pay
      if (questionnaireStep === 3) return !!responses.rate_of_pay;
      // Q5: Benefits
      if (questionnaireStep === 4) return !!responses.benefits;
      // Q6: Workload
      if (questionnaireStep === 5) return !!responses.workload;
      // Q7: Recommendation
      if (questionnaireStep === 6) {
        return !!responses.recommendation; // Only Yes/No is required now
      }
    }

    if (currentStep === 2) {
      // Terms and Conditions
      return consent === true;
    }

    return true;
  }, [currentStep, questionnaireStep, details, responses, consent]);

  const handleNext = async () => {
    if (!isStepValid) {
      toast.error("Please complete the required fields.");
      return;
    }

    // Save progress on explicit navigation to avoid data loss
    if (hasUnsavedChanges.current) {
      setIsSaving(true);
      try {
        await saveExitForm({
          resignation_id: resignation.id,
          employee_details: details,
          questionnaire_responses: responses
        });
        // NOTE: Do NOT reset hasUnsavedChanges here.
        // Intermediate saves are checkpoints, not completion.
        // The beforeunload warning must stay active until final submit.
      } catch (err) {
        console.error("Save error during navigation:", err);
      } finally {
        setIsSaving(false);
      }
    }

    setDirection(1);

    if (currentStep === 1) {
      if (questionnaireStep === 0) {
        const hasJobOrBusiness = responses.reason_for_leaving?.some(r =>
          r.includes('Another Job') || r === 'Business'
        );
        if (hasJobOrBusiness) {
          setQuestionnaireStep(1);
        } else {
          setQuestionnaireStep(2);
        }
        return;
      }

      if (questionnaireStep === 1) {
        setQuestionnaireStep(2);
        return;
      }

      if (questionnaireStep < QUESTIONNAIRE_STEPS_COUNT - 1) {
        setQuestionnaireStep(prev => prev + 1);
        return;
      }

      setCurrentStep(prev => prev + 1);
      return;
    }

    if (currentStep < STEPS.length - 1) {
      if (currentStep === 0) {
        setQuestionnaireStep(0);
      }
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleSaveAndReturn = async () => {
    if (!isStepValid) {
      toast.error("Please complete the required fields.");
      return;
    }

    if (hasUnsavedChanges.current) {
      setIsSaving(true);
      try {
        await saveExitForm({
          resignation_id: resignation.id,
          employee_details: details,
          questionnaire_responses: responses
        });
        // NOTE: Do NOT reset hasUnsavedChanges here.
        // Keep the warning alive until final submit.
      } catch (err) {
        console.error("Save error during Return:", err);
      } finally {
        setIsSaving(false);
      }
    }

    setIsEditingFromSummary(false);
    setCurrentStep(3); // Jump back to Summary
  };

  const handleBack = () => {
    setDirection(-1);

    if (currentStep === 1) {
      if (questionnaireStep > 0) {
        if (questionnaireStep === 2) {
          const hasJobOrBusiness = responses.reason_for_leaving?.some(r =>
            r.includes('Another Job') || r === 'Business'
          );
          if (!hasJobOrBusiness) {
            setQuestionnaireStep(0);
            return;
          }
        }

        setQuestionnaireStep(prev => prev - 1);
        return;
      }

      setCurrentStep(prev => prev - 1);
      return;
    }

    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 50 : -50,
      opacity: 0,
    }),
    center: { zIndex: 1, x: 0, opacity: 1 },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 50 : -50,
      opacity: 0,
    }),
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 pb-12">
      {/* Locked Banner */}
      {readOnly && (
        <div className="bg-amber-500/10 border border-amber-500/50 rounded-lg p-4 flex items-center gap-3 text-amber-600 dark:text-amber-400 animate-in slide-in-from-top-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-lock"><rect width="18" height="11" x="3" y="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
          <div className="flex-1">
            <h4 className="font-semibold text-sm">Form Locked</h4>
            <p className="text-xs opacity-90">This form is locked for review because your interview is scheduled within 24 hours.</p>
          </div>
        </div>
      )}

      {/* Progress Bar & Header - Hide progress bar if readOnly */}
      {!readOnly && (
        <div className="space-y-4">
          <div className="flex justify-between items-end">
            <div className="space-y-1">
              <h1 className="text-2xl font-bold tracking-tight">Exit Form</h1>
              <p className="text-sm text-muted-foreground">{STEPS[currentStep].title}</p>
            </div>
            <div className="text-right space-y-1">
              <div className="flex items-center gap-2 justify-end text-xs font-medium text-muted-foreground mb-1">
                {isSaving ? (
                  <span className="flex items-center gap-1"><Loader2 className="w-3 h-3 animate-spin" /> Saving...</span>
                ) : (
                  <span className="flex items-center gap-1 text-green-500"><CheckCircle2 className="w-3 h-3" /> Saved</span>
                )}
                <span className="ml-2">{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-2 w-48" />
            </div>
          </div>
        </div>
      )}

      <Card className="shadow-xl border-primary/5 overflow-hidden flex flex-col bg-card/50 backdrop-blur-sm">
        <CardHeader className="bg-muted/30 border-b py-4">
          <CardTitle className="text-lg flex items-center gap-3">
            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-xs shadow-inner">
              {currentStep + 1}
            </span>
            {STEPS[currentStep].title}
          </CardTitle>
        </CardHeader>

        <CardContent className="flex-grow p-8 relative min-h-[450px]">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={currentStep}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                x: { type: "spring", stiffness: 300, damping: 30 },
                opacity: { duration: 0.2 },
              }}
              className="w-full"
            >
              {currentStep === 0 && (
                <FieldGroup className="grid grid-cols-1 md:grid-cols-2 gap-6 py-2">
                  <Field>
                    <FieldLabel htmlFor="employee_name">Full Name</FieldLabel>
                    <Input
                      id="employee_name"
                      placeholder="Juan Dela Cruz"
                      value={details.employee_name}
                      onChange={(e) => updateDetail('employee_name', e.target.value)}
                    />
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="employee_number">Employee Number</FieldLabel>
                    <Input
                      id="employee_number"
                      placeholder="EMP-001"
                      value={details.employee_number}
                      onChange={(e) => updateDetail('employee_number', e.target.value)}
                    />
                  </Field>

                  <DatePicker
                    label="Date of Hire"
                    id="date_hired"
                    date={details.date_hired ? new Date(details.date_hired) : undefined}
                    onChange={(date) => updateDetail('date_hired', date?.toISOString() || '')}
                    placeholder="Pick hire date"
                  />

                  <DatePicker
                    label="Date of Resignation"
                    id="date_of_resignation"
                    date={details.date_of_resignation ? new Date(details.date_of_resignation) : undefined}
                    onChange={(date) => updateDetail('date_of_resignation', date?.toISOString() || '')}
                    placeholder="Pick resignation date"
                    disabled={true}
                  />

                  <Field>
                    <FieldLabel htmlFor="pos_hired">Position when Hired</FieldLabel>
                    <Select
                      value={details.position_when_hired}
                      onValueChange={(val) => updateDetail('position_when_hired', val)}
                    >
                      <SelectTrigger id="pos_hired">
                        <SelectValue placeholder="Select position" />
                      </SelectTrigger>
                      <SelectContent>
                        {positions.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="pos_current">Current Position</FieldLabel>
                    <Select
                      value={details.current_position}
                      onValueChange={(val) => updateDetail('current_position', val)}
                    >
                      <SelectTrigger id="pos_current">
                        <SelectValue placeholder="Select position" />
                      </SelectTrigger>
                      <SelectContent>
                        {positions.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="department">Department</FieldLabel>
                    <Select
                      value={details.department}
                      onValueChange={(val) => updateDetail('department', val)}
                    >
                      <SelectTrigger id="department">
                        <SelectValue placeholder="Select department" />
                      </SelectTrigger>
                      <SelectContent>
                        {departments.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="business_unit">Business Unit</FieldLabel>
                    <Select
                      value={details.business_unit}
                      onValueChange={(val) => updateDetail('business_unit', val)}
                    >
                      <SelectTrigger id="business_unit">
                        <SelectValue placeholder="Select business unit" />
                      </SelectTrigger>
                      <SelectContent>
                        {businessUnits.map(bu => <SelectItem key={bu} value={bu}>{bu}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="intermediate_supervisor">Department/Immediate Supervisor</FieldLabel>
                    <Select
                      value={details.intermediate_supervisor}
                      onValueChange={(val) => updateDetail('intermediate_supervisor', val)}
                    >
                      <SelectTrigger id="intermediate_supervisor">
                        <SelectValue placeholder="Select supervisor" />
                      </SelectTrigger>
                      <SelectContent>
                        {supervisors.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </Field>
                </FieldGroup>
              )}

              {currentStep === 1 && (
                <div className="space-y-6 py-2">
                  <div className="text-center mb-6">
                    <h3 className="text-xl font-bold tracking-tight text-primary">
                      Question {questionnaireStep + 1} of {QUESTIONNAIRE_STEPS_COUNT}
                    </h3>
                  </div>

                  {/* Step 2.1: Reason for Leaving */}
                  {questionnaireStep === 0 && (
                    <div className="space-y-4 max-w-3xl mx-auto animate-in fade-in slide-in-from-right-4">
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <h4 className="text-lg font-medium">What is your primary reason for leaving? (Select up to 3 that apply most)</h4>
                          <p className="text-xs text-muted-foreground mt-1">You can only select up to 3 reasons.</p>
                        </div>
                        <div className={cn(
                          "shrink-0 text-xs font-semibold px-2.5 py-1 rounded-full border tabular-nums transition-colors",
                          (responses.reason_for_leaving?.length || 0) >= MAX_REASONS
                            ? "bg-amber-500/10 border-amber-500/40 text-amber-400"
                            : "bg-muted border-border text-muted-foreground"
                        )}>
                          {responses.reason_for_leaving?.length || 0} / {MAX_REASONS}
                        </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {[
                          "Another Job",
                          "Business",
                          "Family Reasons",
                          "Health",
                          "Personal Reason",
                          "Continue to Study",
                          "Practice Profession",
                          "Dislike company procedure",
                          "Differences/Difficulty with Superior",
                          "Differences/Difficulty with Co-Employees"
                        ].map((option) => {
                          const isSelected = responses.reason_for_leaving?.some(r => r.startsWith(option));
                          const isAtCap = (responses.reason_for_leaving?.length || 0) >= MAX_REASONS;
                          const isDisabled = !isSelected && isAtCap;
                          return (
                            <Button
                              key={option}
                              variant={isSelected ? "default" : "outline"}
                              className={cn(
                                "h-auto py-3 justify-start px-4 text-left whitespace-normal transition-all",
                                !isDisabled && "hover:scale-[1.01]",
                                isDisabled && "opacity-40 cursor-not-allowed"
                              )}
                              onClick={() => handleReasonToggle(option)}
                              disabled={isDisabled}
                            >
                              <div className="flex items-center gap-2 w-full">
                                <div className={cn(
                                  "w-4 h-4 rounded border flex items-center justify-center transition-colors",
                                  isSelected
                                    ? "bg-primary-foreground border-primary-foreground"
                                    : "border-muted-foreground"
                                )}>
                                  {isSelected && <CheckCircle2 className="w-3 h-3 text-primary" />}
                                </div>
                                {option}
                              </div>
                            </Button>
                          );
                        })}
                      </div>

                      {/* Logic for Another Job sub-options */}
                      {responses.reason_for_leaving?.some(r => r.includes("Another Job")) && (
                        <div className="p-4 bg-muted/30 rounded-lg space-y-4 border border-primary/20 animate-in fade-in zoom-in-95">
                          <p className="text-sm font-medium">Where is this new job located?</p>
                          <div className="flex gap-4">
                            <Button
                              variant={responses.reason_for_leaving.includes("Another Job (Local)") ? "default" : "outline"}
                              size="sm"
                              onClick={() => {
                                const current = responses.reason_for_leaving || [];
                                const withoutJob = current.filter(r => !r.includes("Another Job"));
                                updateResponse({ reason_for_leaving: [...withoutJob, "Another Job (Local)"] });
                              }}
                            >
                              Local
                            </Button>
                            <Button
                              variant={responses.reason_for_leaving.includes("Another Job (Abroad)") ? "default" : "outline"}
                              size="sm"
                              onClick={() => {
                                const current = responses.reason_for_leaving || [];
                                const withoutJob = current.filter(r => !r.includes("Another Job"));
                                updateResponse({ reason_for_leaving: [...withoutJob, "Another Job (Abroad)"] });
                              }}
                            >
                              Abroad
                            </Button>
                          </div>

                          {responses.reason_for_leaving?.some(r => r === "Another Job") && (
                            <p className="text-xs text-destructive animate-pulse font-medium flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-destructive inline-block" />
                              Please specify Local or Abroad to proceed.
                            </p>
                          )}

                          {/* Abroad selected but no country chosen yet */}
                          {responses.reason_for_leaving.includes("Another Job (Abroad)") && !responses.reason_for_leaving_country && (
                            <p className="text-xs text-amber-400 animate-pulse font-medium flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block" />
                              Please select the country of your new job to proceed.
                            </p>
                          )}

                          {responses.reason_for_leaving.includes("Another Job (Abroad)") && (
                            <div className="space-y-2 pt-2 animate-in fade-in slide-in-from-top-2">
                              <FieldLabel>Which country?</FieldLabel>
                              <Popover open={countryOpen} onOpenChange={setCountryOpen}>
                                <PopoverTrigger asChild>
                                  <Button
                                    variant="outline"
                                    role="combobox"
                                    aria-expanded={countryOpen}
                                    className="w-full sm:w-80 justify-between"
                                  >
                                    {responses.reason_for_leaving_country
                                      ? responses.reason_for_leaving_country
                                      : "Select country..."}
                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                  </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-[300px] p-0 h-[300px]">
                                  <Command>
                                    <CommandInput placeholder="Search country..." />
                                    <CommandList>
                                      <CommandEmpty>No country found.</CommandEmpty>
                                      <CommandGroup>
                                        {COUNTRIES.map((country) => (
                                          <CommandItem
                                            key={country}
                                            value={country}
                                            onSelect={() => {
                                              updateResponse({ reason_for_leaving_country: country });
                                              setCountryOpen(false);
                                            }}
                                          >
                                            <Check
                                              className={cn(
                                                "mr-2 h-4 w-4",
                                                responses.reason_for_leaving_country === country ? "opacity-100" : "opacity-0"
                                              )}
                                            />
                                            {country}
                                          </CommandItem>
                                        ))}
                                      </CommandGroup>
                                    </CommandList>
                                  </Command>
                                </PopoverContent>
                              </Popover>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Step 2.2: Why More Desirable */}
                  {questionnaireStep === 1 && (
                    <div className="space-y-6 max-w-lg mx-auto animate-in fade-in slide-in-from-right-4">
                      <h4 className="text-lg font-medium text-center">Why is the new position more desirable? (Select all that apply)</h4>
                      <div className="flex flex-col gap-3">
                        {[
                          "Higher salary",
                          "More convenient location",
                          "Job more suited to line of interest",
                          "Greater opportunity for career growth"
                        ].map((option) => (
                          <Button
                            key={option}
                            variant={responses.why_more_desirable?.includes(option) ? "default" : "outline"}
                            className="justify-between h-auto min-h-[3.5rem] py-4 text-base px-6 whitespace-normal text-left"
                            onClick={() => toggleSelection('why_more_desirable', option)}
                          >
                            <span className="flex-1">{option}</span>
                            {responses.why_more_desirable?.includes(option) && <CheckCircle2 className="w-5 h-5 ml-4 shrink-0" />}
                          </Button>
                        ))}
                      </div>
                      <div className="space-y-2 pt-2">
                        <FieldLabel>Others (Optional)</FieldLabel>
                        <textarea
                          className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          placeholder="Any other reasons..."
                          value={responses.why_more_desirable_other}
                          onChange={(e) => updateResponse({ why_more_desirable_other: e.target.value })}
                        />
                      </div>
                    </div>
                  )}

                  {/* Step 2.3: Career Growth Opportunity */}
                  {questionnaireStep === 2 && (
                    <div className="space-y-6 max-w-lg mx-auto animate-in fade-in slide-in-from-right-4">
                      <h4 className="text-lg font-medium text-center">How would you describe your chances for career growth here?</h4>
                      <div className="flex flex-col gap-3">
                        {[
                          "Very good chance",
                          "Good chances",
                          "Little chances",
                          "Very little",
                          "No chances"
                        ].map((option) => (
                          <Button
                            key={option}
                            variant={responses.career_growth === option ? "default" : "outline"}
                            className="justify-between h-auto min-h-[3.5rem] py-4 text-base px-6 whitespace-normal text-left"
                            onClick={() => updateResponse({ career_growth: option })}
                          >
                            <span className="flex-1">{option}</span>
                            {responses.career_growth === option && <CheckCircle2 className="w-5 h-5 ml-4 shrink-0" />}
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Step 2.4: Rate of Pay */}
                  {questionnaireStep === 3 && (
                    <div className="space-y-6 max-w-lg mx-auto animate-in fade-in slide-in-from-right-4">
                      <h4 className="text-lg font-medium text-center">How would you describe your rate of pay?</h4>
                      <div className="flex flex-col gap-3">
                        {[
                          "Very compensating",
                          "Fair enough",
                          "A bit low",
                          "Very low"
                        ].map((option) => (
                          <Button
                            key={option}
                            variant={responses.rate_of_pay === option ? "default" : "outline"}
                            className="justify-between h-auto min-h-[3.5rem] py-4 text-base px-6 whitespace-normal text-left"
                            onClick={() => updateResponse({ rate_of_pay: option })}
                          >
                            <span className="flex-1">{option}</span>
                            {responses.rate_of_pay === option && <CheckCircle2 className="w-5 h-5 ml-4 shrink-0" />}
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Step 2.5: Benefits */}
                  {questionnaireStep === 4 && (
                    <div className="space-y-6 max-w-lg mx-auto animate-in fade-in slide-in-from-right-4">
                      <h4 className="text-lg font-medium text-center">How were the benefits?</h4>
                      <div className="flex flex-col gap-3 mb-6">
                        {["Very adequate", "Adequate", "Inadequate"].map((option) => (
                          <Button
                            key={option}
                            variant={responses.benefits === option ? "default" : "outline"}
                            className="justify-between h-auto min-h-[3.5rem] py-4 text-base px-6 whitespace-normal text-left"
                            onClick={() => updateResponse({ benefits: option })}
                          >
                            <span className="flex-1">{option}</span>
                            {responses.benefits === option && <CheckCircle2 className="w-5 h-5 ml-4 shrink-0" />}
                          </Button>
                        ))}
                      </div>
                      <div className="space-y-2">
                        <FieldLabel>Comments (Optional)</FieldLabel>
                        <textarea
                          className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          placeholder="Any specific feedback on benefits..."
                          value={responses.benefits_comment}
                          onChange={(e) => updateResponse({ benefits_comment: e.target.value })}
                        />
                      </div>
                    </div>
                  )}

                  {/* Step 2.6: Workload */}
                  {questionnaireStep === 5 && (
                    <div className="space-y-6 max-w-lg mx-auto animate-in fade-in slide-in-from-right-4">
                      <h4 className="text-lg font-medium text-center">How was your workload?</h4>
                      <div className="flex flex-col gap-3 mb-6">
                        {["Too much", "Just enough", "Minimal"].map((option) => (
                          <Button
                            key={option}
                            variant={responses.workload === option ? "default" : "outline"}
                            className="justify-between h-auto min-h-[3.5rem] py-4 text-base px-6 whitespace-normal text-left"
                            onClick={() => updateResponse({ workload: option })}
                          >
                            <span className="flex-1">{option}</span>
                            {responses.workload === option && <CheckCircle2 className="w-5 h-5 ml-4 shrink-0" />}
                          </Button>
                        ))}
                      </div>
                      <div className="space-y-2">
                        <FieldLabel>Comments (Optional)</FieldLabel>
                        <textarea
                          className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          placeholder="Any specific feedback on workload..."
                          value={responses.workload_comment}
                          onChange={(e) => updateResponse({ workload_comment: e.target.value })}
                        />
                      </div>
                    </div>
                  )}

                  {/* Step 2.7: Recommendation */}
                  {questionnaireStep === 6 && (
                    <div className="space-y-6 max-w-lg mx-auto animate-in fade-in slide-in-from-right-4">
                      <h4 className="text-lg font-medium text-center">Would you recommend this company to your friends?</h4>
                      <div className="flex flex-col gap-3 my-6">
                        <Button
                          variant={responses.recommendation === "Yes" ? "default" : "outline"}
                          className="justify-between h-auto min-h-[3.5rem] py-4 text-base px-6 whitespace-normal text-left"
                          onClick={() => updateResponse({ recommendation: "Yes" })}
                        >
                          <span className="flex-1">Yes</span>
                          {responses.recommendation === "Yes" && <CheckCircle2 className="w-5 h-5 ml-4 shrink-0" />}
                        </Button>
                        <Button
                          variant={responses.recommendation === "No" ? "destructive" : "outline"}
                          className="justify-between h-auto min-h-[3.5rem] py-4 text-base px-6 whitespace-normal text-left"
                          onClick={() => updateResponse({ recommendation: "No" })}
                        >
                          <span className="flex-1">No</span>
                          {responses.recommendation === "No" && <CheckCircle2 className="w-5 h-5 ml-4 shrink-0" />}
                        </Button>
                      </div>

                      <div className="space-y-2 pt-2">
                        <FieldLabel>Comments (Optional)</FieldLabel>
                        <textarea
                          className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          placeholder={responses.recommendation ? "Is there anything else you'd like to share?" : "Please select an option above first."}
                          value={responses.recommendation_reason}
                          onChange={(e) => updateResponse({ recommendation_reason: e.target.value })}
                          disabled={!responses.recommendation}
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {currentStep === 2 && (
                <div className="space-y-6 py-4 max-w-2xl mx-auto animate-in fade-in slide-in-from-right-4">
                  <div className="text-center space-y-2 mb-6">
                    <h3 className="text-xl font-bold tracking-tight text-primary">Terms and Conditions</h3>
                    <p className="text-muted-foreground">Please review our data privacy policy</p>
                  </div>

                  <div className="relative">
                    <div
                      className="p-6 rounded-xl border bg-muted/20 shadow-inner space-y-4 max-h-[400px] overflow-y-auto scroll-smooth"
                      onScroll={(e) => {
                        const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
                        if (scrollHeight - scrollTop <= clientHeight + 5) {
                          setCanAcceptTerms(true);
                        }
                      }}
                    >
                      <div className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground space-y-4">
                        <h4 className="font-semibold text-primary">1. Data Privacy Acknowledgment</h4>
                        <p>
                          By submitting this exit interview form, you (&quot;the Employee&quot;) explicitly acknowledge and consent that the information provided herein will be collected, processed, and stored by the Company for the purposes of organizational analysis, retention strategy improvement, and statistical reporting. This collection is conducted in adherence to applicable data privacy laws and company policies regarding employee data handling.
                        </p>

                        <h4 className="font-semibold text-primary">2. Confidentiality & Anonymity</h4>
                        <p>
                          Your individual responses are treated with the highest degree of confidentiality. The Company ensures that access to raw, identifiable data is restricted to authorized personnel within the Human Resources and Executive Management teams strictly on a need-to-know basis.
                        </p>
                        <p>
                          While aggregated data and thematic summaries may be presented to department heads or leadership to drive positive organizational change, your specific feedback—including comments and subjective ratings—will likely be anonymized or aggregated to protect your identity unless verifying specific incidents requires otherwise. Your feedback will NOT be used against you in any future re-employment opportunities or reference checks.
                        </p>

                        <h4 className="font-semibold text-primary">3. Purpose of Collection</h4>
                        <p>
                          The primary goal of this exit interview is to gather honest, constructive feedback to help us build a better workplace for current and future employees. Your insights regarding compensation, management, culture, and workload provide critical data points for our retention intelligence systems.
                        </p>

                        <h4 className="font-semibold text-primary">4. Information Accuracy</h4>
                        <p>
                          You confirm that the information provided in this form, including the reasons for leaving and assessment of company practices, is true, accurate, and voluntarily given. You understand that submitting false or misleading information to intentionally damage the reputation of colleagues or the company is contrary to our core values, though honest, critical feedback is strongly encouraged.
                        </p>

                        <h4 className="font-semibold text-primary">5. Non-Retaliation Policy</h4>
                        <p>
                          The Company maintains a strict non-retaliation policy. No action will be taken against you for expressing dissatisfaction, criticism, or negative feedback regarding your employment experience, provided such feedback is expressed professionally and does not constitute harassment or defamation.
                        </p>

                        <h4 className="font-semibold text-primary">6. Data Retention</h4>
                        <p>
                          Your exit interview data will be retained in the &quot;Eternal Archives&quot; (our secure retention database) for a period necessary to fulfill historical analysis and trend tracking. After such period, data may be permanently anonymized or archived in accordance with our data retention schedule.
                        </p>

                        <h4 className="font-semibold text-primary">7. Electronic Acknowledgment</h4>
                        <p>
                          By checking the box below and clicking &quot;Next,&quot; you digitally sign this document. You certify that you have read this entire agreement, understand its terms, and agree to proceed with the submission of your exit interview data under these conditions.
                        </p>
                      </div>
                    </div>

                    {!canAcceptTerms && (
                      <div className="absolute bottom-4 left-0 right-0 flex justify-center pointer-events-none animate-bounce">
                        <div className="bg-primary text-primary-foreground text-xs font-bold px-4 py-2 rounded-full shadow-lg flex items-center gap-2">
                          <ArrowDown className="w-4 h-4" />
                          Scroll to read
                        </div>
                      </div>
                    )}
                  </div>

                  <div className={cn(
                    "flex items-start space-x-3 p-4 rounded-lg border border-primary/20 bg-primary/5 transition-opacity duration-300",
                    !canAcceptTerms && "opacity-50 cursor-not-allowed"
                  )}>
                    <Checkbox
                      id="terms"
                      checked={consent}
                      onCheckedChange={(checked: CheckedState) => setConsent(checked === true)}
                      disabled={!canAcceptTerms}
                    />
                    <div className="grid gap-1.5 leading-none">
                      <label
                        htmlFor="terms"
                        className={cn(
                          "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
                          canAcceptTerms ? "cursor-pointer" : "cursor-not-allowed"
                        )}
                      >
                        I acknowledge and agree to the terms stated above.
                      </label>
                      <p className={cn(
                        "text-xs mt-1",
                        !canAcceptTerms ? "text-destructive font-medium animate-pulse" : "text-muted-foreground"
                      )}>
                        {!canAcceptTerms
                          ? "Please scroll to the bottom of the terms to proceed."
                          : "You must agree to proceed to the summary."}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 3 && (
                <StepSummary
                  details={details}
                  responses={responses}
                  onEdit={(target, index) => {
                    setIsEditingFromSummary(true);
                    if (target === 'info') setCurrentStep(0);
                    if (target === 'questions') {
                      setCurrentStep(1);
                      setQuestionnaireStep(index ?? 0);
                    }
                    if (target === 'terms') setCurrentStep(2);
                  }}
                  onSubmit={async () => {
                    setIsSaving(true);
                    try {
                      // 1. Final save of data
                      const saveResult = await saveExitForm({
                        resignation_id: resignation.id,
                        employee_details: details,
                        questionnaire_responses: responses,
                        consent_given: consent
                      });

                      if (!saveResult.success) {
                        toast.error("Failed to save final responses: " + saveResult.error);
                        setIsSaving(false);
                        return;
                      }

                      // 1. Mark as final submitting to disable persistent warning
                      isFinalSubmitting.current = true;
                      hasUnsavedChanges.current = false;

                      // 2. Submit formal resignation
                      const submitResult = await submitExitForm(resignation.id);

                      if (submitResult.success) {
                        toast.success("Resignation submitted successfully!");
                        // Sign out and redirect to landing page
                        await fetch('/auth/signout', { method: 'POST' });
                        window.location.href = "/";
                      } else {
                        // Reset if failed
                        isFinalSubmitting.current = false;
                        hasUnsavedChanges.current = true;
                        toast.error("Submission failed: " + submitResult.error);
                      }
                    } catch (error) {
                      isFinalSubmitting.current = false;
                      hasUnsavedChanges.current = true;
                      console.error("Submission error:", error);
                      toast.error("An unexpected error occurred.");
                    } finally {
                      setIsSaving(false);
                    }
                  }}
                  isSubmitting={isSaving}
                  readOnly={readOnly}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </CardContent>

        {currentStep !== 3 && (
          <CardFooter className="flex flex-col-reverse sm:flex-row sm:justify-between gap-4 border-t bg-muted/20 p-6 card-footer-controls">
            <Button
              variant="ghost"
              onClick={handleBack}
              disabled={currentStep === 0}
              className="flex items-center gap-2 w-full sm:w-auto justify-center sm:justify-start"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </Button>

            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              {isEditingFromSummary && (
                <Button
                  variant="outline"
                  onClick={handleSaveAndReturn}
                  className="border-primary/20 hover:bg-primary/5 w-full sm:w-auto"
                >
                  Save & Return
                </Button>
              )}

              <Button
                onClick={handleNext}
                disabled={!isStepValid || isSaving}
                className={cn(
                  "px-8 flex items-center justify-center gap-2 group transition-all duration-200 w-full sm:w-auto",
                  isStepValid
                    ? "hover:bg-primary/90"
                    : "opacity-50 cursor-not-allowed"
                )}
              >
                Next Step
                <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </Button>
            </div>
          </CardFooter>
        )}
      </Card>
    </div>
  );
}