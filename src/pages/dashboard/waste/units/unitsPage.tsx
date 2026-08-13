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
  DataTablePagination,
  ListSearchField,
  PageContextBar,
  Switch,
  TenantRequiredGate,
  type ExpandedState,
} from "../../../../shared/ui";
import {
  DEFAULT_UNITS_LIST_LIMIT,
  deleteUnit,
  unitsQueryKeys,
  useUnitsListQuery,
  useUnitsTreeQuery,
  type Unit,
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

function toTreeRows(items: Unit[]): UnitTree[] {
  return items.map((item) => ({ ...item, children: [] }));
}

export function DirectoriesStructurePage() {
  const navigate = useNavigate({ from: "/directories/structure" });
  const search = useSearch({ from: "/directories/structure" });
  const { activeTenantId } = useTenant();

  const pod9Only = search.is_pod9 === true;

  const treeParams = useMemo(
    () => ({
      search: search.q || undefined,
      sort: search.sort ?? ("name" as const),
      order: search.order ?? ("asc" as const),
    }),
    [search.q, search.sort, search.order],
  );

  const listParams = useMemo(
    () => ({
      search: search.q || undefined,
      sort: search.sort ?? ("name" as const),
      order: search.order ?? ("asc" as const),
      is_pod9: true as const,
      limit: search.limit ?? DEFAULT_UNITS_LIST_LIMIT,
      offset: search.offset ?? 0,
    }),
    [search.q, search.sort, search.order, search.limit, search.offset],
  );

  const sorting = useMemo(
    () => sortingFromSearch(search.sort ?? "name", search.order ?? "asc"),
    [search.sort, search.order],
  );

  const treeQuery = useUnitsTreeQuery({
    tenantId: activeTenantId,
    params: treeParams,
    enabled: !pod9Only,
  });

  const listQuery = useUnitsListQuery({
    tenantId: activeTenantId,
    params: listParams,
    enabled: pod9Only,
  });

  const rows = useMemo(
    () => (pod9Only ? toTreeRows(listQuery.items) : treeQuery.tree),
    [pod9Only, listQuery.items, treeQuery.tree],
  );
  const loading = pod9Only ? listQuery.loading : treeQuery.loading;
  const error = pod9Only ? listQuery.error : treeQuery.error;

  const [deletingUnit, setDeletingUnit] = useState<Unit | null>(null);
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
    is_pod9?: boolean | undefined;
    limit?: number | undefined;
    offset?: number | undefined;
  }) => {
    void navigate({
      search: (prev) => {
        const next = { ...prev, ...patch };
        if (
          "q" in patch ||
          "sort" in patch ||
          "order" in patch ||
          "is_pod9" in patch
        ) {
          next.offset = patch.offset ?? 0;
        }
        if ("is_pod9" in patch && patch.is_pod9 !== true) {
          next.limit = undefined;
          next.offset = undefined;
        }
        return next;
      },
    });
  };

  const columns = useMemo(
    () =>
      unitsColumns(openCreateUnit, setDeletingUnit, {
        hierarchical: !pod9Only,
      }),
    [openCreateUnit, pod9Only],
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

        <div className="flex flex-wrap items-center gap-3">
          <ListSearchField
            value={search.q ?? ""}
            placeholder="Поиск по названию или краткому"
            onSearch={(q) => patchSearch({ q: q || undefined })}
          />
          <label className="flex items-center gap-2 text-sm text-foreground">
            <Switch
              checked={pod9Only}
              onCheckedChange={(checked) =>
                patchSearch({
                  is_pod9: checked ? true : undefined,
                })
              }
              aria-label="Только журналы ПОД-9"
            />
            Только журналы ПОД-9
          </label>
        </div>

        <DataTable
          columns={columns}
          data={rows}
          getRowId={(row) => row.id}
          getSubRows={pod9Only ? undefined : (row) => row.children}
          expanded={pod9Only ? undefined : expanded}
          onExpandedChange={pod9Only ? undefined : setExpanded}
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
          emptyTitle={pod9Only ? "Журналов ПОД-9 нет" : "Структура пуста"}
          emptyDescription={
            pod9Only
              ? "Создайте журнал ПОД-9 из дерева структуры у родительской единицы."
              : "Добавьте структурную единицу."
          }
          getRowClassName={(row) => {
            if (focusId && row.original.id === focusId) {
              return "bg-info-muted/60 ring-1 ring-inset ring-info/30";
            }
            return undefined;
          }}
        />

        {pod9Only ? (
          <DataTablePagination
            total={listQuery.total}
            limit={listQuery.limit}
            offset={listQuery.offset}
            disabled={loading}
            onOffsetChange={(nextOffset) => patchSearch({ offset: nextOffset })}
          />
        ) : null}

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
