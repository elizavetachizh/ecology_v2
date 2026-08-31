import { useNavigate, useParams } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useTenant } from "../../../../entities/tenant";
import {
  getStandard,
  standardsQueryKeys,
} from "../../../../entities/waste/standards";
import { StandardForm } from "../../../../features/waste/upsert-standard";
import {
  AlertDetailPageError,
  TenantRequiredGate,
  toast,
} from "../../../../shared/ui";
import { routes } from "../../../../shared/config/routes";

export function EditStandardPage() {
  const { standardId } = useParams({
    from: routes.directories.standards.detail,
  });
  const navigate = useNavigate({
    from: routes.directories.standards.detail,
  });
  const { activeTenantId } = useTenant();

  const standardQuery = useQuery({
    queryKey: standardsQueryKeys.detail(activeTenantId ?? "none", standardId),
    queryFn: ({ signal }) => getStandard(standardId, signal),
    enabled: Boolean(activeTenantId),
  });

  if (standardQuery.isLoading) {
    return <p className="text-sm text-muted-foreground">Загрузка…</p>;
  }

  if (standardQuery.isError || !standardQuery.data) {
    return (
      <AlertDetailPageError
        directoryTo={routes.directories.standards.list}
        linkLabel="К нормативам"
        description="Норматив не найден."
      />
    );
  }

  return (
    <TenantRequiredGate
      tenantId={activeTenantId}
      description="Чтобы открыть норматив, выберите организацию в верхней панели."
    >
      <StandardForm
        mode="edit"
        standardId={standardId}
        initial={standardQuery.data}
        onSaved={(_standard, { close }) => {
          toast.success("Норматив успешно обновлён");
          if (close) void navigate({ to: routes.directories.standards.list });
        }}
        onCancel={() =>
          void navigate({ to: routes.directories.standards.list })
        }
      />
    </TenantRequiredGate>
  );
}
