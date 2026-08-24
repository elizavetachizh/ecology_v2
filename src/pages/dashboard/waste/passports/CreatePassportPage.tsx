import { useNavigate, useSearch } from "@tanstack/react-router";
import { useTenant } from "../../../../entities/tenant";
import { PassportForm } from "../../../../features/waste/upsert-passport";
import { TenantRequiredGate, toast } from "../../../../shared/ui";

export function CreatePassportPage() {
  const navigate = useNavigate();
  const { activeTenantId } = useTenant();
  const search = useSearch({ from: "/waste/passports/new" });

  return (
    <TenantRequiredGate
      tenantId={activeTenantId}
      description="Создание паспорта доступно после выбора организации в верхней панели."
    >
      <PassportForm
        mode="create"
        defaultRecyclingContractId={search.recycling_contract_id}
        onSaved={(passport) => {
          toast.success("Паспорт успешно создан");
          void navigate({
            to: "/waste/passports/$passportId",
            params: { passportId: passport.id },
            replace: true,
          });
        }}
        onCancel={() => void navigate({ to: "/waste/passports" })}
      />
    </TenantRequiredGate>
  );
}
