"use client"

import * as React from "react"
import { format, startOfMonth, endOfMonth, parseISO } from "date-fns"
import { Calendar as CalendarIcon, Filter } from "lucide-react"
import { DateRange } from "react-day-picker"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { getDepartments } from "@/app/actions/dashboard"

export interface FilterState {
    dateRange: DateRange | undefined
    department: string | undefined
}

interface CardFilterProps {
    onFilterChange: (filters: FilterState) => void
    defaultFilters?: FilterState
}

export function CardFilter({ onFilterChange, defaultFilters }: CardFilterProps) {
    const [date, setDate] = React.useState<DateRange | undefined>(defaultFilters?.dateRange)
    const [department, setDepartment] = React.useState<string | undefined>(defaultFilters?.department)
    const [departmentList, setDepartmentList] = React.useState<string[]>([])
    const [open, setOpen] = React.useState(false)

    React.useEffect(() => {
        getDepartments().then(res => {
            if (res.success && res.data) {
                setDepartmentList(res.data)
            }
        })
    }, [])

    const handleApply = () => {
        onFilterChange({ dateRange: date, department })
        setOpen(false)
    }

    const handleReset = () => {
        const today = new Date()
        const defaultRange = {
            from: startOfMonth(today),
            to: endOfMonth(today)
        }
        setDate(defaultRange)
        setDepartment("all")
        onFilterChange({ dateRange: defaultRange, department: "all" })
        setOpen(false)
    }

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-400 hover:text-white">
                    <Filter className="h-4 w-4" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-4 border-white/10 bg-zinc-950/95 backdrop-blur-xl" align="end">
                <div className="space-y-4">
                    <div className="space-y-2">
                        <h4 className="font-medium leading-none text-sm text-zinc-400">Date Range</h4>
                        <div className="grid gap-2">
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        id="date"
                                        variant={"outline"}
                                        className={cn(
                                            "w-full justify-start text-left font-normal border-white/10 bg-white/5 hover:bg-white/10",
                                            !date && "text-muted-foreground"
                                        )}
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4 text-zinc-400" />
                                        {date?.from ? (
                                            date.to ? (
                                                <>
                                                    {format(date.from, "LLL dd, y")} -{" "}
                                                    {format(date.to, "LLL dd, y")}
                                                </>
                                            ) : (
                                                format(date.from, "LLL dd, y")
                                            )
                                        ) : (
                                            <span>Pick a date</span>
                                        )}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0 border-white/10 bg-zinc-900" align="start">
                                    <Calendar
                                        initialFocus
                                        mode="range"
                                        defaultMonth={date?.from}
                                        selected={date}
                                        onSelect={setDate}
                                        numberOfMonths={1}
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <h4 className="font-medium leading-none text-sm text-zinc-400">Department</h4>
                        <Select value={department} onValueChange={setDepartment}>
                            <SelectTrigger className="w-full border-white/10 bg-white/5 text-sm h-9">
                                <SelectValue placeholder="All Departments" />
                            </SelectTrigger>
                            <SelectContent className="border-white/10 bg-zinc-900">
                                <SelectItem value="all">All Departments</SelectItem>
                                {departmentList.map((dept) => (
                                    <SelectItem key={dept} value={dept}>
                                        {dept}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="flex items-center justify-between pt-2">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleReset}
                            className="text-xs text-zinc-500 hover:text-white"
                        >
                            Reset
                        </Button>
                        <Button
                            size="sm"
                            onClick={handleApply}
                            className="bg-blue-600 hover:bg-blue-700 text-white text-xs"
                        >
                            Apply Filters
                        </Button>
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    )
}
