import { routes } from "../../../../shared/config/routes";
import { Link, useNavigate, useSearch } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  Alert,
  AlertDescription,
  Button,
  TenantRequiredGate,
  toast,
} from "../../../../shared/ui";
import { useTenant } from "../../../../entities/tenant";
import { getUnit, unitsQueryKeys } from "../../../../entities/waste/units";
import { UnitForm } from "../../../../features/waste/upsert-unit";
import { UnitInstructionWastesCreateHint } from "../../../../features/waste/bind-unit-instruction-waste";
import { UnitHierarchyBreadcrumb } from "./create/ui/UnitHierarchyBreadcrumb";

export function CreateUnitPage() {
  const navigate = useNavigate();
  const { activeTenantId } = useTenant();
  const { parentId, isPod9 } = useSearch({
    from: routes.directories.units.new,
  });
  const hasParent = Boolean(parentId);

  const parentQuery = useQuery({
    queryKey: unitsQueryKeys.detail(
      activeTenantId ?? "none",
      parentId || "none",
    ),
    queryFn: ({ signal }) => getUnit(parentId, signal),
    enabled: Boolean(activeTenantId && parentId),
  });

  const parent = parentQuery.data;
  const currentLabel = isPod9
    ? "Новая единица ПОД-9"
    : "Новая структурная единица";

  let content;
  if (hasParent && parentQuery.isLoading) {
    content = <p className="text-sm text-muted-foreground">Загрузка…</p>;
  } else if (hasParent && (parentQuery.isError || !parentQuery.data)) {
    content = (
      <div className="space-y-4">
        <Alert variant="error">
          <AlertDescription>Структурная единица не найдена.</AlertDescription>
        </Alert>
        <Button asChild variant="outline" size="sm">
          <Link to={routes.directories.units.list}>К структурам</Link>
        </Button>
      </div>
    );
  } else {
    content = (
      <div className="space-y-6">
        <UnitForm
          mode="create"
          activeTenantId={activeTenantId}
          defaultParentId={parentId || undefined}
          defaultIsPod9={Boolean(isPod9)}
          eyebrow={
            <UnitHierarchyBreadcrumb
              tenantId={activeTenantId}
              unit={parent}
              currentLabel={currentLabel}
            />
          }
          onSaved={(unit, { close }) => {
            toast.success(
              unit.is_pod9
                ? "Журнал ПОД-9 успешно создан"
                : "Единица успешно создана",
            );
            // После создания ПОД-9 всегда открываем карточку с привязками отходов.
            if (unit.is_pod9) {
              void navigate({
                to: routes.directories.units.detail,
                params: { unitId: unit.id },
                search: { instructionId: undefined },
                replace: true,
              });
              return;
            }
            if (close) {
              void navigate({
                to: routes.directories.units.list,
                search: {
                  focusId: unit.id,
                  expandId: unit.parent_id ?? undefined,
                },
              });
              return;
            }
            void navigate({
              to: routes.directories.units.detail,
              params: { unitId: unit.id },
              search: { instructionId: undefined },
              replace: true,
            });
          }}
          onCancel={() => void navigate({ to: routes.directories.units.list })}
        />

        {isPod9 ? <UnitInstructionWastesCreateHint /> : null}
      </div>
    );
  }

  return (
    <TenantRequiredGate
      tenantId={activeTenantId}
      description={
        "Создание структурной единицы доступно после выбора организации в верхней панели."
      }
    >
      {content}
    </TenantRequiredGate>
  );
}
