import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, FileText, User, ExternalLink, ShieldAlert, Database } from 'lucide-react';

export function ResourcesSection() {
    const resources = [
        {
            title: "Lead's Handbook",
            description: "User management and analytics overview.",
            icon: BookOpen,
            link: "/docs/manuals/lead-manual.md",
        },
        {
            title: "Interviewer's Protocol",
            description: "Guide for live sessions and locking.",
            icon: FileText,
            link: "/docs/manuals/interviewer-manual.md",
        },
        {
            title: "Employee's Brief",
            description: "Information for exiting employees.",
            icon: User,
            link: "/docs/manuals/employee-manual.md",
        },
        {
            title: "Privacy Policy",
            description: "Data collection and RLS security.",
            icon: ShieldAlert,
            link: "/docs/compliance/privacy-policy.md",
        },
        {
            title: "Data Retention",
            description: "Information lifecycle and anonymization.",
            icon: Database,
            link: "/docs/compliance/data-retention-policy.md",
        },
    ];

    return (
        <Card className="col-span-full">
            <CardHeader>
                <CardTitle>Resources & Compliance</CardTitle>
                <CardDescription>
                    Field manuals, protocols, and compliance documentation.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {resources.map((resource) => (
                        <div
                            key={resource.title}
                            className="flex items-start space-x-4 rounded-lg border p-4 transition-colors hover:bg-muted/50"
                        >
                            <div className="mt-1 rounded-full bg-primary/10 p-2 text-primary">
                                <resource.icon className="h-4 w-4" />
                            </div>
                            <div className="flex-1 space-y-1">
                                <p className="text-sm font-medium leading-none">
                                    {resource.title}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    {resource.description}
                                </p>
                                <Button
                                    variant="link"
                                    className="h-auto p-0 text-xs text-primary"
                                    asChild
                                >
                                    <a
                                        href={resource.link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center"
                                    >
                                        View Document
                                        <ExternalLink className="ml-1 h-3 w-3" />
                                    </a>
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
