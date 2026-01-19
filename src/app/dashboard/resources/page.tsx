import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { BookOpen, PhoneCall, ShieldAlert } from "lucide-react";

export default function ResourcesPage() {
  return (
    <div className="space-y-8 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">
          The Playbook
        </h2>
      </div>
      <p className="text-zinc-500 dark:text-zinc-400">
        Strategic resources and guidelines for retention efforts.
      </p>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PhoneCall className="h-5 w-5" />
              Retention Scripts
            </CardTitle>
            <CardDescription>Dialogues for common objections.</CardDescription>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-1">
                <AccordionTrigger>
                  Objection: &quot;Higher Salary&quot;
                </AccordionTrigger>
                <AccordionContent className="text-sm text-zinc-600 dark:text-zinc-300">
                  &quot;I understand money is a major factor. Beyond the base
                  salary, have you considered the total value of our benefits,
                  stock options, and the growth trajectory you&apos;re currently
                  on? Let&apos;s look at the long-term potential here versus a
                  short-term bump.&quot;
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-2">
                <AccordionTrigger>
                  Objection: &quot;Lack of Growth&quot;
                </AccordionTrigger>
                <AccordionContent className="text-sm text-zinc-600 dark:text-zinc-300">
                  &quot;That&apos;s a critical point. I want to build a specific
                  6-month clear path for you. If we can define the exact role
                  you want and the milestones to get there, would you
                  reconsider? Let&apos;s map it out right now.&quot;
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Policy Documents
            </CardTitle>
            <CardDescription>Internal guidelines and rules.</CardDescription>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="policy-1">
                <AccordionTrigger>Counter-Offer Guidelines</AccordionTrigger>
                <AccordionContent className="text-sm text-zinc-600 dark:text-zinc-300">
                  <ul className="list-disc space-y-1 pl-4">
                    <li>Max cap: 15% increase without VP approval.</li>
                    <li>
                      Must be tied to performance review cycle adjustment.
                    </li>
                    <li>
                      Cannot match if external offer is &gt;30% above band.
                    </li>
                  </ul>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="policy-2">
                <AccordionTrigger>Remote Work Extension</AccordionTrigger>
                <AccordionContent className="text-sm text-zinc-600 dark:text-zinc-300">
                  Leads have discretion to offer up to 4 weeks of remote work as
                  a retention lever for high performers (Top 10%).
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldAlert className="h-5 w-5" />
              Escalation Matrix
            </CardTitle>
            <CardDescription>When to call for backup.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm text-zinc-600 dark:text-zinc-300">
              <div className="rounded-md border bg-zinc-50 p-2 dark:bg-zinc-900">
                <p className="font-semibold text-red-500">
                  Level 1: Direct Lead
                </p>
                <p>Standard resignation requests.</p>
              </div>
              <div className="rounded-md border bg-zinc-50 p-2 dark:bg-zinc-900">
                <p className="font-semibold text-red-600">Level 2: Dept Head</p>
                <p>Key personnel (L5+) or mass exodus risk.</p>
              </div>
              <div className="rounded-md border bg-zinc-50 p-2 dark:bg-zinc-900">
                <p className="font-semibold text-red-700">
                  Level 3: VP / HR Director
                </p>
                <p>
                  Legal disputes, harassment claims, or competitor poaching
                  raids.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
