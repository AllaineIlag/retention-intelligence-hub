import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
    CheckCircle,
    Lock,
    Calendar,
    User,
    Briefcase,
    MapPin,
    Hash,
    ArrowLeft,
    ShieldCheck,
    AlertCircle,
    FileText
} from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { BUSINESS_UNITS } from '@/constants/enums';

// Reusing the config from InterviewSession for consistency
// Ideally this should be shared, but for now we duplicate the strict config to ensure stability
const PERSONAL_FIELDS = [
    { key: 'personal_full_name', label: 'Full Name', icon: <User className="w-4 h-4" />, rawKey: 'full_name', type: 'text' },
    { key: 'personal_employee_number', label: 'Employee Number', icon: <Hash className="w-4 h-4" />, rawKey: 'employee_number', type: 'text' },
    { key: 'personal_business_unit', label: 'Business Unit', icon: <Briefcase className="w-4 h-4" />, rawKey: 'business_unit', type: 'department' },
    { key: 'personal_current_position', label: 'Current Position', icon: <Briefcase className="w-4 h-4" />, rawKey: 'current_position', type: 'text' },
    { key: 'personal_position_hired', label: 'Position When Hired', icon: <Briefcase className="w-4 h-4" />, rawKey: 'position_when_hired', type: 'text' },
    { key: 'personal_department', label: 'Department', icon: <MapPin className="w-4 h-4" />, rawKey: 'department', type: 'department' },
    { key: 'personal_date_hired', label: 'Date Hired', icon: <Calendar className="w-4 h-4" />, rawKey: 'date_hired', type: 'date' },
    { key: 'personal_immediate_superior', label: 'Immediate Superior', icon: <User className="w-4 h-4" />, rawKey: 'immediate_superior', type: 'supervisor' },
    { key: 'personal_resignation_date', label: 'Resignation Date', icon: <Calendar className="w-4 h-4" />, rawKey: 'resignation_date', type: 'date' },
];

interface InterviewReportDossierProps {
    resignation: any;
    verifiedResults: any[];
    responses: any[];
}

