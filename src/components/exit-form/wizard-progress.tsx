import { cn } from "@/lib/utils"
// We'll use shadcn Progress if available, or build a simple one
import { Check } from "lucide-react"

interface WizardProgressProps {
    currentStep: number
    totalSteps: number
    steps: { id: string; label: string }[]
}

export function WizardProgress({ currentStep, totalSteps, steps }: WizardProgressProps) {
    const progressPercentage = (currentStep / totalSteps) * 100

    return (
        <div className="w-full space-y-4">
            {/* Mobile View: Simple Progress Bar */}
            <div className="block md:hidden space-y-2">
                <div className="flex justify-between text-sm font-medium text-slate-600">
                    <span>Step {currentStep} of {totalSteps}</span>
                    <span className="text-slate-400">{Math.round(progressPercentage)}%</span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-primary transition-all duration-500 ease-in-out"
                        style={{ width: `${progressPercentage}%` }}
                    />
                </div>
            </div>

            {/* Desktop View: Stepper */}
            <div className="hidden md:flex justify-between items-center relative">
                {/* Connecting Line */}
                <div className="absolute top-4 left-0 w-full h-0.5 bg-slate-100 -z-10" />

                {steps.map((step, index) => {
                    const stepNumber = index + 1
                    const isCompleted = stepNumber < currentStep
                    const isActive = stepNumber === currentStep

                    return (
                        <div key={step.id} className="flex flex-col items-center gap-2 bg-white px-2">
                            <div className={cn(
                                "flex h-8 w-8 items-center justify-center rounded-full border-2 transition-colors duration-300",
                                isCompleted ? "bg-primary border-primary text-primary-foreground" :
                                    isActive ? "border-primary text-primary bg-white" :
                                        "border-slate-200 text-slate-300 bg-white"
                            )}>
                                {isCompleted ? (
                                    <Check className="h-4 w-4" />
                                ) : (
                                    <span className="text-sm font-medium">{stepNumber}</span>
                                )}
                            </div>
                            <span className={cn(
                                "text-xs font-medium transition-colors duration-300",
                                isActive ? "text-primary" : "text-slate-500"
                            )}>
                                {step.label}
                            </span>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
