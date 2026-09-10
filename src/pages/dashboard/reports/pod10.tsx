import { useTenant } from "../../../entities/tenant";
import { TenantRequiredGate } from "../../../shared/ui";
import { Pod10ReportForm } from "../../../features/generate-report/pod10";

export function Pod10ReportPage() {
  const { activeTenantId } = useTenant();

  return (
    <TenantRequiredGate
      tenantId={activeTenantId}
      resourceLabel="отчётов"
      description="Формирование отчёта ПОД-10 доступно после выбора организации в верхней панели."
    >
      <Pod10ReportForm key={activeTenantId} />
    </TenantRequiredGate>
  );
}
