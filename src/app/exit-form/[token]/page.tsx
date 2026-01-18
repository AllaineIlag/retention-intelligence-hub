import { ExitSurveyWizard } from "@/components/exit-form/exit-survey-wizard";
import { createClient } from "@/utils/supabase/server";
import { EXIT_QUESTIONS } from "@/constants/questions";
import { AlertCircle, CheckCircle } from "lucide-react";

export default async function ExitFormPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const supabase = await createClient();

  // Securely fetch data
  const { data, error } = await supabase.rpc("get_exit_form_data", {
    token_id: token,
  });

  // Handle Invalid Token
  if (error || !data) {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-[#0a0a0a] p-4 text-center text-white">
        <AlertCircle className="mb-4 h-12 w-12 text-red-500" />
        <h1 className="mb-2 text-2xl font-bold">Access Denied</h1>
        <p className="text-zinc-500">
          The token provided is invalid or has expired.
        </p>
      </div>
    );
  }

  const resignation = data as { status: string; employee_name?: string };

  // Handle Already Completed
  if (resignation.status === "completed") {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-[#0a0a0a] p-4 text-center text-white">
        <CheckCircle className="mb-4 h-12 w-12 text-blue-500" />
        <h1 className="mb-2 text-2xl font-bold">Session Closed</h1>
        <p className="text-zinc-500">
          This exit interview has already been submitted. <br />
          Thank you for your time.
        </p>
      </div>
    );
  }

  // Render Wizard
  return (
    <div className="min-h-screen w-full bg-[#0a0a0a] text-white">
      <div className="absolute top-0 left-0 h-2 w-full bg-gradient-to-r from-blue-900 to-purple-900 opacity-20" />
      <ExitSurveyWizard
        questions={EXIT_QUESTIONS}
        employeeName={resignation.employee_name || "Employee"}
        token={token}
      />
    </div>
  );
}
