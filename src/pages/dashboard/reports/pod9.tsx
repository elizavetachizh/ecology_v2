import { useTenant } from "../../../entities/tenant";
import { Pod9ReportForm } from "../../../features/generate-report";
import { TenantRequiredGate } from "../../../shared/ui";

export function Pod9ReportPage() {
  const { activeTenantId } = useTenant();

  return (
    <TenantRequiredGate
      tenantId={activeTenantId}
      resourceLabel="отчётов"
      description="Формирование отчёта ПОД-9 доступно после выбора организации в верхней панели."
    >
      <Pod9ReportForm key={activeTenantId} />
    </TenantRequiredGate>
  );
}
