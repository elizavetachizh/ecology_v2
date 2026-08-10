import { useCallback, useMemo, useState } from "react";
import { Link, useNavigate, useSearch } from "@tanstack/react-router";
import { Pencil, Plus, Trash2 } from "lucide-react";
import {
  Alert,
  AlertDescription,
  AlertTitle,
  Button,
  ConfirmDialog,
  DataTable,
  DataTableExpandCell,
  DataTableRowAction,
  DataTableRowActions,
  Input,
  type ColumnDef,
  type ExpandedState,
} from "../../../shared/ui";
import {
  deleteUnit,
  unitsQueryKeys,
  useUnitsTreeQuery,
  type UnitTree,
} from "../../../entities/waste/units";
import { useTenant } from "../../../app/providers/tenant/tenant-context";
import { useMutation } from "@tanstack/react-query";
import { queryClient } from "../../../shared/lib/query-client";

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
      sort: "name" as const,
      order: "asc" as const,
    }),
    [search.q],
  );

  const { tree, loading, error } = useUnitsTreeQuery({
    tenantId: activeTenantId,
    params: treeParams,
  });

  const [deletingUnit, setDeletingUnit] = useState<UnitTree | null>(null);
  const [searchInput, setSearchInput] = useState(search.q ?? "");
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
    (parentId?: string) => {
      void navigate({
        to: "/directories/structure/units/new",
        search: { parentId: parentId ?? "" },
      });
    },
    [navigate],
  );

  const patchSearch = (patch: { q?: string | undefined }) => {
    void navigate({
      search: (prev) => ({
        ...prev,
        ...patch,
      }),
    });
  };

  const columns = useMemo<ColumnDef<UnitTree>[]>(
    () => [
      {
        id: "name",
        header: "Название",
        accessorKey: "name",
        cell: ({ row }) => (
          <DataTableExpandCell row={row}>
            <Link
              to="/directories/structure/units/$unitId"
              params={{ unitId: row.original.id }}
              className="font-medium hover:underline"
              onClick={(event) => event.stopPropagation()}
            >
              {row.original.name}
            </Link>
          </DataTableExpandCell>
        ),
      },
      {
        id: "short_name",
        header: "Краткое",
        accessorKey: "short_name",
        cell: ({ row }) => row.original.short_name || "—",
      },
      {
        id: "region",
        header: "Регион",
        cell: ({ row }) => row.original.region?.name ?? "—",
      },
      {
        id: "district",
        header: "Район",
        cell: ({ row }) => row.original.district?.name ?? "—",
      },
      {
        id: "actions",
        header: () => <div className="text-right">Действия</div>,
        enableSorting: false,
        cell: ({ row }) => (
          <DataTableRowActions>
            <DataTableRowAction
              label="Добавить дочернюю единицу"
              onClick={() => openCreateUnit(row.original.id)}
            >
              <Plus />
              Дочерняя
            </DataTableRowAction>
            <DataTableRowAction asChild label="Редактировать единицу">
              <Link
                to="/directories/structure/units/$unitId"
                params={{ unitId: row.original.id }}
              >
                <Pencil />
                Изменить
              </Link>
            </DataTableRowAction>
            <DataTableRowAction
              label="Удалить единицу"
              onClick={() => setDeletingUnit(row.original)}
            >
              <Trash2 className="text-destructive" />
              Удалить
            </DataTableRowAction>
          </DataTableRowActions>
        ),
      },
    ],
    [openCreateUnit],
  );

  if (!activeTenantId) {
    return (
      <Alert variant="info">
        <AlertTitle>Выберите организацию</AlertTitle>
        <AlertDescription>
          Чтобы работать со структурой организации, выберите организацию в
          верхней панели.
        </AlertDescription>
      </Alert>
    );
  }

  if (error) {
    return (
      <Alert variant="error">
        <AlertTitle>Не удалось загрузить структуру</AlertTitle>
        <AlertDescription>{error.message}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Структура организации
          </h1>
          <p className="text-sm text-muted-foreground">
            Иерархия структурных единиц: подразделения, цеха, площадки. Дочерние
            узлы создаются в контексте родителя.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="button" size="sm" onClick={() => openCreateUnit()}>
            <Plus className="size-3.5" />
            Добавить структурную единицу
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link to="/directories">К справочникам</Link>
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Input
          className="max-w-xs"
          placeholder="Поиск по названию или краткому"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              patchSearch({ q: searchInput.trim() || undefined });
            }
          }}
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => patchSearch({ q: searchInput.trim() || undefined })}
        >
          Найти
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={tree}
        getRowId={(row) => row.id}
        getSubRows={(row) => row.children}
        expanded={expanded}
        onExpandedChange={setExpanded}
        isLoading={loading}
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
  );
}
