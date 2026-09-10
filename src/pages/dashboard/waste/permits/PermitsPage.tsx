import { useMemo, useState } from "react";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { useTenant } from "../../../../entities/tenant";
import {
  DEFAULT_PERMITS_LIST_LIMIT,
  deletePermit,
  permitsQueryKeys,
  updatePermit,
  usePermitsListQuery,
  type Permit,
  type PermitSortField,
  type PermitStatus,
} from "../../../../entities/waste/permits";
import {
  permitDeleteErrorMessage,
  permitWriteErrorMessage,
} from "../../../../features/waste/upsert-permit";
import { queryClient } from "../../../../shared/lib/query-client";
import { ConfirmDialog, toast } from "../../../../shared/ui";
import {
  sortingFromSearch,
  sortingToSearch,
} from "../../../../shared/lib/sorting";
import { DirectoryListChrome } from "../../../../widgets/directory-list";
import { permitsColumns } from "./permits-columns";
import { PermitsFilters, type PermitsFiltersValue } from "./ui/permits-filters";
import { routes } from "../../../../shared/config/routes";

export function PermitsPage() {
  const { activeTenantId } = useTenant();
  const navigate = useNavigate({ from: routes.directories.permits.list });
  const search = useSearch({ from: routes.directories.permits.list });

  const [deleting, setDeleting] = useState<Permit | null>(null);

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: PermitStatus }) =>
      updatePermit(id, { status }),
    onSuccess: (updated) => {
      void queryClient.invalidateQueries({
        queryKey: permitsQueryKeys.lists(),
      });
      void queryClient.invalidateQueries({
        queryKey: permitsQueryKeys.details(),
      });
      toast.success(
        updated.status === "inactive"
          ? "Разрешение помечено как недействующее"
          : "Разрешение помечено как действующее",
      );
    },
    onError: (err) => toast.error(permitWriteErrorMessage(err)),
  });

  const columns = useMemo(
    () =>
      permitsColumns(setDeleting, (permit, status) => {
        statusMutation.mutate({ id: permit.id, status });
      }),
    [statusMutation],
  );

  const listParams = useMemo(
    () => ({
      search: search.q || undefined,
      status: search.status,
      unit_id: search.unit_id,
      sort: search.sort ?? ("start_date" as const),
      order: search.order ?? ("desc" as const),
      limit: search.limit ?? DEFAULT_PERMITS_LIST_LIMIT,
      offset: search.offset ?? 0,
    }),
    [search],
  );

  const sorting = useMemo(
    () =>
      sortingFromSearch(search.sort ?? "start_date", search.order ?? "desc"),
    [search.sort, search.order],
  );

  const { items, total, limit, offset, loading, error } = usePermitsListQuery({
    tenantId: activeTenantId,
    params: listParams,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deletePermit(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: permitsQueryKeys.lists(),
      });
      setDeleting(null);
      toast.success("Разрешение успешно удалено");
    },
    onError: (err) => toast.error(permitDeleteErrorMessage(err)),
  });

  const patchSearch = (
    patch: PermitsFiltersValue & {
      sort?: PermitSortField | undefined;
      order?: "asc" | "desc" | undefined;
      offset?: number;
    },
  ) => {
    void navigate({
      search: (prev) => {
        const next = { ...prev, ...patch };
        if (
          "q" in patch ||
          "status" in patch ||
          "unit_id" in patch ||
          "sort" in patch ||
          "order" in patch
        ) {
          next.offset = patch.offset ?? 0;
        }
        return next;
      },
    });
  };

  return (
    <DirectoryListChrome
      tenantId={activeTenantId}
      resourceLabel="разрешений"
      error={error}
      errorTitle="Не удалось загрузить разрешения"
      header={{
        title: "Разрешения",
        description:
          "Разрешения на захоронение отходов: номер, подразделение, сроки и лимиты по отходам.",
        directoryLabel: "Разрешения",
        directoryTo: routes.directories.permits.list,
        createTo: routes.directories.permits.new,
        createLabel: "Создать разрешение",
      }}
      toolbar={
        <PermitsFilters
          tenantId={activeTenantId}
          values={{
            q: search.q,
            status: search.status,
            unit_id: search.unit_id,
          }}
          onChange={patchSearch}
        />
      }
      columns={columns}
      data={items}
      loading={loading}
      emptyTitle="Разрешений пока нет"
      emptyDescription="Создайте первое разрешение на захоронение."
      sorting={sorting}
      onSortingChange={(next) => {
        const { sort, order } = sortingToSearch(next);
        patchSearch({
          sort: (sort as PermitSortField | undefined) ?? undefined,
          order,
        });
      }}
      total={total}
      limit={limit}
      offset={offset}
      onOffsetChange={(nextOffset) => patchSearch({ offset: nextOffset })}
      footer={
        <ConfirmDialog
          open={deleting !== null}
          confirmDisabled={deleteMutation.isPending}
          onOpenChange={(open) => {
            if (!open) setDeleting(null);
          }}
          title="Удалить разрешение?"
          confirmLabel="Удалить"
          description={
            <>
              Разрешение «{deleting?.number}» и его лимиты на захоронение будут
              удалены.
            </>
          }
          onConfirm={() => {
            if (deleting) void deleteMutation.mutateAsync(deleting.id);
          }}
        />
      }
    />
  );
}
