import { useMemo, useState } from "react";
import { Link, useNavigate, useSearch } from "@tanstack/react-router";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { useTenant } from "../../../app/providers/tenant/tenant-context";
import {
  DEFAULT_WASTE_SOURCES_LIST_LIMIT,
  deleteWasteSource,
  useWasteSourcesListQuery,
  wasteSourcesQueryKeys,
  type WasteSource,
} from "../../../entities/waste/waste-sources";
import { WasteSourceFormModal } from "../../../features/waste/upsert-waste-source";
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
  type ColumnDef,
} from "../../../shared/ui";

export function WasteSourcesPage() {
  const { activeTenantId } = useTenant();
  const navigate = useNavigate({ from: "/directories/waste-sources" });
  const search = useSearch({ from: "/directories/waste-sources" });
  const [searchInput, setSearchInput] = useState(search.q ?? "");

  const [modalMode, setModalMode] = useState<"create" | "edit" | null>(null);
  const [editing, setEditing] = useState<WasteSource | null>(null);
  const [deleting, setDeleting] = useState<WasteSource | null>(null);

  const listParams = useMemo(
    () => ({
      search: search.q || undefined,
      sort: search.sort ?? ("name" as const),
      order: search.order ?? ("asc" as const),
      limit: search.limit ?? DEFAULT_WASTE_SOURCES_LIST_LIMIT,
      offset: search.offset ?? 0,
    }),
    [search],
  );

  const {
    items: sources,
    total,
    limit,
    offset,
    loading,
    error,
  } = useWasteSourcesListQuery({
    tenantId: activeTenantId,
    params: listParams,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteWasteSource(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: wasteSourcesQueryKeys.lists(),
      });
      setDeleting(null);
    },
  });

  const patchSearch = (patch: { q?: string | undefined; offset?: number }) => {
    void navigate({
      search: (prev) => {
        const next = { ...prev, ...patch };
        if ("q" in patch) next.offset = patch.offset ?? 0;
        return next;
      },
    });
  };

  const columns = useMemo<ColumnDef<WasteSource>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Наименование",
        cell: ({ row }) => (
          <span className="font-medium">{row.original.name}</span>
        ),
      },
      {
        id: "actions",
        header: () => <div className="text-right">Действия</div>,
        enableSorting: false,
        cell: ({ row }) => (
          <DataTableRowActions>
            <DataTableRowAction
              label="Изменить источник"
              onClick={() => {
                setEditing(row.original);
                setModalMode("edit");
              }}
            >
              <Pencil />
              Изменить
            </DataTableRowAction>
            <DataTableRowAction
              label="Удалить источник"
              onClick={() => setDeleting(row.original)}
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
          Чтобы работать со справочником источников образования, выберите
          организацию в верхней панели.
        </AlertDescription>
      </Alert>
    );
  }

  if (error) {
    return (
      <Alert variant="error">
        <AlertTitle>Не удалось загрузить источники</AlertTitle>
        <AlertDescription>{error.message}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Источники образования
          </h1>
          <p className="text-sm text-muted-foreground">
            Справочник источников образования отходов организации.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            size="sm"
            onClick={() => {
              setEditing(null);
              setModalMode("create");
            }}
          >
            <Plus className="size-3.5" />
            Добавить источник
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link to="/directories">К справочникам</Link>
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Input
          className="max-w-xs"
          placeholder="Поиск по наименованию"
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
      </div>

      <DataTable
        columns={columns}
        data={sources}
        getRowId={(row) => row.id}
        emptyTitle="Источников пока нет"
        emptyDescription="Создайте первый источник образования отходов."
      />
      <DataTablePagination
        total={total}
        limit={limit}
        offset={offset}
        disabled={loading}
        onOffsetChange={(nextOffset) => patchSearch({ offset: nextOffset })}
      />

      <WasteSourceFormModal
        open={modalMode !== null}
        mode={modalMode === "edit" ? "edit" : "create"}
        initial={editing}
        onOpenChange={(open) => {
          if (!open) {
            setModalMode(null);
            setEditing(null);
          }
        }}
        onSaved={() => {
          setModalMode(null);
          setEditing(null);
        }}
      />

      <ConfirmDialog
        open={deleting !== null}
        onOpenChange={(open) => {
          if (!open) setDeleting(null);
        }}
        title="Удалить источник?"
        confirmLabel="Удалить"
        description={
          <>
            Источник «{deleting?.name}» будет удалён из справочника. В связанных
            привязках отходов поле источника станет пустым.
          </>
        }
        onConfirm={() => {
          if (deleting) void deleteMutation.mutateAsync(deleting.id);
        }}
      />
    </div>
  );
}
