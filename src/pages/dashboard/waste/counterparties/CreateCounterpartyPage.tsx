import { useNavigate } from "@tanstack/react-router";
import { useTenant } from "../../../../entities/tenant";
import { CounterpartyForm } from "../../../../features/waste/upsert-counterparty";
import { TenantRequiredGate, toast } from "../../../../shared/ui";
import { routes } from "../../../../shared/config/routes";

export function CreateCounterpartyPage() {
  const navigate = useNavigate();
  const { activeTenantId } = useTenant();

  return (
    <TenantRequiredGate
      tenantId={activeTenantId}
      description="Создание контрагента доступно после выбора организации в верхней панели."
    >
      <CounterpartyForm
        mode="create"
        onSaved={(counterparty, { close }) => {
          toast.success("Контрагент успешно создан");
          if (close) {
            void navigate({ to: routes.directories.counterparties.list });
            return;
          }
          void navigate({
            to: routes.directories.counterparties.detail,
            params: { counterpartyId: counterparty.id },
            replace: true,
          });
        }}
        onCancel={() =>
          void navigate({ to: routes.directories.counterparties.list })
        }
      />
    </TenantRequiredGate>
  );
}
