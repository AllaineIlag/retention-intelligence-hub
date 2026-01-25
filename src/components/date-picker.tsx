"use client";

import * as React from "react";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Field, FieldLabel } from "@/components/ui/field";

interface DatePickerProps {
    date?: Date;
    onChange?: (date?: Date) => void;
    placeholder?: string;
    className?: string;
    disabled?: boolean;
    label?: string;
    id?: string;
}

/**
 * DatePicker Component
 * Aligned with Shadcn's "Month and Year Selector" pattern.
 * Features a semantic Field structure and smooth transitions.
 */
export function DatePicker({
    date,
    onChange,
    placeholder = "Pick a date",
    className,
    disabled = false,
    label,
    id,
}: DatePickerProps) {
    const [isOpen, setIsOpen] = React.useState(false);

    return (
        <Field className={cn("w-full", className)}>
            {label && <FieldLabel htmlFor={id}>{label}</FieldLabel>}
            <Popover open={isOpen} onOpenChange={setIsOpen}>
                <PopoverTrigger asChild>
                    <Button
                        id={id}
                        variant={"outline"}
                        className={cn(
                            "w-full justify-start text-left font-normal bg-card h-10 border-muted-foreground/20 hover:border-primary/50 hover:bg-accent/50 transition-all duration-200 shadow-sm",
                            !date && "text-muted-foreground"
                        )}
                        disabled={disabled}
                    >
                        <CalendarIcon className="mr-2 h-4 w-4 opacity-70" />
                        {date ? format(date, "PPP") : <span>{placeholder}</span>}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 shadow-2xl border-primary/10 overflow-hidden" align="start">
                    <AnimatePresence>
                        {isOpen && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: -10 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                                transition={{
                                    type: "spring",
                                    stiffness: 300,
                                    damping: 25
                                }}
                            >
                                <Calendar
                                    mode="single"
                                    selected={date}
                                    onSelect={(newDate) => {
                                        onChange?.(newDate);
                                        setIsOpen(false);
                                    }}
                                    initialFocus
                                    captionLayout="dropdown"
                                    startMonth={new Date(new Date().getFullYear() - 50, 0)}
                                    endMonth={new Date(new Date().getFullYear() + 10, 11)}
                                />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </PopoverContent>
            </Popover>
        </Field>
    );
}
