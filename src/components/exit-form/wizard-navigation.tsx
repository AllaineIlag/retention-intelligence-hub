import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"

interface WizardNavigationProps {
    onBack: () => void
    onNext: () => void
    isBackDisabled?: boolean
    isNextDisabled?: boolean
    isSubmitting?: boolean
    backLabel?: string
    nextLabel?: string
}

export function WizardNavigation({
    onBack,
    onNext,
    isBackDisabled = false,
    isNextDisabled = false,
    isSubmitting = false,
    backLabel = "Back",
    nextLabel = "Next"
}: WizardNavigationProps) {
    return (
        <div className="mt-8 flex flex-col-reverse gap-3 md:flex-row md:justify-between border-t border-slate-100 pt-6">
            <Button
                variant="ghost"
                onClick={onBack}
                disabled={isBackDisabled || isSubmitting}
                className="w-full md:w-auto text-slate-500 hover:text-slate-700 hover:bg-slate-100"
            >
                {backLabel}
            </Button>

            <Button
                onClick={onNext}
                disabled={isNextDisabled || isSubmitting}
                className="w-full md:w-auto bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm"
            >
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {nextLabel}
            </Button>
        </div>
    )
}
