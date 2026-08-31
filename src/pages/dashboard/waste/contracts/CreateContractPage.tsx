import { useNavigate } from "@tanstack/react-router";
import { useTenant } from "../../../../entities/tenant";
import { ContractForm } from "../../../../features/waste/upsert-contract";
import { TenantRequiredGate, toast } from "../../../../shared/ui";
import { routes } from "../../../../shared/config/routes";

export function CreateContractPage() {
  const navigate = useNavigate();
  const { activeTenantId } = useTenant();

  return (
    <TenantRequiredGate
      tenantId={activeTenantId}
      description="Создание договора доступно после выбора организации в верхней панели."
    >
      <ContractForm
        tenantId={activeTenantId}
        mode="create"
        onSaved={(contract, { close }) => {
          toast.success("Договор успешно создан");
          if (close) {
            void navigate({ to: routes.directories.contracts.list });
            return;
          }
          void navigate({
            to: routes.directories.contracts.detail,
            params: { contractId: contract.id },
            replace: true,
          });
        }}
        onCancel={() =>
          void navigate({ to: routes.directories.contracts.list })
        }
      />
    </TenantRequiredGate>
  );
}
