"use client"

import { Star } from "lucide-react"
import { cn } from "@/lib/utils"
import { useState } from "react"

interface StarRatingProps {
    value?: number
    onChange?: (value: number) => void
    max?: number
    disabled?: boolean
    className?: string
}

export function StarRating({
    value = 0,
    onChange,
    max = 5,
    disabled = false,
    className
}: StarRatingProps) {
    const [hoverValue, setHoverValue] = useState<number | null>(null)

    const handleMouseEnter = (index: number) => {
        if (!disabled) {
            setHoverValue(index + 1)
        }
    }

    const handleMouseLeave = () => {
        if (!disabled) {
            setHoverValue(null)
        }
    }

    const handleClick = (index: number) => {
        if (!disabled && onChange) {
            onChange(index + 1)
        }
    }

    return (
        <div className={cn("flex items-center gap-1", className)}>
            {Array.from({ length: max }).map((_, i) => {
                const filled = (hoverValue !== null ? hoverValue : value) > i
                return (
                    <button
                        key={i}
                        type="button"
                        className={cn(
                            "focus:outline-none transition-colors duration-200",
                            disabled ? "cursor-default" : "cursor-pointer hover:scale-110",
                        )}
                        onClick={() => handleClick(i)}
                        onMouseEnter={() => handleMouseEnter(i)}
                        onMouseLeave={handleMouseLeave}
                        disabled={disabled}
                    >
                        <Star
                            className={cn(
                                "w-6 h-6 transition-all",
                                filled
                                    ? "fill-yellow-400 text-yellow-400"
                                    : "fill-transparent text-slate-300"
                            )}
                        />
                    </button>
                )
            })}
            <div className="ml-2 text-sm text-slate-400 w-8">
                {hoverValue !== null ? hoverValue : value}/5
            </div>
        </div>
    )
}
