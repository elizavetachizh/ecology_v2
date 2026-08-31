import { useNavigate, useSearch } from "@tanstack/react-router";
import { useTenant } from "../../../../entities/tenant";
import { TtnForm } from "../../../../features/waste/upsert-ttn";
import { TenantRequiredGate, toast } from "../../../../shared/ui";
import { routes } from "../../../../shared/config/routes";

export function CreateTtnPage() {
  const navigate = useNavigate();
  const { activeTenantId } = useTenant();
  const search = useSearch({ from: routes.waste.ttns.new });

  return (
    <TenantRequiredGate
      tenantId={activeTenantId}
      description="Создание ТТН доступно после выбора организации в верхней панели."
    >
      <TtnForm
        mode="create"
        defaultRecyclingContractId={search.recycling_contract_id}
        onSaved={(ttn) => {
          toast.success("ТТН успешно создана");
          void navigate({
            to: routes.waste.ttns.detail,
            params: { ttnId: ttn.id },
            replace: true,
          });
        }}
        onCancel={() => void navigate({ to: routes.waste.ttns.list })}
      />
    </TenantRequiredGate>
  );
}
