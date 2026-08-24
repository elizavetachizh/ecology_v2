import { useNavigate, useSearch } from "@tanstack/react-router";
import { useTenant } from "../../../../entities/tenant";
import { TtnForm } from "../../../../features/waste/upsert-ttn";
import { TenantRequiredGate, toast } from "../../../../shared/ui";

export function CreateTtnPage() {
  const navigate = useNavigate();
  const { activeTenantId } = useTenant();
  const search = useSearch({ from: "/waste/ttns/new" });

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
            to: "/waste/ttns/$ttnId",
            params: { ttnId: ttn.id },
            replace: true,
          });
        }}
        onCancel={() => void navigate({ to: "/waste/ttns" })}
      />
    </TenantRequiredGate>
  );
}
