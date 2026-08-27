import { useNavigate } from "@tanstack/react-router";
import { useTenant } from "../../../../entities/tenant";
import { ContractForm } from "../../../../features/waste/upsert-contract";
import { TenantRequiredGate, toast } from "../../../../shared/ui";

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
        onSaved={(contract) => {
          toast.success("Договор успешно создан");
          void navigate({
            to: "/directories/contracts/$contractId",
            params: { contractId: contract.id },
            replace: true,
          });
        }}
        onCancel={() => void navigate({ to: "/directories/contracts" })}
      />
    </TenantRequiredGate>
  );
}
