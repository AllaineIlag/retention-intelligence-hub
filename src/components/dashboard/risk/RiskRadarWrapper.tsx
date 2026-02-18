import { getRiskRadarData } from "@/app/dashboard/actions-risk";
import { RiskCard } from "./RiskCard";

export async function RiskRadarWrapper() {
    const data = await getRiskRadarData();

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 animate-in slide-in-from-top-4 duration-500">
            <RiskCard
                label={data.dropout.label}
                value={data.dropout.value}
                subValue={data.dropout.subValue}
                status={data.dropout.status}
            />
            <RiskCard
                label={data.manager.label}
                value={data.manager.value}
                subValue={data.manager.subValue}
                status={data.manager.status}
            />
            <RiskCard
                label={data.deptRisk.label}
                value={data.deptRisk.value}
                subValue={data.deptRisk.subValue}
                status={data.deptRisk.status}
            />
        </div>
    );
}
