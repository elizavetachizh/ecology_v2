import { Link, useNavigate, useParams } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useTenant } from "../../../../entities/tenant";
import {
  getPermit,
  permitsQueryKeys,
} from "../../../../entities/waste/permits";
import { PermitForm } from "../../../../features/waste/upsert-permit";
import {
  Alert,
  AlertDescription,
  Button,
  TenantRequiredGate,
  toast,
} from "../../../../shared/ui";

export function EditPermitPage() {
  const { permitId } = useParams({
    from: "/directories/permits/$permitId",
  });
  const navigate = useNavigate({
    from: "/directories/permits/$permitId",
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
      <div className="space-y-4">
        <Alert variant="error">
          <AlertDescription>Разрешение не найдено.</AlertDescription>
        </Alert>
        <Button asChild variant="outline" size="sm">
          <Link to="/directories/permits">К разрешениям</Link>
        </Button>
      </div>
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
        onSaved={() => {
          toast.success("Разрешение успешно обновлено");
        }}
        onCancel={() => void navigate({ to: "/directories/permits" })}
      />
    </TenantRequiredGate>
  );
}
