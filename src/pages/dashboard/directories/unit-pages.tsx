import {
  Link,
  useNavigate,
  useParams,
  useSearch,
} from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { UnitForm } from "../../../features/waste/upsert-unit";
import { UnitInstructionWastesSection } from "../../../features/waste/bind-unit-instruction-waste";
import { useTenant } from "../../../app/providers/tenant/tenant-context";
import { getUnit, unitsQueryKeys } from "../../../entities/waste/units";
import {
  Alert,
  AlertDescription,
  AlertTitle,
  Button,
} from "../../../shared/ui";

export function CreateUnitPage() {
  const navigate = useNavigate();
  const { activeTenantId } = useTenant();
  const { parentId, isPod9 } = useSearch({
    from: "/directories/structure/units/new",
  });

  if (!activeTenantId) {
    return (
      <Alert variant="info">
        <AlertTitle>Выберите организацию</AlertTitle>
        <AlertDescription>
          Создание структурной единицы доступно после выбора организации в
          верхней панели.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <UnitForm
      mode="create"
      activeTenantId={activeTenantId}
      defaultParentId={parentId || undefined}
      defaultIsPod9={Boolean(isPod9)}
      onSaved={(unit, { close }) => {
        // После создания ПОД-9 всегда открываем карточку с привязками отходов.
        if (unit.is_pod9) {
          void navigate({
            to: "/directories/structure/units/$unitId",
            params: { unitId: unit.id },
            search: { instructionId: undefined },
            replace: true,
          });
          return;
        }
        if (close) {
          void navigate({
            to: "/directories/structure",
            search: { focusId: unit.id, expandId: unit.parent_id ?? undefined },
          });
          return;
        }
        void navigate({
          to: "/directories/structure/units/$unitId",
          params: { unitId: unit.id },
          search: { instructionId: undefined },
          replace: true,
        });
      }}
      onCancel={() => void navigate({ to: "/directories/structure" })}
    />
  );
}

export function EditUnitPage() {
  const { unitId } = useParams({
    from: "/directories/structure/units/$unitId",
  });
  const search = useSearch({ from: "/directories/structure/units/$unitId" });
  const navigate = useNavigate({ from: "/directories/structure/units/$unitId" });
  const queryClient = useQueryClient();
  const { activeTenantId } = useTenant();
  const unitQuery = useQuery({
    queryKey: unitsQueryKeys.detail(activeTenantId ?? "none", unitId),
    queryFn: ({ signal }) => getUnit(unitId, signal),
    enabled: Boolean(activeTenantId),
  });

  if (!activeTenantId) {
    return (
      <Alert variant="info">
        <AlertTitle>Выберите организацию</AlertTitle>
        <AlertDescription>
          Чтобы открыть структурную единицу, выберите организацию в верхней
          панели.
        </AlertDescription>
      </Alert>
    );
  }

  if (unitQuery.isLoading) {
    return <p className="text-sm text-muted-foreground">Загрузка…</p>;
  }

  if (unitQuery.isError || !unitQuery.data) {
    return (
      <div className="space-y-4">
        <Alert variant="error">
          <AlertDescription>Структурная единица не найдена.</AlertDescription>
        </Alert>
        <Button asChild variant="outline" size="sm">
          <Link to="/directories/structure">К структуре</Link>
        </Button>
      </div>
    );
  }

  const unit = unitQuery.data;

  return (
    <div className="space-y-6">
      <UnitForm
        mode="edit"
        activeTenantId={activeTenantId}
        unitId={unitId}
        initial={unit}
        onSaved={(saved, { close }) => {
          if (close)
            void navigate({
              to: "/directories/structure",
              search: { focusId: saved.id },
            });
          else
            void queryClient.invalidateQueries({
              queryKey: unitsQueryKeys.detail(activeTenantId, unitId),
            });
        }}
        onCancel={() => void navigate({ to: "/directories/structure" })}
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
      ) : null}
    </div>
  );
}
