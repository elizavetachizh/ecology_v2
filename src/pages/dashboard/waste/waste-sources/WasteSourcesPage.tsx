import { useMemo, useState } from "react";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { useTenant } from "../../../../entities/tenant";
import {
  DEFAULT_WASTE_SOURCES_LIST_LIMIT,
  deleteWasteSource,
  useWasteSourcesListQuery,
  wasteSourcesQueryKeys,
  type WasteSource,
  type WasteSourceSortField,
  type WasteSourceSortOrder,
} from "../../../../entities/waste/waste-sources";
import { WasteSourceFormModal } from "../../../../features/waste/upsert-waste-source";
import { queryClient } from "../../../../shared/lib/query-client";
import {
  Button,
  ConfirmDialog,
  ListSearchField,
  toast,
} from "../../../../shared/ui";
import { wasteSourcesColumns } from "./waste-sources-columns";
import {
  sortingFromSearch,
  sortingToSearch,
} from "../../../../shared/lib/sorting";
import { DirectoryListChrome } from "../../../../widgets/directory-list";
import { routes } from "../../../../shared/config/routes";

export function WasteSourcesPage() {
  const { activeTenantId } = useTenant();
  const navigate = useNavigate({ from: routes.directories.wasteSources.list });
  const search = useSearch({ from: routes.directories.wasteSources.list });

  const [modalMode, setModalMode] = useState<"create" | "edit" | null>(null);
  const [editing, setEditing] = useState<WasteSource | null>(null);
  const [deleting, setDeleting] = useState<WasteSource | null>(null);
  const columns = useMemo(
    () => wasteSourcesColumns(setDeleting, setModalMode, setEditing),
    [],
  );

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

  const sorting = useMemo(
    () => sortingFromSearch(search.sort ?? "name", search.order ?? "asc"),
    [search.sort, search.order],
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
      toast.success("Источник успешно удалён");
    },
    onError: (err) => toast.error(err.message),
  });

  const patchSearch = (patch: {
    q?: string | undefined;
    sort?: WasteSourceSortField | undefined;
    order?: WasteSourceSortOrder | undefined;
    offset?: number;
  }) => {
    void navigate({
      search: (prev) => {
        const next = { ...prev, ...patch };
        if ("q" in patch || "sort" in patch || "order" in patch) {
          next.offset = patch.offset ?? 0;
        }
        return next;
      },
    });
  };

  return (
    <DirectoryListChrome
      tenantId={activeTenantId}
      resourceLabel="источников образования"
      error={error}
      errorTitle="Не удалось загрузить источники"
      header={{
        title: "Источники образования",
        description: "Справочник источников образования отходов организации.",
        directoryLabel: "Источники образования",
        directoryTo: routes.directories.wasteSources.list,
        actions: (
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
        ),
      }}
      toolbar={
        <ListSearchField
          value={search.q ?? ""}
          placeholder="Поиск по наименованию"
          onSearch={(q) => patchSearch({ q: q || undefined })}
        />
      }
      columns={columns}
      data={sources}
      loading={loading}
      emptyTitle="Источников пока нет"
      emptyDescription="Создайте первый источник образования отходов."
      sorting={sorting}
      onSortingChange={(next) => {
        const { sort, order } = sortingToSearch(next);
        patchSearch({
          sort: (sort as WasteSourceSortField | undefined) ?? undefined,
          order,
        });
      }}
      total={total}
      limit={limit}
      offset={offset}
      onOffsetChange={(nextOffset) => patchSearch({ offset: nextOffset })}
      footer={
        <>
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
              toast.success(
                modalMode === "edit"
                  ? "Источник успешно обновлён"
                  : "Источник успешно создан",
              );
              setModalMode(null);
              setEditing(null);
            }}
          />
          <ConfirmDialog
            open={deleting !== null}
            confirmDisabled={deleteMutation.isPending}
            onOpenChange={(open) => {
              if (!open) setDeleting(null);
            }}
            title="Удалить источник?"
            confirmLabel="Удалить"
            description={
              <>
                Источник «{deleting?.name}» будет удалён из справочника. В
                связанных привязках отходов поле источника станет пустым.
              </>
            }
            onConfirm={() => {
              if (deleting) void deleteMutation.mutateAsync(deleting.id);
            }}
          />
        </>
      }
    />
  );
}
