import { Link, useNavigate, useParams, useSearch } from "@tanstack/react-router";
import { UnitForm } from "../../../features/waste/upsert-unit";
import { useTenant } from "../../../app/providers/tenant/tenant-context";
import { useQuery, useQueryClient } from "@tanstack/react-query";
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
  const { parentId } = useSearch({
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
      defaultParentId={parentId || undefined}
      onSaved={(unit, { close }) => {
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
  const navigate = useNavigate();
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

  return (
    <UnitForm
      mode="edit"
      unitId={unitId}
      initial={unitQuery.data}
      onSaved={(unit, { close }) => {
        if (close)
          void navigate({
            to: "/directories/structure",
            search: { focusId: unit.id },
          });
        else
          void queryClient.invalidateQueries({
            queryKey: unitsQueryKeys.detail(activeTenantId, unitId),
          });
      }}
      onCancel={() => void navigate({ to: "/directories/structure" })}
    />
  );
}
