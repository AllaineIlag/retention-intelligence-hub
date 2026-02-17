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
                    className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/20 rounded-xl"
                >
                    <Plus className="h-4 w-4" />
                    <span>Log Resignation</span>
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] border-white/10 bg-[#0f0f11] text-white">
                <DialogHeader>
                    <DialogTitle>Log New Resignation</DialogTitle>
                    <DialogDescription className="text-zinc-400">
                        Manually initiate the exit process. System will invite the employee via email.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="grid gap-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="name" className="text-zinc-300">Employee Name</Label>
                            <Input id="name" name="name" placeholder="John Doe" className="border-white/10 bg-white/5 text-white" required />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="email" className="text-zinc-300">Work Email</Label>
                            <Input id="email" name="email" type="email" placeholder="john@company.com" className="border-white/10 bg-white/5 text-white" required />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="department" className="text-zinc-300">Department</Label>
                            <Select value={selectedDept} onValueChange={setSelectedDept} required>
                                <SelectTrigger className="border-white/10 bg-white/5 text-white">
                                    <SelectValue placeholder="Select Dept" />
                                </SelectTrigger>
                                <SelectContent className="border-white/10 bg-[#18181b] text-white">
                                    {DEPARTMENTS.map((d) => (
                                        <SelectItem key={d} value={d}>{d}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="businessUnit" className="text-zinc-300">Business Unit</Label>
                            <Select value={selectedBU} onValueChange={setSelectedBU} required>
                                <SelectTrigger className="border-white/10 bg-white/5 text-white">
                                    <SelectValue placeholder="Select BU" />
                                </SelectTrigger>
                                <SelectContent className="border-white/10 bg-[#18181b] text-white">
                                    {BUSINESS_UNITS.map((bu) => (
                                        <SelectItem key={bu} value={bu}>{bu}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="supervisor" className="text-zinc-300">Intermediate Supervisor</Label>
                        <Select value={selectedSupervisor} onValueChange={setSelectedSupervisor} required>
                            <SelectTrigger className="border-white/10 bg-white/5 text-white">
                                <SelectValue placeholder="Select Supervisor" />
                            </SelectTrigger>
                            <SelectContent className="border-white/10 bg-[#18181b] text-white">
                                {INTERMEDIATE_SUPERVISORS.map((s) => (
                                    <SelectItem key={s} value={s}>{s}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="lastWorkingDay" className="text-zinc-300">Last Working Day</Label>
                        <Input id="lastWorkingDay" name="lastWorkingDay" type="date" className="border-white/10 bg-white/5 text-white" required />
                    </div>
                    <DialogFooter className="mt-4">
                        <Button
                            type="submit"
                            disabled={loading}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white w-full sm:w-auto"
                        >
                            {loading ? "Processing..." : "Start Process"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