export function InterviewReportDossier({ resignation, verifiedResults, responses }: InterviewReportDossierProps) {
    const employee = resignation.employee_details || {};

    // Helper to get verified personal info
    const getVerifiedPersonalInfo = (field: any) => {
        const verifiedItem = verifiedResults.find((v: any) => v.question_key === field.key);
        const originalValue = employee[field.rawKey];

        let displayValue = originalValue;
        let isModified = false;

        if (verifiedItem && verifiedItem.response_value !== undefined) {
            // Basic strict check here, we can use the robust check if needed but for display strict is usually fine
            // actually let's just trust verifiedItem.response_value if it exists
            if (verifiedItem.response_value !== originalValue) {
                displayValue = verifiedItem.response_value;
                isModified = true;
            }
        }

        // Format dates
        if (field.type === 'date' && displayValue) {
            try {
                displayValue = format(new Date(displayValue), 'MMMM d, yyyy');
            } catch (e) {
                // keep original
            }
        }

        return { value: displayValue, isModified };
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
                <div className="space-y-1">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                            <Lock className="w-5 h-5 text-emerald-500" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-white tracking-tight">Interview Report Dossier</h1>
                            <p className="text-sm text-emerald-400 font-mono flex items-center gap-2">
                                <ShieldCheck className="w-3 h-3" />
                                CASE SEALED • VERIFIED RECORD
                            </p>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Button asChild variant="outline" className="border-white/10 bg-black/20 text-white hover:bg-white/5">
                        <Link href="/dashboard/interview/schedule">
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Return to Schedule
                        </Link>
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* LEFT COLUMN: Personal Info */}
                <Card className="bg-black/40 border-white/10 backdrop-blur-md h-fit">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <User className="w-4 h-4 text-indigo-400" />
                            Personal Information
                        </CardTitle>
                        <CardDescription>Verified employee details</CardDescription>
                    </CardHeader>
                    <Separator className="bg-white/5" />
                    <CardContent className="p-0">
                        <div className="divide-y divide-white/5">
                            {PERSONAL_FIELDS.map((field) => {
                                const { value, isModified } = getVerifiedPersonalInfo(field);
                                return (
                                    <div key={field.key} className="p-4 flex items-start gap-3 group hover:bg-white/[0.02] transition-colors">
                                        <div className="mt-0.5 text-white/40 group-hover:text-indigo-400 transition-colors">
                                            {field.icon}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-[10px] uppercase font-bold text-white/40 tracking-wider mb-0.5">
                                                {field.label}
                                            </p>
                                            <div className="flex items-center justify-between gap-2">
                                                <p className={cn(
                                                    "text-sm font-medium truncate",
                                                    isModified ? "text-amber-300" : "text-white/90"
                                                )}>
                                                    {value || 'N/A'}
                                                </p>
                                                {isModified && (
                                                    <Badge variant="outline" className="text-[9px] border-amber-500/30 text-amber-500 px-1 py-0 h-4">
                                                        EDITED
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>

                {/* RIGHT COLUMN: Questionnaire */}
                <Card className="lg:col-span-2 bg-black/40 border-white/10 backdrop-blur-md">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <FileText className="w-4 h-4 text-indigo-400" />
                            Questionnaire Record
                        </CardTitle>
                        <CardDescription>Final verified responses</CardDescription>
                    </CardHeader>
                    <Separator className="bg-white/5" />
                    <CardContent className="p-0">
                        <ScrollArea className="h-[calc(100vh-300px)]">
                            <div className="divide-y divide-white/5">
                                {responses.map((response, index) => {
                                    const verifiedItem = verifiedResults.find(v => v.question_key === response.question?.question_key);
                                    // Logic for display:
                                    // If verified item exists, showing verified value.
                                    // Show original if different.

                                    const originalValue = response.response_value;
                                    const verifiedValue = verifiedItem?.response_value;
                                    const hasVerified = verifiedValue !== undefined;

                                    // Simple check for modification (can be enhanced with normalize if needed)
                                    // For read-only, we usually just show verified if it exists
                                    const finalValue = hasVerified ? verifiedValue : originalValue;

                                    // Formatting for array (multi-select)
                                    const displayValue = Array.isArray(finalValue) ? finalValue.join(', ') : String(finalValue || 'N/A');

                                    // Check if modified
                                    // This is tricky without the normalize helper, but for now strict check:
                                    // If we strictly want to show modification badge, we need the helper.
                                    // Let's assume for Report, the goal is "What is the TRUTH". 
                                    // So we emphasize the Final Value.

                                    return (
                                        <div key={response.id} className="p-6 space-y-3 hover:bg-white/[0.02]">
                                            <div className="flex items-start justify-between gap-4">
                                                <h3 className="text-sm font-medium text-white/90 leading-relaxed">
                                                    <span className="text-indigo-500 font-bold mr-2">Q{index + 1}.</span>
                                                    {response.question?.question_text}
                                                </h3>
                                            </div>

                                            <div className="bg-white/5 rounded-lg border border-white/5 p-4 ml-6">
                                                {/* Final Answer */}
                                                <div className="text-sm text-white/90 font-medium leading-relaxed">
                                                    {displayValue}
                                                </div>

                                                {/* Optional: Show Original if Modified */}
                                                {/* 
                                                {hasVerified && verifiedValue !== originalValue && (
                                                    <div className="mt-3 pt-3 border-t border-white/5">
                                                        <p className="text-[10px] uppercase font-bold text-white/30 mb-1">Original Employee Response:</p>
                                                        <p className="text-xs text-white/50">{Array.isArray(originalValue) ? originalValue.join(', ') : originalValue}</p>
                                                    </div>
                                                )}
                                                */}
                                            </div>

                                            {/* Notes/Comments if any */}
                                            {/* (We don't have comments in the current schema for responses yet, but if verifiedResult has notes field later) */}
                                        </div>
                                    );
                                })}
                            </div>
                        </ScrollArea>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
