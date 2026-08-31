import { useNavigate, useSearch } from "@tanstack/react-router";
import { useTenant } from "../../../../entities/tenant";
import { PassportForm } from "../../../../features/waste/upsert-passport";
import { TenantRequiredGate, toast } from "../../../../shared/ui";
import { routes } from "../../../../shared/config/routes";

export function CreatePassportPage() {
  const navigate = useNavigate();
  const { activeTenantId } = useTenant();
  const search = useSearch({ from: routes.waste.passports.new });

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
            to: routes.waste.passports.detail,
            params: { passportId: passport.id },
            replace: true,
          });
        }}
        onCancel={() => void navigate({ to: routes.waste.passports.list })}
      />
    </TenantRequiredGate>
  );
}
