import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { format } from "date-fns";
import { ArrowLeft, Save } from "lucide-react";
import Link from "next/link";

export default async function CaseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: resignation, error } = await supabase
    .from("resignations")
    .select(
      `
      *,
      employee:employees (*)
    `,
    )
    .eq("id", id)
    .single();

  if (error || !resignation) {
    return <div className="p-8">Case not found.</div>;
  }

  // Fetch current user role
  const { data: viewer } = await supabase
    .from("employees")
    .select("role")
    .eq("email", user.email!)
    .single();

  const isLead = viewer?.role === "lead";

  return (
    <div className="mx-auto max-w-4xl space-y-8 p-8 pt-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/employees">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h2 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">
          Case Detail
        </h2>
        <Badge variant="outline" className="ml-auto text-base">
          {resignation.status.toUpperCase()}
        </Badge>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Employee Profile Card */}
        <Card>
          <CardHeader>
            <CardTitle>Employee Profile</CardTitle>
            <CardDescription>Resigning Employee Information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-1">
              <Label className="text-zinc-500">Name</Label>
              <div className="font-medium">
                {resignation.employee.full_name}
              </div>
            </div>
            <div className="grid gap-1">
              <Label className="text-zinc-500">Email</Label>
              <div className="font-medium">{resignation.employee.email}</div>
            </div>
            <div className="grid gap-1">
              <Label className="text-zinc-500">Separation Date</Label>
              <div className="font-medium">
                {format(new Date(resignation.last_working_day), "MMMM d, yyyy")}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Resignation Data Card */}
        <Card>
          <CardHeader>
            <CardTitle>Submission Data</CardTitle>
            <CardDescription>From Exit Form</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Mocking keys since jsonb structure is varying */}
            {Object.entries(resignation.exit_form_answers || {}).map(
              ([key, value]) => (
                <div key={key} className="grid gap-1">
                  <Label className="text-zinc-500 capitalize">
                    {key.replace(/_/g, " ")}
                  </Label>
                  <p className="rounded-md bg-zinc-50 p-2 text-sm dark:bg-zinc-900">
                    {String(value)}
                  </p>
                </div>
              ),
            )}
          </CardContent>
        </Card>

        {/* Interviewer Notes Section */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Interview Notes</CardTitle>
            <CardDescription>
              {isLead ? "Review interviewer notes." : "Log your conversation."}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder="Enter notes from the retention interview..."
              className="min-h-[150px]"
              disabled={isLead && viewer?.role !== "interviewer"} // Leads can read, simplified logic
              defaultValue={
                resignation.exit_interview_scheduled_at
                  ? "Interview Scheduled..."
                  : ""
              }
            />
            <div className="flex justify-end gap-2">
              <Button disabled={isLead}>
                <Save className="mr-2 h-4 w-4" />
                Save Notes
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
