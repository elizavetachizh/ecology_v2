import { useTenant } from "../../../entities/tenant";
import { Pod9ReportForm } from "../../../features/generate-report";
import { REPORTS } from "../../../shared/config/reports";
import { TenantRequiredGate } from "../../../shared/ui";

export function Pod9ReportPage() {
  const { activeTenantId } = useTenant();
  const report = REPORTS.pod9;

  return (
    <TenantRequiredGate
      tenantId={activeTenantId}
      resourceLabel="отчётов"
      description={report.tenantGateDescription}
    >
      <Pod9ReportForm key={activeTenantId} />
    </TenantRequiredGate>
  );
}
