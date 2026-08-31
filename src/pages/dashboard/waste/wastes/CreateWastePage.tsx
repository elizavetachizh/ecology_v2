import { routes } from "../../../../shared/config/routes";
import { useNavigate } from "@tanstack/react-router";
import { useTenant } from "../../../../entities/tenant";
import { WasteCatalogForm } from "../../../../features/waste/upsert-waste";
import { WasteInstructionUnitsCreateHint } from "../../../../features/waste/bind-waste-instruction-unit";
import { TenantRequiredGate, toast } from "../../../../shared/ui";

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
      <div className="space-y-6">
        <WasteCatalogForm
          mode="create"
          onSaved={(waste, { close }) => {
            toast.success("Отход успешно создан");
            if (close) {
              void navigate({ to: routes.directories.wastes.list });
              return;
            }
            void navigate({
              to: routes.directories.wastes.detail,
              params: { wasteId: waste.id },
              search: { instructionId: undefined },
              replace: true,
            });
          }}
          onCancel={() => void navigate({ to: routes.directories.wastes.list })}
        />
        <WasteInstructionUnitsCreateHint />
      </div>
    </TenantRequiredGate>
  );
}
