import { useNavigate, useParams } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useTenant } from "../../../../entities/tenant";
import {
  getCounterparty,
  counterpartiesQueryKeys,
} from "../../../../entities/waste/counterparties";
import { CounterpartyForm } from "../../../../features/waste/upsert-counterparty";
import {
  AlertDetailPageError,
  TenantRequiredGate,
  toast,
} from "../../../../shared/ui";
import { routes } from "../../../../shared/config/routes";

export function EditCounterpartyPage() {
  const { counterpartyId } = useParams({
    from: routes.directories.counterparties.detail,
  });
  const navigate = useNavigate({
    from: routes.directories.counterparties.detail,
  });
  const { activeTenantId } = useTenant();

  const counterpartyQuery = useQuery({
    queryKey: counterpartiesQueryKeys.detail(
      activeTenantId ?? "none",
      counterpartyId,
    ),
    queryFn: ({ signal }) => getCounterparty(counterpartyId, signal),
    enabled: Boolean(activeTenantId),
  });

  if (counterpartyQuery.isLoading) {
    return <p className="text-sm text-muted-foreground">Загрузка…</p>;
  }

  if (counterpartyQuery.isError || !counterpartyQuery.data) {
    return (
      <AlertDetailPageError
        directoryTo={routes.directories.counterparties.list}
        linkLabel="К контрагентам"
        description="Контрагент не найден."
      />
    );
  }

  return (
    <TenantRequiredGate
      tenantId={activeTenantId}
      description="Чтобы открыть контрагента, выберите организацию в верхней панели."
    >
      <CounterpartyForm
        mode="edit"
        counterpartyId={counterpartyId}
        initial={counterpartyQuery.data}
        onSaved={(_counterparty, { close }) => {
          toast.success("Контрагент успешно обновлён");
          if (close)
            void navigate({ to: routes.directories.counterparties.list });
        }}
        onCancel={() =>
          void navigate({ to: routes.directories.counterparties.list })
        }
      />
    </TenantRequiredGate>
  );
}
