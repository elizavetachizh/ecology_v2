import { useMemo, useState } from "react";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { useTenant } from "../../../../entities/tenant";
import {
  DEFAULT_STANDARDS_LIST_LIMIT,
  deleteStandard,
  standardsQueryKeys,
  useStandardsListQuery,
  type Standard,
  type StandardSortField,
} from "../../../../entities/waste/standards";
import { standardDeleteErrorMessage } from "../../../../features/waste/upsert-standard";
import { queryClient } from "../../../../shared/lib/query-client";
import { ConfirmDialog, toast } from "../../../../shared/ui";
import {
  sortingFromSearch,
  sortingToSearch,
} from "../../../../shared/lib/sorting";
import { formatDate } from "../../../../shared/lib/format-date";
import { DirectoryListChrome } from "../../../../widgets/directory-list";
import { standardsColumns } from "./standards-columns";
import {
  StandardsFilters,
  type StandardsFiltersValue,
} from "./ui/standards-filters";
import { routes } from "../../../../shared/config/routes";

function unitLabel(unit: Standard["unit"]) {
  if (!unit) return "Все подразделения";
  return unit.short_name ? `${unit.name} (${unit.short_name})` : unit.name;
}

export function StandardsPage() {
  const { activeTenantId } = useTenant();
  const navigate = useNavigate({ from: routes.directories.standards.list });
  const search = useSearch({ from: routes.directories.standards.list });

  const [deleting, setDeleting] = useState<Standard | null>(null);

  const columns = useMemo(() => standardsColumns(setDeleting), []);

  const listParams = useMemo(
    () => ({
      status: search.status,
      unit_id: search.unit_id,
      sort: search.sort ?? ("start_date" as const),
      order: search.order ?? ("desc" as const),
      limit: search.limit ?? DEFAULT_STANDARDS_LIST_LIMIT,
      offset: search.offset ?? 0,
    }),
    [search],
  );

  const sorting = useMemo(
    () =>
      sortingFromSearch(search.sort ?? "start_date", search.order ?? "desc"),
    [search.sort, search.order],
  );

  const { items, total, limit, offset, loading, error } = useStandardsListQuery(
    {
      tenantId: activeTenantId,
      params: listParams,
    },
  );

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteStandard(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: standardsQueryKeys.lists(),
      });
      setDeleting(null);
      toast.success("Норматив успешно удалён");
    },
    onError: (err) => toast.error(standardDeleteErrorMessage(err)),
  });

  const patchSearch = (
    patch: StandardsFiltersValue & {
      sort?: StandardSortField | undefined;
      order?: "asc" | "desc" | undefined;
      offset?: number;
    },
  ) => {
    void navigate({
      search: (prev) => {
        const next = { ...prev, ...patch };
        if (
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
      resourceLabel="нормативов"
      error={error}
      errorTitle="Не удалось загрузить нормативы"
      header={{
        title: "Нормативы",
        description:
          "Нормативы образования отходов: подразделение, дата начала и перечень отходов. Документ бессрочный.",
        directoryLabel: "Нормативы",
        directoryTo: routes.directories.standards.list,
        createTo: routes.directories.standards.new,
        createLabel: "Создать норматив",
      }}
      toolbar={
        <StandardsFilters
          tenantId={activeTenantId}
          values={{
            status: search.status,
            unit_id: search.unit_id,
          }}
          onChange={patchSearch}
        />
      }
      columns={columns}
      data={items}
      loading={loading}
      emptyTitle="Нормативов пока нет"
      emptyDescription="Создайте первый норматив образования отходов."
      sorting={sorting}
      onSortingChange={(next) => {
        const { sort, order } = sortingToSearch(next);
        patchSearch({
          sort: (sort as StandardSortField | undefined) ?? undefined,
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
          title="Удалить норматив?"
          confirmLabel="Удалить"
          description={
            <>
              Норматив «{deleting ? unitLabel(deleting.unit) : ""}» от{" "}
              {deleting ? formatDate(deleting.start_date) : ""} и перечень
              отходов будут удалены.
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
