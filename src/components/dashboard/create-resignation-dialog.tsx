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

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000))

        toast.success("Resignation workflow initiated", {
            description: "The employee will receive an email shortly."
        })

        setLoading(false)
        setOpen(false)
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
            <DialogContent className="sm:max-w-[425px] border-white/10 bg-[#0f0f11] text-white">
                <DialogHeader>
                    <DialogTitle>Log New Resignation</DialogTitle>
                    <DialogDescription className="text-zinc-400">
                        Manually initiate the exit process for an employee. They will be invited to complete the Exit Form.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="name" className="text-zinc-300">Employee Name</Label>
                        <Input id="name" placeholder="John Doe" className="border-white/10 bg-white/5 text-white" required />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="email" className="text-zinc-300">Work Email</Label>
                        <Input id="email" type="email" placeholder="john@company.com" className="border-white/10 bg-white/5 text-white" required />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="department" className="text-zinc-300">Department</Label>
                        <Select required>
                            <SelectTrigger className="border-white/10 bg-white/5 text-white">
                                <SelectValue placeholder="Select department" />
                            </SelectTrigger>
                            <SelectContent className="border-white/10 bg-[#18181b] text-white">
                                {departments.map((d) => (
                                    <SelectItem key={d} value={d}>
                                        {d}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <DialogFooter className="mt-4">
                        <Button
                            type="submit"
                            disabled={loading}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white w-full sm:w-auto"
                        >
                            {loading ? "Starting..." : "Start Process"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
