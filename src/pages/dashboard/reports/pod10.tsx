import { useTenant } from "../../../entities/tenant";
import { Pod10ReportForm } from "../../../features/generate-report";
import { REPORTS } from "../../../shared/config/reports";
import { TenantRequiredGate } from "../../../shared/ui";

export function Pod10ReportPage() {
  const { activeTenantId } = useTenant();
  const report = REPORTS.pod10;

  return (
    <TenantRequiredGate
      tenantId={activeTenantId}
      resourceLabel="отчётов"
      description={report.tenantGateDescription}
    >
      <Pod10ReportForm key={activeTenantId} />
    </TenantRequiredGate>
  );
}
