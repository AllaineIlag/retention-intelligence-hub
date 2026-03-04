"use client"

import * as React from "react"
import { Plus, Search, Loader2, UserCheck, X } from "lucide-react"
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
import { searchDirectory } from "@/app/actions/directory"
import { createResignation } from "@/app/actions/resignation-ops"
import { getDepartments, getBusinessUnits, getSupervisors } from "@/app/actions/settings-actions"
import { useDebounce } from "@/hooks/use-debounce"
import { Badge } from "@/components/ui/badge"

export function CreateResignationDialog() {
    const [open, setOpen] = React.useState(false)
    const [isMounted, setIsMounted] = React.useState(false)

    React.useEffect(() => {
        setIsMounted(true)
    }, [])

    if (!isMounted) return null

    return <CreateResignationDialogContent open={open} setOpen={setOpen} />
}

function CreateResignationDialogContent({ open, setOpen }: { open: boolean, setOpen: (o: boolean) => void }) {
    const [loading, setLoading] = React.useState(false)
    const [searchQuery, setSearchQuery] = React.useState("")
    const [searchResults, setSearchResults] = React.useState<any[]>([])
    const [isSearching, setIsSearching] = React.useState(false)
    const [selectedEmployee, setSelectedEmployee] = React.useState<any | null>(null)
    const [lastWorkingDay, setLastWorkingDay] = React.useState("")

    // Explicitly using the select states for the manual overrides/selections
    const [selectedDept, setSelectedDept] = React.useState<string>("")
    const [selectedBU, setSelectedBU] = React.useState<string>("")
    const [selectedSupervisor, setSelectedSupervisor] = React.useState<string>("")

    const [departments, setDepartments] = React.useState<string[]>([])
    const [businessUnits, setBusinessUnits] = React.useState<string[]>([])
    const [supervisors, setSupervisors] = React.useState<string[]>([])

    const debouncedSearch = useDebounce(searchQuery, 300)

    React.useEffect(() => {
        async function fetchSettings() {
            const [dRes, bRes, sRes] = await Promise.all([
                getDepartments(),
                getBusinessUnits(),
                getSupervisors()
            ]);
            if (dRes.success) setDepartments(dRes.data?.filter(d => d.is_active).map(d => d.name) || []);
            if (bRes.success) setBusinessUnits(bRes.data?.filter(b => b.is_active).map(b => b.name) || []);
            if (sRes.success) setSupervisors(sRes.data?.filter(s => s.is_active).map(s => s.name) || []);
        }
        if (open) fetchSettings();
    }, [open])

    React.useEffect(() => {
        if (debouncedSearch && debouncedSearch.length >= 2 && !selectedEmployee) {
            setIsSearching(true)
            searchDirectory(debouncedSearch).then(res => {
                if (res.success) {
                    setSearchResults(res.data || [])
                }
                setIsSearching(false)
            })
        } else {
            setSearchResults([])
        }
    }, [debouncedSearch, selectedEmployee])

    React.useEffect(() => {
        if (!open) {
            setSelectedEmployee(null)
            setSearchQuery("")
            setLastWorkingDay("")
            setSelectedDept("")
            setSelectedBU("")
            setSelectedSupervisor("")
        }
    }, [open])

    const handleSelect = (employee: any) => {
        setSelectedEmployee(employee)
        setSearchQuery(employee.full_name)
        setSelectedDept(employee.department || "")
        setSelectedBU(employee.business_unit || "")
        setSelectedSupervisor(employee.intermediate_supervisor || "")
        setSearchResults([])
    }

    const resetSelection = () => {
        setSelectedEmployee(null)
        setSearchQuery("")
        setSelectedDept("")
        setSelectedBU("")
        setSelectedSupervisor("")
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!selectedEmployee) {
            toast.error("Please select an employee from the directory")
            return
        }

        if (!selectedDept || !selectedBU || !selectedSupervisor || !lastWorkingDay) {
            toast.error("Please fill in all required fields")
            return
        }

        setLoading(true)

        const res = await createResignation({
            name: selectedEmployee.full_name,
            email: selectedEmployee.email,
            department: selectedDept,
            businessUnit: selectedBU,
            intermediateSupervisor: selectedSupervisor,
            lastWorkingDay: new Date(lastWorkingDay),
            directoryId: selectedEmployee.id
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
            <DialogContent className="sm:max-w-[500px] border-border bg-background text-foreground rounded-2xl p-0 overflow-hidden">
                <DialogHeader className="p-6 pb-2">
                    <DialogTitle className="text-xl">Log New Resignation</DialogTitle>
                    <DialogDescription className="text-muted-foreground">
                        Search the Internal Master Directory to initiate a resignation workflow.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="p-6 pt-2 space-y-6">
                    {/* SEARCH INPUT */}
                    <div className="space-y-2 relative">
                        <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">Employee Search</Label>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search by name or corporate email..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                disabled={!!selectedEmployee}
                                className="pl-10 h-11 border-border/50 bg-muted/20 focus:bg-background transition-all rounded-xl"
                            />
                            {selectedEmployee && (
                                <button
                                    type="button"
                                    onClick={resetSelection}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-background rounded-full transition-colors"
                                >
                                    <X className="h-4 w-4 text-muted-foreground" />
                                </button>
                            )}
                            {isSearching && (
                                <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-primary" />
                            )}
                        </div>

                        {/* SEARCH RESULTS DROPDOWN */}
                        {searchResults.length > 0 && (
                            <div className="absolute top-full left-0 w-full mt-2 bg-card border border-border rounded-xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">
                                {searchResults.map((emp) => (
                                    <button
                                        key={emp.id}
                                        type="button"
                                        onClick={() => handleSelect(emp)}
                                        className="w-full flex items-center gap-3 p-3 text-left hover:bg-accent transition-colors border-b border-border/50 last:border-0"
                                    >
                                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs uppercase">
                                            {emp.full_name.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-semibold truncate">{emp.full_name}</p>
                                            <p className="text-xs text-muted-foreground truncate">{emp.email}</p>
                                        </div>
                                        <Badge variant="outline" className="text-[10px] shrink-0 border-primary/20 bg-primary/5 text-primary">
                                            {emp.department}
                                        </Badge>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {selectedEmployee ? (
                        <div className="space-y-5 animate-in fade-in zoom-in-95 duration-300">
                            <div className="p-4 rounded-xl border border-primary/20 bg-primary/5 flex items-center gap-4">
                                <div className="p-2 rounded-lg bg-primary/20">
                                    <UserCheck className="h-5 w-5 text-primary" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs font-semibold text-primary uppercase tracking-wide">Identity Verified</p>
                                    <p className="font-bold truncate text-foreground">{selectedEmployee.full_name}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">Department</Label>
                                    <Select value={selectedDept} onValueChange={setSelectedDept}>
                                        <SelectTrigger className="border-border/50 bg-muted/20 h-10 rounded-xl">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {departments.map((d) => (
                                                <SelectItem key={d} value={d}>{d}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="grid gap-2">
                                    <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">Business Unit</Label>
                                    <Select value={selectedBU} onValueChange={setSelectedBU}>
                                        <SelectTrigger className="border-border/50 bg-muted/20 h-10 rounded-xl">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {businessUnits.map((bu) => (
                                                <SelectItem key={bu} value={bu}>{bu}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="grid gap-2">
                                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">Intermediate Supervisor</Label>
                                <Select value={selectedSupervisor} onValueChange={setSelectedSupervisor}>
                                    <SelectTrigger className="border-border/50 bg-muted/20 h-11 rounded-xl">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {supervisors.map((s) => (
                                            <SelectItem key={s} value={s}>{s}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="lwd" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">Last Working Day</Label>
                                <Input
                                    id="lwd"
                                    type="date"
                                    value={lastWorkingDay}
                                    onChange={(e) => setLastWorkingDay(e.target.value)}
                                    className="border-border/50 bg-muted/20 h-11 rounded-xl"
                                    required
                                />
                            </div>

                            <DialogFooter className="pt-2">
                                <Button
                                    type="submit"
                                    disabled={loading}
                                    className="bg-primary hover:bg-primary/90 text-primary-foreground w-full h-11 rounded-xl font-bold shadow-lg shadow-primary/20"
                                >
                                    {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Initiate Exit Flow"}
                                </Button>
                            </DialogFooter>
                        </div>
                    ) : (
                        <div className="py-12 flex flex-col items-center justify-center text-center space-y-3 opacity-50">
                            <div className="p-4 rounded-full bg-muted">
                                <Search className="h-8 w-8 text-muted-foreground" />
                            </div>
                            <p className="text-sm">Search the directory above to begin</p>
                        </div>
                    )}
                </form>
            </DialogContent>
        </Dialog>
    )
}
