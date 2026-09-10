import { useMemo, useState } from "react";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";

import { useTenant } from "../../../../entities/tenant";
import {
  DEFAULT_WASTES_LIST_LIMIT,
  deleteWaste,
  useWastesListQuery,
  wastesQueryKeys,
  type HazardClass,
  type PhysicalState,
  type Waste,
  type WasteSortField,
  type WasteSortOrder,
} from "../../../../entities/waste/wastes";
import { queryClient } from "../../../../shared/lib/query-client";
import {
  sortingFromSearch,
  sortingToSearch,
} from "../../../../shared/lib/sorting";
import { ConfirmDialog, toast } from "../../../../shared/ui";
import { DirectoryListChrome } from "../../../../widgets/directory-list";
import { wastesColumns } from "./wastes-columns";
import { routes } from "../../../../shared/config/routes";
import { WastesFilters } from "./ui/wastes-filters";

export function WastesDirectoryPage() {
  const { activeTenantId } = useTenant();
  const [deletingWaste, setDeletingWaste] = useState<Waste | null>(null);
  const navigate = useNavigate({ from: routes.directories.wastes.list });
  const search = useSearch({ from: routes.directories.wastes.list });
  const columns = wastesColumns(setDeletingWaste);
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

  const sorting = useMemo(
    () => sortingFromSearch(search.sort ?? "name", search.order ?? "asc"),
    [search.sort, search.order],
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
      toast.success("Отход успешно удалён");
    },
    onError: (err) => toast.error(err.message),
  });

  const patchSearch = (patch: {
    q?: string | undefined;
    hazard_class?: HazardClass | undefined;
    physical_state?: PhysicalState | undefined;
    sort?: WasteSortField | undefined;
    order?: WasteSortOrder | undefined;
    offset?: number;
  }) => {
    void navigate({
      search: (prev) => {
        const next = { ...prev, ...patch };
        if (
          "q" in patch ||
          "hazard_class" in patch ||
          "physical_state" in patch ||
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
      resourceLabel="отходов"
      error={error}
      errorTitle="Не удалось загрузить отходы"
      header={{
        title: "Отходы",
        description:
          "Создайте отход в справочнике, затем привяжите его к структурным единицам.",
        directoryLabel: "Отходы",
        directoryTo: routes.directories.wastes.list,
        createTo: routes.directories.wastes.new,
        createLabel: "Создать отход",
      }}
      toolbar={<WastesFilters values={search} onChange={patchSearch} />}
      columns={columns}
      data={wastes}
      loading={loading}
      emptyTitle="Отходов пока нет"
      emptyDescription="Создайте отход из классификатора — код и наименование подтянутся автоматически."
      sorting={sorting}
      onSortingChange={(next) => {
        const { sort, order } = sortingToSearch(next);
        patchSearch({
          sort: (sort as WasteSortField | undefined) ?? undefined,
          order,
        });
      }}
      total={total}
      limit={limit}
      offset={offset}
      onOffsetChange={(nextOffset) => patchSearch({ offset: nextOffset })}
      footer={
        <ConfirmDialog
          open={deletingWaste !== null}
          confirmDisabled={deleteMutation.isPending}
          onOpenChange={(open) => {
            if (!open) setDeletingWaste(null);
          }}
          title="Удалить отход?"
          description={`Отход «${deletingWaste?.waste_classifier.name ?? "—"}» будет удалён из справочника. Это действие нельзя отменить.`}
          onConfirm={() =>
            deletingWaste && void deleteMutation.mutateAsync(deletingWaste.id)
          }
        />
      }
    />
  );
}
