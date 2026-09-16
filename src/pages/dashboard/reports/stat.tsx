import { useTenant } from "../../../entities/tenant";
import { StatReportForm } from "../../../features/generate-report";
import { REPORTS } from "../../../shared/config/reports";
import { TenantRequiredGate } from "../../../shared/ui";

export function StatReportPage() {
  const { activeTenantId } = useTenant();
  const report = REPORTS.stat1Waste;

  return (
    <TenantRequiredGate
      tenantId={activeTenantId}
      resourceLabel="отчётов"
      description={report.tenantGateDescription}
    >
      <StatReportForm key={activeTenantId} />
    </TenantRequiredGate>
  );
}
