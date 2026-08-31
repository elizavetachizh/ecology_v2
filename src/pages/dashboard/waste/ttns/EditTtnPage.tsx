import { useNavigate, useParams } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useTenant } from "../../../../entities/tenant";
import { getTtn, ttnsQueryKeys } from "../../../../entities/waste/ttns";
import { TtnForm } from "../../../../features/waste/upsert-ttn";
import {
  AlertDetailPageError,
  TenantRequiredGate,
  toast,
} from "../../../../shared/ui";
import { routes } from "../../../../shared/config/routes";

export function EditTtnPage() {
  const { ttnId } = useParams({ from: routes.waste.ttns.detail });
  const navigate = useNavigate({ from: routes.waste.ttns.detail });
  const { activeTenantId } = useTenant();

  const ttnQuery = useQuery({
    queryKey: ttnsQueryKeys.detail(activeTenantId ?? "none", ttnId),
    queryFn: ({ signal }) => getTtn(ttnId, signal),
    enabled: Boolean(activeTenantId),
  });

  if (ttnQuery.isLoading) {
    return <p className="text-sm text-muted-foreground">Загрузка…</p>;
  }

  if (ttnQuery.isError || !ttnQuery.data) {
    return (
      <AlertDetailPageError
        directoryTo={routes.waste.ttns.list}
        linkLabel="К журналу ТТН"
        description="ТТН не найдена."
      />
    );
  }

  return (
    <TenantRequiredGate
      tenantId={activeTenantId}
      description="Чтобы открыть ТТН, выберите организацию в верхней панели."
    >
      <TtnForm
        mode="edit"
        ttnId={ttnId}
        initial={ttnQuery.data}
        onSaved={() => {
          toast.success("ТТН успешно обновлена");
        }}
        onCancel={() => void navigate({ to: routes.waste.ttns.list })}
      />
    </TenantRequiredGate>
  );
}
