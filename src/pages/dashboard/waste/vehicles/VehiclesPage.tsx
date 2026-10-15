import { useMemo, useState } from "react";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { useTenant } from "../../../../entities/tenant";
import {
  DEFAULT_VEHICLES_LIST_LIMIT,
  deleteVehicle,
  useVehiclesListQuery,
  vehiclesQueryKeys,
  type Vehicle,
  type VehicleSortField,
  type VehicleSortOrder,
} from "../../../../entities/waste/vehicles";
import { queryClient } from "../../../../shared/lib/query-client";
import { ConfirmDialog, toast } from "../../../../shared/ui";
import {
  sortingFromSearch,
  sortingToSearch,
} from "../../../../shared/lib/sorting";
import { DirectoryListChrome } from "../../../../widgets/directory-list";
import { routes } from "../../../../shared/config/routes";
import { vehiclesColumns } from "./vehicles-columns";
import {
  VehiclesFilters,
  type VehiclesFiltersValue,
} from "./ui/vehicles-filters";

export function VehiclesPage() {
  const { activeTenantId } = useTenant();
  const navigate = useNavigate({ from: routes.directories.vehicles.list });
  const search = useSearch({ from: routes.directories.vehicles.list });
  const [deleting, setDeleting] = useState<Vehicle | null>(null);

  const columns = useMemo(() => vehiclesColumns(setDeleting), []);

  const listParams = useMemo(
    () => ({
      search: search.q || undefined,
      status: search.status,
      sort: search.sort ?? ("make" as const),
      order: search.order ?? ("asc" as const),
      limit: search.limit ?? DEFAULT_VEHICLES_LIST_LIMIT,
      offset: search.offset ?? 0,
    }),
    [search],
  );

  const sorting = useMemo(
    () => sortingFromSearch(search.sort ?? "make", search.order ?? "asc"),
    [search.sort, search.order],
  );

  const { items, total, limit, offset, loading, error } = useVehiclesListQuery({
    tenantId: activeTenantId,
    params: listParams,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteVehicle(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: vehiclesQueryKeys.lists(),
      });
      setDeleting(null);
      toast.success("Транспортное средство успешно удалено");
    },
    onError: (err) => toast.error(err.message),
  });

  const patchSearch = (
    patch: VehiclesFiltersValue & {
      sort?: VehicleSortField | undefined;
      order?: VehicleSortOrder | undefined;
      offset?: number;
    },
  ) => {
    void navigate({
      search: (prev) => {
        const next = { ...prev, ...patch };
        if (
          "q" in patch ||
          "status" in patch ||
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
      resourceLabel="транспортных средств"
      error={error}
      errorTitle="Не удалось загрузить транспортные средства"
      header={{
        title: "Транспортные средства",
        description: "Справочник транспорта: марка, модель и госномер.",
        directoryLabel: "Транспортные средства",
        directoryTo: routes.directories.vehicles.list,
        createTo: routes.directories.vehicles.new,
        createLabel: "Добавить транспортное средство",
      }}
      toolbar={
        <VehiclesFilters
          values={{ q: search.q, status: search.status }}
          onChange={patchSearch}
        />
      }
      columns={columns}
      data={items}
      loading={loading}
      emptyTitle="Транспортных средств пока нет"
      emptyDescription="Добавьте первое транспортное средство в справочник."
      sorting={sorting}
      onSortingChange={(next) => {
        const { sort, order } = sortingToSearch(next);
        patchSearch({
          sort: (sort as VehicleSortField | undefined) ?? undefined,
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
          title="Удалить транспортное средство?"
          confirmLabel="Удалить"
          description={
            deleting
              ? `Транспортное средство «${deleting.make} ${deleting.model}» (${deleting.license_plate}) будет удалено. Это действие нельзя отменить.`
              : "Запись будет удалена. Это действие нельзя отменить."
          }
          onConfirm={() => {
            if (deleting) void deleteMutation.mutateAsync(deleting.id);
          }}
        />
      }
    />
  );
}
