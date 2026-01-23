import { ReactNode } from "react"
import { WizardProgress } from "./wizard-progress"
import { motion, AnimatePresence } from "framer-motion"

interface WizardLayoutProps {
    children: ReactNode
    currentStep: number
    totalSteps: number
    title: string
    description?: string
    steps: { id: string; label: string }[]
}

export function WizardLayout({
    children,
    currentStep,
    totalSteps,
    title,
    description,
    steps
}: WizardLayoutProps) {
    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 sm:p-6 md:p-8">
            <div className="w-full max-w-4xl space-y-6">

                {/* Progress Header */}
                <div className="w-full">
                    <WizardProgress
                        currentStep={currentStep}
                        totalSteps={totalSteps}
                        steps={steps}
                    />
                </div>

                {/* Main Card */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="w-full bg-white rounded-xl shadow-lg border border-slate-100 overflow-hidden"
                >
                    <div className="p-6 md:p-8">
                        <div className="mb-6">
                            <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
                            {description && (
                                <p className="text-slate-500 mt-2">{description}</p>
                            )}
                        </div>

                        {/* Content Area with Transition */}
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={currentStep}
                                initial={{ opacity: 0, x: 10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -10 }}
                                transition={{ duration: 0.2 }}
                            >
                                {children}
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </motion.div>

                {/* Footer / Copyright / Safe Language */}
                <div className="text-center text-xs text-slate-400">
                    <p>Protected by Retention Intelligence System v6.0</p>
                </div>
            </div>
        </div>
    )
}
