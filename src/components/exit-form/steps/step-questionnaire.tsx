import { Database } from "@/lib/database.types"
import { StarRating } from "../../ui/star-rating"
import { Textarea } from "../../ui/textarea"
import { Label } from "../../ui/label"
import { Badge } from "../../ui/badge"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"

type Question = Database['public']['Tables']['questions']['Row']

interface ResponseData {
    rating?: number
    responseText?: string
    selectedOptions?: string[]
}

interface StepQuestionnaireProps {
    resignationReason: string | null
    onReasonChange: (reason: string) => void
    questions: Question[]
    responses: Record<string, ResponseData>
    onResponseChange: (questionId: string, data: Partial<ResponseData>) => void
}

export function StepQuestionnaire({
    resignationReason,
    onReasonChange,
    questions,
    responses,
    onResponseChange
}: StepQuestionnaireProps) {

    // 1. Reason for Leaving Logic
    const mainReasons = [
        "Another Job", "Business", "Family Reasons", "Health",
        "Personal Reason", "Continue to Study", "Practice Profession",
        "Dislike company procedure", "Differences/Difficulty with Superior",
        "Differences/Difficulty with Co-Employees"
    ]

    const handleReasonChange = (val: string) => {
        onReasonChange(val)
    }

    // Secondary reason logic (Local/Abroad)
    // We'll treat "Another Job - Local" as the string value if selected
    const isAnotherJob = resignationReason?.startsWith("Another Job")
    const isBusiness = resignationReason === "Business"

    // 2. "Why desirable?" Options
    const desirableOptions = [
        "Higher salary",
        "More convenient location",
        "Job more suited to line of interest",
        "Greater opportunity for career growth",
        "Others"
    ]

    // 3. Likert Scale Questions (Mapping hardcoded text to what might be in DB, or just hardcoding display)
    // We will assume 'questions' prop contains these, or we render manual sections if ID matching is tricky.
    // For this refactor, let's render the sections manually to ensure exact text match, 
    // and map them to assumed IDs or generic keys if real DB Qs aren't there.
    // Ideally we use the DB questions. Let's assume the DB has been seeded or we treat them as hardcoded for UI demo.

    // We will perform a hybrid approach: Render specific sections, and try to find a matching Q in the prop to bind ID.
    // If not found, we use a placeholder ID.
    const getQId = (textStart: string) => questions.find(q => q.text.startsWith(textStart))?.id || textStart

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">

            {/* SECTION 1: Reason for Leaving */}
            <div className="space-y-4 border p-4 rounded-lg bg-card">
                <Badge className="mb-2">Part 1</Badge>
                <Label className="text-lg font-semibold block">What is/are your reason for leaving?</Label>

                <RadioGroup value={resignationReason?.split(" - ")[0]} onValueChange={handleReasonChange} className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    {mainReasons.map(reason => (
                        <div key={reason} className="flex items-center space-x-2">
                            <RadioGroupItem value={reason} id={reason} />
                            <Label htmlFor={reason} className="font-normal cursor-pointer">{reason}</Label>
                        </div>
                    ))}
                </RadioGroup>

                {/* Nested: Another Job */}
                {resignationReason?.startsWith("Another Job") && (
                    <div className="ml-6 mt-3 p-4 bg-muted/50 rounded-md space-y-3">
                        <Label className="font-medium">Location of new job:</Label>
                        <RadioGroup
                            value={resignationReason}
                            onValueChange={onReasonChange}
                            className="flex flex-col space-y-2"
                        >
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="Another Job - Local" id="local" />
                                <Label htmlFor="local">Local</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="Another Job - Abroad" id="abroad" />
                                <Label htmlFor="abroad">Abroad</Label>
                            </div>
                        </RadioGroup>
                    </div>
                )}
            </div>

            {/* SECTION 2: Why Desirable? (Conditional) */}
            {(isAnotherJob || isBusiness) && (
                <div className="space-y-4 border p-4 rounded-lg bg-card">
                    <Badge className="mb-2">Part 2</Badge>
                    <Label className="text-lg font-semibold block">
                        If your reason is another job or business, why do you consider it more desirable?
                    </Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                        {desirableOptions.map(opt => (
                            <div key={opt} className="flex items-center space-x-2">
                                <Checkbox id={opt}
                                // Placeholder logic for multi-select binding
                                // checked={responses['desirable']?.selectedOptions?.includes(opt)}
                                // onCheckedChange={(checked) => ...}
                                />
                                <Label htmlFor={opt} className="font-normal">{opt}</Label>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <Separator />

            {/* SECTION 3: Rating Questions */}
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Experience Assessment</h3>
                    <Badge variant="outline">Part 3</Badge>
                </div>

                <div className="grid gap-6">
                    {/* Career Growth */}
                    <div className="bg-muted/30 p-4 rounded-lg border border-border space-y-3">
                        <Label className="text-base font-medium">How did you feel about the opportunity for career growth?</Label>
                        <Select>
                            <SelectTrigger className="bg-background"><SelectValue placeholder="Select..." /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Very good chance">Very good chance</SelectItem>
                                <SelectItem value="Good chances">Good chances depending on performance</SelectItem>
                                <SelectItem value="Little chances">Little chances but still hopeful</SelectItem>
                                <SelectItem value="Very little chances">Very little chances</SelectItem>
                                <SelectItem value="No chances">No chances</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Pay */}
                    <div className="bg-muted/30 p-4 rounded-lg border border-border space-y-3">
                        <Label className="text-base font-medium">How did you feel about the rate of pay?</Label>
                        <Select>
                            <SelectTrigger className="bg-background"><SelectValue placeholder="Select..." /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Very compensating">Very compensating</SelectItem>
                                <SelectItem value="Fair enough">Fair enough</SelectItem>
                                <SelectItem value="A bit low">A bit low although acceptable</SelectItem>
                                <SelectItem value="Very low">Very low, not commensurate to job/load</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Benefits */}
                    <div className="bg-muted/30 p-4 rounded-lg border border-border space-y-3">
                        <Label className="text-base font-medium">How did you feel about the benefits?</Label>
                        <Select>
                            <SelectTrigger className="bg-background"><SelectValue placeholder="Select..." /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Very adequate">Very adequate</SelectItem>
                                <SelectItem value="Adequate">Adequate</SelectItem>
                                <SelectItem value="Inadequate">Inadequate</SelectItem>
                            </SelectContent>
                        </Select>
                        <Textarea placeholder="Other comments, if any..." className="bg-background h-20 resize-none" />
                    </div>

                    {/* Work Amount */}
                    <div className="bg-muted/30 p-4 rounded-lg border border-border space-y-3">
                        <Label className="text-base font-medium">How did you feel about the amount of work?</Label>
                        <Select>
                            <SelectTrigger className="bg-background"><SelectValue placeholder="Select..." /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Too much work">Too much work</SelectItem>
                                <SelectItem value="Just enough load">Just enough load</SelectItem>
                                <SelectItem value="Minimal work">Minimal work</SelectItem>
                            </SelectContent>
                        </Select>
                        <Textarea placeholder="Other comments, if any..." className="bg-background h-20 resize-none" />
                    </div>
                </div>
            </div>

            {/* SECTION 4: Recommendation */}
            <div className="space-y-4 border p-4 rounded-lg bg-card">
                <Label className="text-lg font-semibold block">Would you recommend to a friend as a place to work?</Label>
                <RadioGroup className="flex space-x-6 mt-2">
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="Yes" id="rec-yes" />
                        <Label htmlFor="rec-yes">Yes</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="No" id="rec-no" />
                        <Label htmlFor="rec-no">No</Label>
                    </div>
                </RadioGroup>
                <Textarea placeholder="What management policies/practice would you highlight? OR Why not?" className="bg-background mt-4" />
            </div>

        </div>
    )
}
