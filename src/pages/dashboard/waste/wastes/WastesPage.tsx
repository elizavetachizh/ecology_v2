import { useMemo, useState } from "react";
import { Link, useNavigate, useSearch } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { useMutation } from "@tanstack/react-query";

import { useTenant } from "../../../../app/providers/tenant/tenant-context";
import {
  DEFAULT_WASTES_LIST_LIMIT,
  deleteWaste,
  HAZARD_CLASS_LABEL,
  HazardClassValues,
  PHYSICAL_STATE_LABEL,
  PhysicalStateValues,
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
  Select,
  TenantRequiredGate,
} from "../../../../shared/ui";
import { wastesColumns } from "./wastes-columns";

export function WastesDirectoryPage() {
  const { activeTenantId } = useTenant();
  const [deletingWaste, setDeletingWaste] = useState<Waste | null>(null);
  const navigate = useNavigate({ from: "/directories/wastes" });
  const search = useSearch({ from: "/directories/wastes" });
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
    },
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

  if (error) {
    return (
      <Alert variant="error">
        <AlertTitle>Не удалось загрузить отходы</AlertTitle>
        <AlertDescription>{error.message}</AlertDescription>
      </Alert>
    );
  }

  return (
    <TenantRequiredGate tenantId={activeTenantId} resourceLabel="отходов">
      <div className="space-y-4">
        <PageContextBar
          sticky={false}
          title="Отходы"
          description="Создайте отход в справочнике, затем привяжите его к структурным единицам."
          actions={
            <>
              <Button asChild size="sm">
                <Link to="/directories/wastes/new">
                  <Plus className="size-3.5" />
                  Создать отход
                </Link>
              </Button>
              <Button asChild variant="outline" size="sm">
                <Link to="/directories">К справочникам</Link>
              </Button>
            </>
          }
        />

        <div className="flex flex-wrap items-center gap-2">
          <ListSearchField
            value={search.q ?? ""}
            placeholder="Поиск по коду или названию"
            onSearch={(q) => patchSearch({ q: q || undefined })}
          />
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
          isLoading={loading}
          getRowId={(row) => row.id}
          manualSorting
          sorting={sorting}
          onSortingChange={(next) => {
            const { sort, order } = sortingToSearch(next);
            patchSearch({
              sort: (sort as WasteSortField | undefined) ?? undefined,
              order,
            });
          }}
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
      </div>
    </TenantRequiredGate>
  );
}
