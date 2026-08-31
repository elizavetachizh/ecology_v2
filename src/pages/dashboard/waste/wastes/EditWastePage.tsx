import { useNavigate, useParams, useSearch } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { WasteCatalogForm } from "../../../../features/waste/upsert-waste";
import { WasteInstructionUnitsSection } from "../../../../features/waste/bind-waste-instruction-unit";
import { useTenant } from "../../../../entities/tenant";
import { getWaste, wastesQueryKeys } from "../../../../entities/waste/wastes";
import {
  AlertDetailPageError,
  TenantRequiredGate,
  toast,
} from "../../../../shared/ui";
import { routes } from "../../../../shared/config/routes";

export function EditWastePage() {
  const { wasteId } = useParams({ from: routes.directories.wastes.detail });
  const search = useSearch({ from: routes.directories.wastes.detail });
  const navigate = useNavigate({ from: routes.directories.wastes.detail });
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
      <AlertDetailPageError
        directoryTo={routes.directories.wastes.list}
        linkLabel="К отходам"
        description="Отход не найден."
      />
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
            if (close) void navigate({ to: routes.directories.wastes.list });
          }}
          onCancel={() => void navigate({ to: routes.directories.wastes.list })}
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
