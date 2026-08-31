import { useNavigate, useParams } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useTenant } from "../../../../entities/tenant";
import {
  getPermit,
  permitsQueryKeys,
} from "../../../../entities/waste/permits";
import { PermitForm } from "../../../../features/waste/upsert-permit";
import {
  AlertDetailPageError,
  TenantRequiredGate,
  toast,
} from "../../../../shared/ui";
import { routes } from "../../../../shared/config/routes";

export function EditPermitPage() {
  const { permitId } = useParams({
    from: routes.directories.permits.detail,
  });
  const navigate = useNavigate({
    from: routes.directories.permits.detail,
  });
  const { activeTenantId } = useTenant();

  const permitQuery = useQuery({
    queryKey: permitsQueryKeys.detail(activeTenantId ?? "none", permitId),
    queryFn: ({ signal }) => getPermit(permitId, signal),
    enabled: Boolean(activeTenantId),
  });

  if (permitQuery.isLoading) {
    return <p className="text-sm text-muted-foreground">Загрузка…</p>;
  }

  if (permitQuery.isError || !permitQuery.data) {
    return (
      <AlertDetailPageError
        directoryTo={routes.directories.permits.list}
        linkLabel="К разрешениям"
        description="Разрешение не найдено."
      />
    );
  }

  return (
    <TenantRequiredGate
      tenantId={activeTenantId}
      description="Чтобы открыть разрешение, выберите организацию в верхней панели."
    >
      <PermitForm
        mode="edit"
        permitId={permitId}
        initial={permitQuery.data}
        onSaved={(_permit, { close }) => {
          toast.success("Разрешение успешно обновлено");
          if (close) void navigate({ to: routes.directories.permits.list });
        }}
        onCancel={() => void navigate({ to: routes.directories.permits.list })}
      />
    </TenantRequiredGate>
  );
}
