"use client"

import * as React from "react"
import { Plus } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { getDepartments } from "@/app/actions/dashboard"

export function CreateResignationDialog() {
    const [open, setOpen] = React.useState(false)
    const [loading, setLoading] = React.useState(false)
    const [departments, setDepartments] = React.useState<string[]>([])
    const [isMounted, setIsMounted] = React.useState(false)
    const [lastWorkingDay, setLastWorkingDay] = React.useState<string>('') // Simple date string for now

    React.useEffect(() => {
        setIsMounted(true)
    }, [])

    React.useEffect(() => {
        if (open) {
            getDepartments().then(res => {
                if (res.success && res.data) {
                    setDepartments(res.data)
                }
            })
        }
    }, [open])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        const formData = new FormData(e.target as HTMLFormElement)
        const name = formData.get('name') as string
        const email = formData.get('email') as string
        const department = formData.get('department') as string // This might need extracting from Select state if not standard form behavior
        // Actually Radix UI select doesn't always work with FormData natively without hidden input.
        // But since we have state for departments, let's assume we can get it from form if name is set on hidden input, but Shadcn Select usually needs controlled state or hidden input manually.
        // Let's rely on controlled state or simple `e.currentTarget` access if possible.
        // To be safe, let's just grab the values.

        // Wait, standard Shadcn Select doesn't inject hidden input unless we add it. 
        // Let's use controlled state for select.
    }

    // Rewrite component structure to separate form logic or use refs/state.
    // I'll implementing a robust form handling inside based on the previous code.
    // Importing the action at the top.

    // ... logic below in replacement content

    if (!isMounted) return null

    return <CreateResignationDialogContent open={open} setOpen={setOpen} />
}

import { createResignation } from "@/app/actions/resignation-ops"
import { DEPARTMENTS, BUSINESS_UNITS, INTERMEDIATE_SUPERVISORS } from "@/constants/enums"

function CreateResignationDialogContent({ open, setOpen }: { open: boolean, setOpen: (o: boolean) => void }) {
    const [loading, setLoading] = React.useState(false)
    const [selectedDept, setSelectedDept] = React.useState<string>("")
    const [selectedBU, setSelectedBU] = React.useState<string>("")
    const [selectedSupervisor, setSelectedSupervisor] = React.useState<string>("")

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        const formData = new FormData(e.target as HTMLFormElement)
        const name = formData.get('name') as string
        const email = formData.get('email') as string
        const lwd = formData.get('lastWorkingDay') as string

        if (!selectedDept || !selectedBU || !selectedSupervisor) {
            toast.error("Please fill in all required fields")
            setLoading(false)
            return
        }

        const res = await createResignation({
            name,
            email,
            department: selectedDept,
            businessUnit: selectedBU,
            intermediateSupervisor: selectedSupervisor,
            lastWorkingDay: new Date(lwd)
        })

        if (res.success) {
            if (res.emailError) {
                toast.warning("Case logged, but email failed", {
                    description: `Resignation recorded in database, but invitation email could not be sent: ${res.emailErrorMessage}`
                })
            } else {
                toast.success("Resignation workflow initiated", {
                    description: "The employee has been invited via email."
                })
            }
            setOpen(false)
        } else {
            toast.error("Failed to initiate workflow", {
                description: res.error
            })
        }

        setLoading(false)
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button
                    className="gap-2 bg-brand-primary hover:bg-brand-primary/90 text-white shadow-lg shadow-brand-primary/20 rounded-xl px-3 md:px-4"
                    size="sm"
                >
                    <Plus className="h-4 w-4" />
                    <span className="hidden md:inline">Log Resignation</span>
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] border-border bg-background text-foreground rounded-2xl">
                <DialogHeader>
                    <DialogTitle>Log New Resignation</DialogTitle>
                    <DialogDescription className="text-muted-foreground">
                        Manually initiate the exit process. System will invite the employee via email.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="grid gap-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="name" className="text-muted-foreground">Employee Name</Label>
                            <Input id="name" name="name" placeholder="John Doe" className="border-border bg-muted/20 text-foreground" required />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="email" className="text-muted-foreground">Work Email</Label>
                            <Input id="email" name="email" type="email" placeholder="john@company.com" className="border-border bg-muted/20 text-foreground" required />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="department" className="text-muted-foreground">Department</Label>
                            <Select value={selectedDept} onValueChange={setSelectedDept} required>
                                <SelectTrigger className="border-border bg-muted/20 text-foreground">
                                    <SelectValue placeholder="Select Dept" />
                                </SelectTrigger>
                                <SelectContent className="border-border bg-popover text-popover-foreground">
                                    {DEPARTMENTS.map((d) => (
                                        <SelectItem key={d} value={d}>{d}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="businessUnit" className="text-muted-foreground">Business Unit</Label>
                            <Select value={selectedBU} onValueChange={setSelectedBU} required>
                                <SelectTrigger className="border-border bg-muted/20 text-foreground">
                                    <SelectValue placeholder="Select BU" />
                                </SelectTrigger>
                                <SelectContent className="border-border bg-popover text-popover-foreground">
                                    {BUSINESS_UNITS.map((bu) => (
                                        <SelectItem key={bu} value={bu}>{bu}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="supervisor" className="text-muted-foreground">Intermediate Supervisor</Label>
                        <Select value={selectedSupervisor} onValueChange={setSelectedSupervisor} required>
                            <SelectTrigger className="border-border bg-muted/20 text-foreground">
                                <SelectValue placeholder="Select Supervisor" />
                            </SelectTrigger>
                            <SelectContent className="border-border bg-popover text-popover-foreground">
                                {INTERMEDIATE_SUPERVISORS.map((s) => (
                                    <SelectItem key={s} value={s}>{s}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="lastWorkingDay" className="text-muted-foreground">Last Working Day</Label>
                        <Input id="lastWorkingDay" name="lastWorkingDay" type="date" className="border-border bg-muted/20 text-foreground" required />
                    </div>
                    <DialogFooter className="mt-4">
                        <Button
                            type="submit"
                            disabled={loading}
                            className="bg-brand-primary hover:bg-brand-primary/90 text-white w-full sm:w-auto"
                        >
                            {loading ? "Processing..." : "Start Process"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
