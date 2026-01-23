import { Database } from "@/lib/database.types"
import { StarRating } from "../../ui/star-rating"
import { Textarea } from "../../ui/textarea"
import { Label } from "../../ui/label"
import { Badge } from "../../ui/badge"

type Question = Database['public']['Tables']['questions']['Row']

interface ResponseData {
    rating?: number
    responseText?: string
}

interface StepQuestionnaireProps {
    questions: Question[]
    responses: Record<string, ResponseData>
    onResponseChange: (questionId: string, data: Partial<ResponseData>) => void
}

export function StepQuestionnaire({
    questions,
    responses,
    onResponseChange
}: StepQuestionnaireProps) {
    // Group questions by category
    const groupedQuestions = questions.reduce((acc, question) => {
        const category = question.category || 'General'
        if (!acc[category]) {
            acc[category] = []
        }
        acc[category].push(question)
        return acc
    }, {} as Record<string, Question[]>)

    const categories = Object.keys(groupedQuestions)

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {categories.map(category => (
                <div key={category} className="space-y-4">
                    <div className="flex items-center gap-2 pb-2 border-b border-border">
                        <Badge variant="secondary" className="capitalize">
                            {category}
                        </Badge>
                    </div>

                    <div className="grid gap-6">
                        {groupedQuestions[category].map(question => {
                            const response = responses[question.id] || {}
                            return (
                                <div key={question.id} className="bg-muted/30 p-4 rounded-lg border border-border space-y-3">
                                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                                        <Label className="text-base font-medium leading-relaxed md:w-2/3">
                                            {question.text}
                                        </Label>
                                        <div className="flex-shrink-0">
                                            <StarRating
                                                value={response.rating || 0}
                                                onChange={(val) => onResponseChange(question.id, { rating: val })}
                                            />
                                        </div>
                                    </div>

                                    <Textarea
                                        placeholder="Optional additional comments..."
                                        value={response.responseText || ''}
                                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => onResponseChange(question.id, { responseText: e.target.value })}
                                        className="bg-background resize-none text-sm h-20"
                                    />
                                </div>
                            )
                        })}
                    </div>
                </div>
            ))}

            {questions.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                    No active questions found.
                </div>
            )}
        </div>
    )
}
