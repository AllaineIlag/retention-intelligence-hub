import { DashboardGrid } from "@/components/dashboard/dashboard-grid";
import { ExportButton } from "@/components/dashboard/export-button";

export default function LeadDashboardPage() {
  return (
    <div className="space-y-8 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight text-white">
          Retention Overview
        </h2>
        <div className="flex items-center space-x-2">
          <ExportButton />
        </div>
      </div>

      <DashboardGrid />
    </div>
  );
}
