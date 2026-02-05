'use client';

import { useState, useEffect } from 'react';
import { DateRange } from 'react-day-picker';
import { addDays, format } from 'date-fns';
import { Calendar as CalendarIcon, Filter } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"


export type AnalyticsFiltersState = {
    dateRange: DateRange | undefined;
    department: string;
}

interface AnalyticsFiltersProps {
    onFilterChange: (filters: AnalyticsFiltersState) => void;
}

export function AnalyticsFilters({ onFilterChange }: AnalyticsFiltersProps) {
    const [date, setDate] = useState<DateRange | undefined>({
        from: addDays(new Date(), -90),
        to: new Date(),
    });
    const [department, setDepartment] = useState<string>("all");

    useEffect(() => {
        onFilterChange({
            dateRange: date,
            department: department
        });
    }, [date, department]);

    return (
        <div className="flex flex-col sm:flex-row gap-4 items-end sm:items-center pb-4">
            <div className="grid gap-2">
                {/* Date Picker */}
                <Popover>
                    <PopoverTrigger asChild>
                        <Button
                            id="date"
                            variant={"outline"}
                            className={cn(
                                "w-[260px] justify-start text-left font-normal",
                                !date && "text-muted-foreground"
                            )}
                        >
                            <CalendarIcon className="mr-2 h-4 w-4" />
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
                                <span>Pick a date range</span>
                            )}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                            initialFocus
                            mode="range"
                            defaultMonth={date?.from}
                            selected={date}
                            onSelect={setDate}
                            numberOfMonths={2}
                        />
                    </PopoverContent>
                </Popover>
            </div>

            <div className="grid gap-2">
                <Select value={department} onValueChange={setDepartment}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Department" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Departments</SelectItem>
                        <SelectItem value="Engineering">Engineering</SelectItem>
                        <SelectItem value="Product">Product</SelectItem>
                        <SelectItem value="Sales">Sales</SelectItem>
                        <SelectItem value="Marketing">Marketing</SelectItem>
                        <SelectItem value="HR">HR</SelectItem>
                        <SelectItem value="Support">Support</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div className="flex items-center">
                <Button
                    variant="outline"
                    onClick={() => {
                        setDate(undefined);
                        setDepartment("all");
                    }}
                    className="h-10 px-4 hover:bg-neutral-800"
                >
                    Reset Filters
                </Button>
            </div>
        </div>
    );
}
