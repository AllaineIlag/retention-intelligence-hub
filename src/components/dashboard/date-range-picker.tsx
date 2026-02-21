"use client"

import * as React from "react"
import { format, startOfMonth, endOfMonth, subDays, startOfYear, subQuarters, endOfQuarter, startOfQuarter } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"
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

interface DateRangePickerProps extends React.HTMLAttributes<HTMLDivElement> {
    date: DateRange | undefined
    onDateChange: (date: DateRange | undefined) => void
}

export function DateRangePicker({
    className,
    date,
    onDateChange
}: DateRangePickerProps) {

    const handlePresetChange = (value: string) => {
        const today = new Date()
        let newRange: DateRange | undefined

        switch (value) {
            case "this-month":
                newRange = {
                    from: startOfMonth(today),
                    to: endOfMonth(today),
                }
                break
            case "last-30-days":
                newRange = {
                    from: subDays(today, 30),
                    to: today,
                }
                break
            case "ytd":
                newRange = {
                    from: startOfYear(today),
                    to: today,
                }
                break
            case "last-quarter":
                const lastQuarter = subQuarters(today, 1)
                newRange = {
                    from: startOfQuarter(lastQuarter),
                    to: endOfQuarter(lastQuarter),
                }
                break
            default:
                newRange = undefined
        }

        onDateChange(newRange)
    }

    return (
        <div className={cn("grid gap-2", className)}>
            <Popover>
                <PopoverTrigger asChild>
                    <Button
                        id="date"
                        variant={"outline"}
                        className={cn(
                            "w-[260px] justify-start text-left font-normal border-white/5 bg-white/[0.02] hover:bg-white/[0.05] rounded-xl px-3",
                            !date && "text-muted-foreground"
                        )}
                    >
                        <CalendarIcon className="mr-2 h-4 w-4 text-blue-400" />
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
                <PopoverContent className="w-auto p-0 rounded-2xl border-white/10 bg-black/90 backdrop-blur-xl" align="end">
                    <div className="p-3 border-b border-white/5">
                        <Select onValueChange={handlePresetChange}>
                            <SelectTrigger className="w-full bg-white/5 border-white/10 rounded-lg h-8 text-xs">
                                <SelectValue placeholder="Select preset" />
                            </SelectTrigger>
                            <SelectContent className="bg-zinc-900 border-white/10 rounded-xl">
                                <SelectItem value="this-month">This Month</SelectItem>
                                <SelectItem value="last-30-days">Last 30 Days</SelectItem>
                                <SelectItem value="ytd">YTD</SelectItem>
                                <SelectItem value="last-quarter">Last Quarter</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <Calendar
                        initialFocus
                        mode="range"
                        defaultMonth={date?.from}
                        selected={date}
                        onSelect={onDateChange}
                        numberOfMonths={2}
                    />
                </PopoverContent>
            </Popover>
        </div>
    )
}
