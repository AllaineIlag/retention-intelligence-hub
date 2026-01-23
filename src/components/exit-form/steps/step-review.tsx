"use client"

import { Database } from "@/lib/database.types"
import { Badge } from "../../ui/badge"
import { Separator } from "../../ui/separator"
import { format } from "date-fns"
import { Star } from "lucide-react"

type Resignation = Database['public']['Tables']['resignations']['Row']
type Question = Database['public']['Tables']['questions']['Row']

interface StepReviewProps {
    resignation: Resignation
    responses: Record<string, { rating?: number, responseText?: string }>
    questions: Question[]
}

export function StepReview({ resignation, responses, questions }: StepReviewProps) {
    // Group questions by category for better display
    const questionsByCategory = questions.reduce((acc, question) => {
        if (!acc[question.category]) {
            acc[question.category] = []
        }
        acc[question.category].push(question)
        return acc
    }, {} as Record<string, Question[]>)

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Section 1: Employee Details */}
            <div className="rounded-lg border border-border bg-card shadow-sm overflow-hidden">
                <div className="bg-muted px-4 py-3 border-b border-border">
                    <h3 className="font-semibold">Resignation Details</h3>
                </div>
                <div className="p-4 grid gap-4 sm:grid-cols-2">
                    <div className="space-y-1">
                        <label className="text-xs font-medium text-muted-foreground uppercase">Exit Date</label>
                        <p className="text-sm font-medium">
                            {resignation.exit_date ? format(new Date(resignation.exit_date), 'MMMM d, yyyy') : 'Not set'}
                        </p>
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs font-medium text-muted-foreground uppercase">Primary Reason</label>
                        <p className="text-sm font-medium">
                            {resignation.reason || 'Not specified'}
                        </p>
                    </div>
                </div>
            </div>

            {/* Section 2: Questionnaire Response */}
            <div className="rounded-lg border border-border bg-card shadow-sm overflow-hidden">
                <div className="bg-muted px-4 py-3 border-b border-border">
                    <h3 className="font-semibold">Your Feedback</h3>
                </div>
                <div className="p-4 space-y-6">
                    {Object.entries(questionsByCategory).map(([category, categoryQuestions]) => (
                        <div key={category} className="space-y-3">
                            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                                <Badge variant="outline" className="capitalize">{category}</Badge>
                            </h4>
                            <div className="space-y-4 pl-1">
                                {categoryQuestions.map((q) => {
                                    const resp = responses[q.id] || {}
                                    return (
                                        <div key={q.id} className="grid gap-2 border-b border-border last:border-0 pb-3 last:pb-0">
                                            <p className="text-sm">{q.text}</p>
                                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                                                <div className="flex items-center gap-0.5" aria-label={`Rating: ${resp.rating} out of 5`}>
                                                    {[1, 2, 3, 4, 5].map((star) => (
                                                        <Star
                                                            key={star}
                                                            className={`w-4 h-4 ${(resp.rating || 0) >= star
                                                                ? "fill-yellow-400 text-yellow-400"
                                                                : "text-muted"
                                                                }`}
                                                        />
                                                    ))}
                                                    <span className="ml-2 text-xs text-muted-foreground font-medium">
                                                        {resp.rating ? `${resp.rating}/5` : 'No rating'}
                                                    </span>
                                                </div>
                                            </div>
                                            {resp.responseText && (
                                                <div className="bg-muted p-2 rounded text-xs text-muted-foreground italic border border-border mt-1">
                                                    &quot;{resp.responseText}&quot;
                                                </div>
                                            )}
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="rounded-lg bg-primary/10 p-4 border border-primary/20 text-primary text-sm flex gap-3 items-start">
                <div className="shrink-0 mt-0.5">ℹ️</div>
                <div>
                    Please review your responses above. Once you click &quot;Submit&quot;, your exit interview will be finalized and sent to HR for review. You will not be able to follow up or edit these responses after submission.
                </div>
            </div>
        </div>
    )
}
