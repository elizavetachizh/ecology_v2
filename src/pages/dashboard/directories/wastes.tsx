import { useMemo, useState } from "react";
import { Link, useNavigate, useSearch } from "@tanstack/react-router";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { useMutation } from "@tanstack/react-query";

import { useTenant } from "../../../app/providers/tenant/tenant-context";
import {
  DEFAULT_WASTES_LIST_LIMIT,
  deleteWaste,
  HAZARD_CLASS_LABEL,
  HazardClassValues,
  PHYSICAL_STATE_LABEL,
  PhysicalStateValues,
  UOM_LABEL,
  useWastesListQuery,
  wastesQueryKeys,
  type HazardClass,
  type PhysicalState,
  type Waste,
} from "../../../entities/waste/wastes";
import { queryClient } from "../../../shared/lib/query-client";
import {
  Alert,
  AlertDescription,
  AlertTitle,
  Button,
  ConfirmDialog,
  DataTable,
  DataTablePagination,
  DataTableRowAction,
  DataTableRowActions,
  Input,
  Select,
  type ColumnDef,
} from "../../../shared/ui";

export function WastesDirectoryPage() {
  const { activeTenantId } = useTenant();
  const [deletingWaste, setDeletingWaste] = useState<Waste | null>(null);
  const navigate = useNavigate({ from: "/directories/wastes" });
  const search = useSearch({ from: "/directories/wastes" });
  const [searchInput, setSearchInput] = useState(search.q ?? "");

  const listParams = useMemo(
    () => ({
      search: search.q || undefined,
      hazard_class: search.hazard_class,
      physical_state: search.physical_state,
      sort: search.sort ?? ("name" as const),
      order: search.order ?? ("asc" as const),
      limit: search.limit ?? DEFAULT_WASTES_LIST_LIMIT,
      offset: search.offset ?? 0,
    }),
    [search],
  );

  const {
    items: wastes,
    total,
    limit,
    offset,
    loading,
    error,
  } = useWastesListQuery({
    tenantId: activeTenantId,
    params: listParams,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteWaste(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: wastesQueryKeys.lists(),
      });
      setDeletingWaste(null);
    },
  });

  const patchSearch = (patch: {
    q?: string | undefined;
    hazard_class?: HazardClass | undefined;
    physical_state?: PhysicalState | undefined;
    offset?: number;
  }) => {
    void navigate({
      search: (prev) => {
        const next = { ...prev, ...patch };
        if ("q" in patch || "hazard_class" in patch || "physical_state" in patch) {
          next.offset = patch.offset ?? 0;
        }
        return next;
      },
    });
  };

  const columns = useMemo<ColumnDef<Waste>[]>(
    () => [
      {
        id: "code",
        header: "Код",
        cell: ({ row }) => row.original.waste_classifier.code,
      },
      {
        id: "name",
        header: "Наименование",
        cell: ({ row }) => (
          <Link
            to="/directories/wastes/$wasteId"
            params={{ wasteId: row.original.id }}
            className="font-medium hover:underline"
          >
            {row.original.waste_classifier.name}
          </Link>
        ),
      },
      {
        accessorKey: "hazard_class",
        header: "Класс опасности",
        cell: ({ row }) => HAZARD_CLASS_LABEL[row.original.hazard_class],
      },
      {
        accessorKey: "physical_state",
        header: "Состояние",
        cell: ({ row }) =>
          row.original.physical_state
            ? PHYSICAL_STATE_LABEL[row.original.physical_state]
            : "—",
      },
      {
        accessorKey: "uom",
        header: "Ед. изм.",
        cell: ({ row }) => UOM_LABEL[row.original.uom],
      },
      {
        id: "actions",
        header: () => <div className="text-right">Действия</div>,
        enableSorting: false,
        cell: ({ row }) => (
          <DataTableRowActions>
            <DataTableRowAction asChild label="Изменить отход">
              <Link
                to="/directories/wastes/$wasteId"
                params={{ wasteId: row.original.id }}
              >
                <Pencil />
                Изменить
              </Link>
            </DataTableRowAction>
            <DataTableRowAction
              label="Удалить отход"
              onClick={() => setDeletingWaste(row.original)}
            >
              <Trash2 className="text-destructive" />
              Удалить
            </DataTableRowAction>
          </DataTableRowActions>
        ),
      },
    ],
    [],
  );

  if (!activeTenantId) {
    return (
      <Alert variant="info">
        <AlertTitle>Выберите организацию</AlertTitle>
        <AlertDescription>
          Чтобы работать со справочником отходов, выберите организацию в верхней
          панели.
        </AlertDescription>
      </Alert>
    );
  }

  if (error) {
    return (
      <Alert variant="error">
        <AlertTitle>Не удалось загрузить отходы</AlertTitle>
        <AlertDescription>{error.message}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Отходы
          </h1>
          <p className="text-sm text-muted-foreground">
            Создайте отход в справочнике, затем привяжите его к структурным
            единицам и журналам ПОД-9.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild size="sm">
            <Link to="/directories/wastes/new">
              <Plus className="size-3.5" />
              Создать отход
            </Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link to="/directories">К справочникам</Link>
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Input
          className="max-w-xs"
          placeholder="Поиск по коду или названию"
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
          variant="secondary"
          size="sm"
          onClick={() => patchSearch({ q: searchInput.trim() || undefined })}
        >
          Найти
        </Button>
        <Select
          aria-label="Фильтр по классу опасности"
          className="w-56"
          value={search.hazard_class ?? ""}
          onChange={(e) =>
            patchSearch({
              hazard_class: (e.target.value || undefined) as
                | HazardClass
                | undefined,
            })
          }
        >
          <option value="">Все классы опасности</option>
          {HazardClassValues.map((value) => (
            <option key={value} value={value}>
              {HAZARD_CLASS_LABEL[value]}
            </option>
          ))}
        </Select>
        <Select
          aria-label="Фильтр по агрегатному состоянию"
          className="w-48"
          value={search.physical_state ?? ""}
          onChange={(e) =>
            patchSearch({
              physical_state: (e.target.value || undefined) as
                | PhysicalState
                | undefined,
            })
          }
        >
          <option value="">Все состояния</option>
          {PhysicalStateValues.map((value) => (
            <option key={value} value={value}>
              {PHYSICAL_STATE_LABEL[value]}
            </option>
          ))}
        </Select>
      </div>

      <DataTable
        columns={columns}
        data={wastes}
        getRowId={(row) => row.id}
        emptyTitle="Отходов пока нет"
        emptyDescription="Создайте отход из классификатора — код и наименование подтянутся автоматически."
      />
      <DataTablePagination
        total={total}
        limit={limit}
        offset={offset}
        disabled={loading}
        onOffsetChange={(nextOffset) => patchSearch({ offset: nextOffset })}
      />

      <ConfirmDialog
        open={deletingWaste !== null}
        onOpenChange={(open) => {
          if (!open) setDeletingWaste(null);
        }}
        title="Удалить отход?"
        description={
          <>
            Отход «
            {deletingWaste?.waste_classifier.name ?? "—"}» будет удалён из
            справочника. Это действие нельзя отменить.
          </>
        }
        onConfirm={() => {
          if (deletingWaste) void deleteMutation.mutateAsync(deletingWaste.id);
        }}
      />
    </div>
  );
}
