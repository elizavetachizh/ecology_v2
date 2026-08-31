import {
  Link,
  useNavigate,
  useParams,
  useSearch,
} from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { UnitForm } from "../../../../features/waste/upsert-unit";
import { UnitInstructionWastesSection } from "../../../../features/waste/bind-unit-instruction-waste";
import { useTenant } from "../../../../entities/tenant";
import { getUnit, unitsQueryKeys } from "../../../../entities/waste/units";
import {
  AlertDetailPageError,
  Button,
  TenantRequiredGate,
  toast,
} from "../../../../shared/ui";
import { UnitHierarchyBreadcrumb } from "./create/ui/UnitHierarchyBreadcrumb";
import { routes } from "../../../../shared/config/routes";

export function EditUnitPage() {
  const { unitId } = useParams({
    from: routes.directories.units.detail,
  });
  const search = useSearch({ from: routes.directories.units.detail });
  const navigate = useNavigate({
    from: routes.directories.units.detail,
  });
  const { activeTenantId } = useTenant();
  const unitQuery = useQuery({
    queryKey: unitsQueryKeys.detail(activeTenantId ?? "none", unitId),
    queryFn: ({ signal }) => getUnit(unitId, signal),
    enabled: Boolean(activeTenantId),
  });

  const unit = unitQuery.data;

  let content;
  if (unitQuery.isLoading) {
    content = <p className="text-sm text-muted-foreground">Загрузка…</p>;
  } else if (unitQuery.isError || !unit) {
    content = (
      <AlertDetailPageError
        directoryTo={routes.directories.units.list}
        linkLabel="К структурам"
        description="Структурная единица не найдена."
      />
    );
  } else {
    content = (
      <div className="space-y-6">
        <UnitForm
          key={unitId}
          mode="edit"
          activeTenantId={activeTenantId}
          unitId={unitId}
          initial={unit}
          eyebrow={
            <UnitHierarchyBreadcrumb tenantId={activeTenantId} unit={unit} />
          }
          onSaved={(saved, { close }) => {
            toast.success(
              saved.is_pod9
                ? "Журнал ПОД-9 успешно обновлён"
                : "Единица успешно обновлена",
            );
            if (close)
              void navigate({
                to: routes.directories.units.list,
                search: { focusId: saved.id },
              });
          }}
          onCancel={() => void navigate({ to: routes.directories.units.list })}
        />

        {unit.is_pod9 ? (
          <UnitInstructionWastesSection
            tenantId={activeTenantId}
            unitId={unitId}
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
        ) : (
          <section className="mx-auto max-w-4xl space-y-3 rounded-xl border border-border bg-card p-4">
            <div className="space-y-1">
              <h2 className="text-sm font-semibold text-foreground">
                Журнал ПОД-9
              </h2>
              <p className="text-sm text-muted-foreground">
                Создайте журнал учёта отходов ПОД-9 в контексте этой структурной
                единицы.
              </p>
            </div>
            <Button asChild size="sm">
              <Link
                to={routes.directories.units.new}
                search={{ parentId: unitId, isPod9: true }}
              >
                <Plus className="size-3.5" />
                Создать журнал ПОД-9
              </Link>
            </Button>
          </section>
        )}
      </div>
    );
  }

  return (
    <TenantRequiredGate
      tenantId={activeTenantId}
      description={
        "Чтобы открыть структурную единицу, выберите организацию в верхней панели."
      }
    >
      {content}
    </TenantRequiredGate>
  );
}
