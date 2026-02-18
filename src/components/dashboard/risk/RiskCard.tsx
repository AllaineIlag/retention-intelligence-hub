'use client';

import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle, ShieldCheck, Siren } from "lucide-react";
import { cn } from "@/lib/utils";

interface RiskCardProps {
    label: string;
    value: string | number;
    subValue?: string;
    status: 'safe' | 'warning' | 'critical';
}

export function RiskCard({ label, value, subValue, status }: RiskCardProps) {
    const statusConfig = {
        safe: {
            icon: ShieldCheck,
            color: "text-emerald-500",
            bg: "bg-emerald-500/10",
            border: "border-emerald-500/20"
        },
        warning: {
            icon: AlertTriangle,
            color: "text-amber-500",
            bg: "bg-amber-500/10",
            border: "border-amber-500/20"
        },
        critical: {
            icon: Siren,
            color: "text-red-500",
            bg: "bg-red-500/10",
            border: "border-red-500/20 animate-pulse" // Subtle pulse for critical
        }
    };

    const config = statusConfig[status];
    const Icon = config.icon;

    return (
        <Card className={cn(
            "relative overflow-hidden transition-all duration-300 hover:scale-[1.02]",
            "bg-[#1a1a1c]/80 backdrop-blur-xl border", // Glassmorphism base
            config.border
        )}>
            <CardContent className="p-5 flex items-start justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-400 mb-1">{label}</p>
                    <div className="flex items-baseline gap-2">
                        <h3 className={cn("text-2xl font-bold tracking-tight", config.color)}>
                            {value}
                        </h3>
                    </div>
                    {subValue && (
                        <p className="text-xs text-gray-500 mt-2">
                            {subValue}
                        </p>
                    )}
                </div>

                <div className={cn("p-2 rounded-full", config.bg)}>
                    <Icon className={cn("w-5 h-5", config.color)} />
                </div>
            </CardContent>

            {/* Status Line at bottom */}
            <div className={cn("absolute bottom-0 left-0 w-full h-1", config.bg)} />
        </Card>
    );
}
