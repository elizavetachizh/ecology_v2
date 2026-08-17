import {
  Link,
  useNavigate,
  useParams,
  useSearch,
} from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { WasteCatalogForm } from "../../../../features/waste/upsert-waste";
import { WasteInstructionUnitsSection } from "../../../../features/waste/bind-waste-instruction-unit";
import { useTenant } from "../../../../entities/tenant";
import { getWaste, wastesQueryKeys } from "../../../../entities/waste/wastes";
import {
  Alert,
  AlertDescription,
  Button,
  TenantRequiredGate,
  toast,
} from "../../../../shared/ui";

export function EditWastePage() {
  const { wasteId } = useParams({ from: "/directories/wastes/$wasteId" });
  const search = useSearch({ from: "/directories/wastes/$wasteId" });
  const navigate = useNavigate({ from: "/directories/wastes/$wasteId" });
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
      <div className="space-y-6">
        <WasteCatalogForm
          mode="edit"
          initial={wasteQuery.data}
          wasteId={wasteId}
          onSaved={(_waste, { close }) => {
            toast.success("Отход успешно обновлён");
            if (close) void navigate({ to: "/directories/wastes" });
          }}
          onCancel={() => void navigate({ to: "/directories/wastes" })}
        />

        <WasteInstructionUnitsSection
          tenantId={activeTenantId}
          wasteId={wasteId}
          instructionId={search.instructionId}
          onInstructionChange={(nextInstructionId) => {
            void navigate({
              search: (prev) => ({
                ...prev,
                instructionId: nextInstructionId,
              }),
              replace: true,
            });
          }}
        />
      </div>
    </TenantRequiredGate>
  );
}
