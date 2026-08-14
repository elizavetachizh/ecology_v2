import { Link, useNavigate, useParams } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { WasteCatalogForm } from "../../../../features/waste/upsert-waste";
import { useTenant } from "../../../../app/providers/tenant/tenant-context";
import { getWaste, wastesQueryKeys } from "../../../../entities/waste/wastes";
import {
  Alert,
  AlertDescription,
  Button,
  TenantRequiredGate,
} from "../../../../shared/ui";

export function EditWastePage() {
  const { wasteId } = useParams({ from: "/directories/wastes/$wasteId" });
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { activeTenantId } = useTenant();

  const wasteQuery = useQuery({
    queryKey: wastesQueryKeys.detail(activeTenantId ?? "none", wasteId),
    queryFn: ({ signal }) => getWaste(wasteId, signal),
    enabled: Boolean(activeTenantId),
  });

  if (wasteQuery.isLoading) {
    return <p className="text-sm text-muted-foreground">Загрузка…</p>;
  }

  if (wasteQuery.isError || !wasteQuery.data) {
    return (
      <div className="space-y-4">
        <Alert variant="error">
          <AlertDescription>Отход не найден.</AlertDescription>
        </Alert>
        <Button asChild variant="outline" size="sm">
          <Link to="/directories/wastes">К отходам</Link>
        </Button>
      </div>
    );
  }

  return (
    <TenantRequiredGate
      tenantId={activeTenantId}
      description={
        "Чтобы открыть отход, выберите организацию в верхней панели."
      }
    >
      <WasteCatalogForm
        mode="edit"
        initial={wasteQuery.data}
        wasteId={wasteId}
        onSaved={(_waste, { close }) => {
          if (close) {
            void navigate({ to: "/directories/wastes" });
            return;
          }
          void queryClient.invalidateQueries({
            queryKey: wastesQueryKeys.detail(activeTenantId ?? "none", wasteId),
          });
        }}
        onCancel={() => void navigate({ to: "/directories/wastes" })}
      />
    </TenantRequiredGate>
  );
}
