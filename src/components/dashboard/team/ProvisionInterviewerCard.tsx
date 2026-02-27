'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Search, Loader2, UserPlus, Key, Copy, Check, X } from 'lucide-react';
import { searchDirectory } from '@/app/actions/directory';
import { provisionInterviewer } from '@/app/actions/provisioning';
import { useDebounce } from '@/hooks/use-debounce';
import { Badge } from '@/components/ui/badge';

export default function ProvisionInterviewerCard() {
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [isProvisioning, setIsProvisioning] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState<any | null>(null);
    const [credentials, setCredentials] = useState<{ email: string, tempPassword: string } | null>(null);
    const [copied, setCopied] = useState(false);

    const debouncedSearch = useDebounce(searchQuery, 300);

    useEffect(() => {
        if (debouncedSearch && debouncedSearch.length >= 2 && !selectedEmployee) {
            setIsSearching(true);
            searchDirectory(debouncedSearch).then(res => {
                if (res.success) {
                    setSearchResults(res.data || []);
                }
                setIsSearching(false);
            });
        } else {
            setSearchResults([]);
        }
    }, [debouncedSearch, selectedEmployee]);

    const handleProvision = async () => {
        if (!selectedEmployee) return;

        setIsProvisioning(true);
        const res = await provisionInterviewer(selectedEmployee.id);

        if (res.success) {
            toast.success('Interviewer provisioned successfully');
            setCredentials(res.credentials || null);
        } else {
            toast.error('Provisioning failed', { description: res.error });
        }
        setIsProvisioning(false);
    };

    const copyPassword = () => {
        if (credentials?.tempPassword) {
            navigator.clipboard.writeText(credentials.tempPassword);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
            toast.success('Password copied');
        }
    };

    if (credentials) {
        return (
            <Card className="border-primary/20 bg-primary/5 shadow-lg shadow-primary/10 animate-in fade-in zoom-in-95">
                <CardHeader>
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/20 mb-2">
                        <Key className="h-5 w-5 text-primary" />
                    </div>
                    <CardTitle>Provisioning Complete</CardTitle>
                    <CardDescription>
                        Give these temporary credentials to the employee. They will be asked to change their password on first login.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid gap-2">
                        <Label className="text-xs text-muted-foreground uppercase font-semibold">Username / Email</Label>
                        <div className="p-3 bg-background border border-border rounded-xl font-mono text-sm">
                            {credentials.email}
                        </div>
                    </div>
                    <div className="grid gap-2">
                        <Label className="text-xs text-muted-foreground uppercase font-semibold">Temporary Password</Label>
                        <div className="flex gap-2">
                            <div className="flex-1 p-3 bg-background border border-border rounded-xl font-mono text-sm flex items-center justify-between">
                                {credentials.tempPassword}
                            </div>
                            <Button onClick={copyPassword} variant="outline" className="rounded-xl">
                                {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                            </Button>
                        </div>
                    </div>
                    <Button
                        variant="default"
                        className="w-full mt-4"
                        onClick={() => {
                            setCredentials(null);
                            setSelectedEmployee(null);
                            setSearchQuery('');
                        }}
                    >
                        Provision Another
                    </Button>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="shadow-lg border-border/50">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <UserPlus className="h-5 w-5 text-primary" />
                    Provision Interviewer
                </CardTitle>
                <CardDescription>
                    Grant direct system access to verified company employees.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2 relative">
                    <Label className="text-xs text-muted-foreground uppercase font-semibold">Search Master Directory</Label>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Type employee name or email..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            disabled={!!selectedEmployee}
                            className="pl-10 rounded-xl"
                        />
                        {selectedEmployee && (
                            <button
                                onClick={() => { setSelectedEmployee(null); setSearchQuery(''); }}
                                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-muted rounded-full"
                            >
                                <X className="h-4 w-4 text-muted-foreground" />
                            </button>
                        )}
                        {isSearching && (
                            <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-primary" />
                        )}
                    </div>

                    {searchResults.length > 0 && (
                        <div className="absolute top-full left-0 w-full mt-2 bg-card border border-border rounded-xl shadow-2xl z-50 overflow-hidden">
                            {searchResults.map((emp) => (
                                <button
                                    key={emp.id}
                                    onClick={() => { setSelectedEmployee(emp); setSearchQuery(emp.full_name); setSearchResults([]); }}
                                    className="w-full flex items-center gap-3 p-3 text-left hover:bg-accent transition-colors border-b last:border-0"
                                >
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold truncate">{emp.full_name}</p>
                                        <p className="text-xs text-muted-foreground truncate">{emp.email}</p>
                                    </div>
                                    <Badge variant="outline" className="text-[10px]">{emp.department}</Badge>
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {selectedEmployee && (
                    <div className="p-4 rounded-xl border border-primary/20 bg-primary/5 space-y-4 animate-in fade-in slide-in-from-top-2">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-[10px] font-bold text-primary uppercase tracking-widest">Selected Employee</p>
                                <p className="text-lg font-bold text-foreground">{selectedEmployee.full_name}</p>
                                <p className="text-sm text-muted-foreground">{selectedEmployee.email}</p>
                            </div>
                            <Badge className="bg-primary/20 text-primary border-transparent">
                                {selectedEmployee.department}
                            </Badge>
                        </div>
                        <Button
                            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold"
                            onClick={handleProvision}
                            disabled={isProvisioning}
                        >
                            {isProvisioning ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <ShieldCheck className="h-4 w-4 mr-2" />}
                            Grant Access
                        </Button>
                    </div>
                )}

                <p className="text-xs text-muted-foreground italic bg-muted/30 p-3 rounded-lg border-l-2 border-primary/50">
                    Noxian Protocol: Provisioning creates a verified "interviewer" account linked to the corporate ID. No public sign-ups are permitted.
                </p>
            </CardContent>
        </Card>
    );
}

import { ShieldCheck } from 'lucide-react';
