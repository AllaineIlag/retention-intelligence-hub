"use client"

import * as React from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { format, parseISO, startOfMonth, endOfMonth } from "date-fns"
import { DateRange } from "react-day-picker"
import { Building2 } from "lucide-react"

import { DateRangePicker } from "./date-range-picker"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { getDepartments } from "@/app/actions/dashboard"

export function GlobalFilters() {
    const router = useRouter()
    const searchParams = useSearchParams()

    const [departments, setDepartments] = React.useState<string[]>([])
    const [isMounted, setIsMounted] = React.useState(false)

    // Initialize from URL
    const from = searchParams.get("from")
    const to = searchParams.get("to")
    const dept = searchParams.get("dept")

    const date: DateRange | undefined = React.useMemo(() => {
        if (!from || !to) return undefined
        return {
            from: parseISO(from),
            to: parseISO(to)
        }
    }, [from, to])

    React.useEffect(() => {
        setIsMounted(true)

        // Apply default filters if not present
        if (!from || !to) {
            const today = new Date()
            const defaultRange = {
                from: startOfMonth(today),
                to: endOfMonth(today)
            }
            updateFilters(defaultRange, dept)
        }

        getDepartments().then(res => {
            if (res.success && res.data) {
                setDepartments(res.data)
            }
        })
    }, [from, to, dept]) // Dependencies added to ensure defaults are checked/applied

    const updateFilters = (newDate: DateRange | undefined, newDept: string | null) => {
        const params = new URLSearchParams(searchParams.toString())

        if (newDate?.from) {
            params.set("from", format(newDate.from, "yyyy-MM-dd"))
        } else {
            params.delete("from")
        }

        if (newDate?.to) {
            params.set("to", format(newDate.to, "yyyy-MM-dd"))
        } else {
            params.delete("to")
        }

        if (newDept && newDept !== "all") {
            params.set("dept", newDept)
        } else {
            params.delete("dept")
        }

        router.push(`?${params.toString()}`, { scroll: false })
    }

    if (!isMounted) {
        return <div className="flex items-center gap-3 h-9 w-[450px]" /> // Placeholder to prevent layout shift
    }

    return (
        <div className="flex items-center gap-3">
            <DateRangePicker
                date={date}
                onDateChange={(d) => updateFilters(d, dept)}
            />

            <Select
                value={dept || "all"}
                onValueChange={(v) => updateFilters(date, v)}
            >
                <SelectTrigger className="w-[180px] border-white/5 bg-white/[0.02] hover:bg-white/[0.05] rounded-xl px-3 h-9 text-sm">
                    <Building2 className="mr-2 h-4 w-4 text-indigo-400" />
                    <SelectValue placeholder="All Departments" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-white/10 rounded-xl">
                    <SelectItem value="all">All Departments</SelectItem>
                    {departments.map((d) => (
                        <SelectItem key={d} value={d}>
                            {d}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    )
}
