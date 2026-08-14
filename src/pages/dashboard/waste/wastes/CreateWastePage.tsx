import { useNavigate } from "@tanstack/react-router";
import { useTenant } from "../../../../app/providers/tenant/tenant-context";
import { WasteCatalogForm } from "../../../../features/waste/upsert-waste";
import { TenantRequiredGate } from "../../../../shared/ui";

export function CreateWastePage() {
  const navigate = useNavigate();
  const { activeTenantId } = useTenant();

  return (
    <TenantRequiredGate
      tenantId={activeTenantId}
      description={
        "Создание отхода доступно после выбора организации в верхней панели."
      }
    >
      <WasteCatalogForm
        mode="create"
        onSaved={(waste, { close }) => {
          if (close) {
            void navigate({ to: "/directories/wastes" });
            return;
          }
          void navigate({
            to: "/directories/wastes/$wasteId",
            params: { wasteId: waste.id },
            replace: true,
          });
        }}
        onCancel={() => void navigate({ to: "/directories/wastes" })}
      />
    </TenantRequiredGate>
  );
}
