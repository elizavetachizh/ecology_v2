import { useCallback, useMemo, useState } from "react";
import { Link, useNavigate, useSearch } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import {
  Alert,
  AlertDescription,
  AlertTitle,
  Button,
  ConfirmDialog,
  DataTable,
  ListSearchField,
  PageContextBar,
  TenantRequiredGate,
  type ExpandedState,
} from "../../../../shared/ui";
import {
  deleteUnit,
  unitsQueryKeys,
  useUnitsTreeQuery,
  type UnitSortField,
  type UnitSortOrder,
  type UnitTree,
} from "../../../../entities/waste/units";
import { useTenant } from "../../../../app/providers/tenant/tenant-context";
import { useMutation } from "@tanstack/react-query";
import { queryClient } from "../../../../shared/lib/query-client";
import {
  sortingFromSearch,
  sortingToSearch,
} from "../../../../shared/lib/sorting";
import { unitsColumns } from "./units-columnts";

function mergeExpanded(
  prev: ExpandedState,
  ids: Array<string | null | undefined>,
): ExpandedState {
  if (prev === true) return prev;
  const next: Record<string, boolean> = {
    ...(prev as Record<string, boolean>),
  };
  for (const id of ids) {
    if (id) next[id] = true;
  }
  return next;
}

export function DirectoriesStructurePage() {
  const navigate = useNavigate({ from: "/directories/structure" });
  const search = useSearch({ from: "/directories/structure" });
  const { activeTenantId } = useTenant();

  const treeParams = useMemo(
    () => ({
      search: search.q || undefined,
      sort: search.sort ?? ("name" as const),
      order: search.order ?? ("asc" as const),
    }),
    [search.q, search.sort, search.order],
  );

  const sorting = useMemo(
    () => sortingFromSearch(search.sort ?? "name", search.order ?? "asc"),
    [search.sort, search.order],
  );

  const { tree, loading, error } = useUnitsTreeQuery({
    tenantId: activeTenantId,
    params: treeParams,
  });

  const [deletingUnit, setDeletingUnit] = useState<UnitTree | null>(null);
  const [expanded, setExpanded] = useState<ExpandedState>(() =>
    mergeExpanded({}, [search.expandId, search.focusId]),
  );

  const focusId = search.focusId ?? null;

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteUnit(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: unitsQueryKeys.lists(),
      });
      void queryClient.invalidateQueries({
        queryKey: unitsQueryKeys.trees(),
      });
      setDeletingUnit(null);
    },
  });

  const openCreateUnit = useCallback(
    (parentId?: string, options?: { isPod9?: boolean }) => {
      void navigate({
        to: "/directories/structure/units/new",
        search: {
          parentId: parentId ?? "",
          isPod9: options?.isPod9 ? true : undefined,
        },
      });
    },
    [navigate],
  );

  const patchSearch = (patch: {
    q?: string | undefined;
    sort?: UnitSortField | undefined;
    order?: UnitSortOrder | undefined;
  }) => {
    void navigate({
      search: (prev) => ({
        ...prev,
        ...patch,
      }),
    });
  };

  const columns = useMemo(
    () => unitsColumns(openCreateUnit, setDeletingUnit),
    [openCreateUnit],
  );

  if (error) {
    return (
      <Alert variant="error">
        <AlertTitle>Не удалось загрузить структуру</AlertTitle>
        <AlertDescription>{error.message}</AlertDescription>
      </Alert>
    );
  }

  return (
    <TenantRequiredGate
      tenantId={activeTenantId}
      resourceLabel="структуры организации"
    >
      <div className="space-y-4">
        <PageContextBar
          sticky={false}
          title="Структура организации"
          description="Иерархия структурных единиц: подразделения, цеха, площадки. Дочерние узлы создаются в контексте родителя."
          actions={
            <>
              <Button type="button" size="sm" onClick={() => openCreateUnit()}>
                <Plus className="size-3.5" />
                Добавить структурную единицу
              </Button>
              <Button asChild variant="outline" size="sm">
                <Link to="/directories">К справочникам</Link>
              </Button>
            </>
          }
        />

        <ListSearchField
          value={search.q ?? ""}
          placeholder="Поиск по названию или краткому"
          onSearch={(q) => patchSearch({ q: q || undefined })}
        />

        <DataTable
          columns={columns}
          data={tree}
          getRowId={(row) => row.id}
          getSubRows={(row) => row.children}
          expanded={expanded}
          onExpandedChange={setExpanded}
          isLoading={loading}
          manualSorting
          sorting={sorting}
          onSortingChange={(next) => {
            const { sort, order } = sortingToSearch(next);
            patchSearch({
              sort: (sort as UnitSortField | undefined) ?? undefined,
              order,
            });
          }}
          emptyTitle="Структура пуста"
          emptyDescription="Добавьте структурную единицу."
          getRowClassName={(row) => {
            if (focusId && row.original.id === focusId) {
              return "bg-info-muted/60 ring-1 ring-inset ring-info/30";
            }
            return undefined;
          }}
        />

        <ConfirmDialog
          open={deletingUnit !== null}
          onOpenChange={(open) => {
            if (!open) setDeletingUnit(null);
          }}
          title="Удалить структурную единицу?"
          description={
            deletingUnit ? (
              <>
                Единица «{deletingUnit.name}» будет удалена. Убедитесь, что нет
                зависимых данных.
              </>
            ) : null
          }
          onConfirm={() => {
            if (!deletingUnit) return;
            void deleteMutation.mutateAsync(deletingUnit.id);
          }}
        />
      </div>
    </TenantRequiredGate>
  );
}
