import { Link, useNavigate, useParams } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useTenant } from "../../../../entities/tenant";
import {
  getOperation,
  operationsQueryKeys,
} from "../../../../entities/waste/operations";
import { OperationCard } from "../../../../features/waste/create-operation";
import {
  Alert,
  AlertDescription,
  Button,
  TenantRequiredGate,
  toast,
} from "../../../../shared/ui";
import { routes } from "../../../../shared/config/routes";

export function EditOperationPage() {
  const { operationId } = useParams({
    from: routes.waste.operations.detail,
  });
  const navigate = useNavigate({
    from: routes.waste.operations.detail,
  });
  const { activeTenantId } = useTenant();

  const operationQuery = useQuery({
    queryKey: operationsQueryKeys.detail(activeTenantId ?? "none", operationId),
    queryFn: ({ signal }) => getOperation(operationId, signal),
    enabled: Boolean(activeTenantId),
  });

  if (operationQuery.isLoading) {
    return <p className="text-sm text-muted-foreground">Загрузка…</p>;
  }

  if (operationQuery.isError || !operationQuery.data) {
    return (
      <div className="space-y-4">
        <Alert variant="error">
          <AlertDescription>Операция не найдена.</AlertDescription>
        </Alert>
        <Button asChild variant="outline" size="sm">
          <Link to={routes.waste.operations.list}>К журналу операций</Link>
        </Button>
      </div>
    );
  }

  return (
    <TenantRequiredGate
      tenantId={activeTenantId}
      description="Чтобы открыть операцию, выберите организацию в верхней панели."
    >
      <OperationCard
        key={operationQuery.data.id}
        operation={operationQuery.data}
        onCancel={() => void navigate({ to: routes.waste.operations.list })}
        onSaved={(_operation, { close }) => {
          toast.success("Операция успешно обновлена");
          if (close) void navigate({ to: routes.waste.operations.list });
        }}
        onDeleted={() => {
          toast.success("Операция успешно удалена");
          void navigate({ to: routes.waste.operations.list });
        }}
      />
    </TenantRequiredGate>
  );
}
