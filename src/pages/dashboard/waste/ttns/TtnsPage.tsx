import { useMemo, useState } from "react";
import { Link, useNavigate, useSearch } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { useTenant } from "../../../../entities/tenant";
import {
  DEFAULT_TTNS_LIST_LIMIT,
  deleteTtn,
  ttnsQueryKeys,
  useTtnsListQuery,
  type Ttn,
  type TtnSortField,
} from "../../../../entities/waste/ttns";
import { ttnDeleteErrorMessage } from "../../../../features/waste/upsert-ttn";
import { formatDate } from "../../../../shared/lib/format-date";
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
  PageContextBar,
  TenantRequiredGate,
  toast,
} from "../../../../shared/ui";
import { ttnsColumns } from "./ttns-columns";
import { TtnsFilters, type TtnsFiltersValue } from "./ui/ttns-filters";
import { routes } from "../../../../shared/config/routes";

export function TtnsPage() {
  const { activeTenantId } = useTenant();
  const navigate = useNavigate({ from: routes.waste.ttns.list });
  const search = useSearch({ from: routes.waste.ttns.list });

  const [deleting, setDeleting] = useState<Ttn | null>(null);
  const columns = useMemo(() => ttnsColumns(setDeleting), []);

  const listParams = useMemo(
    () => ({
      search: search.q || undefined,
      status: search.status,
      unit_id: search.unit_id,
      recycling_contract_id: search.recycling_contract_id,
      date_from: search.date_from,
      date_to: search.date_to,
      sort: search.sort ?? ("date" as const),
      order: search.order ?? ("desc" as const),
      limit: search.limit ?? DEFAULT_TTNS_LIST_LIMIT,
      offset: search.offset ?? 0,
    }),
    [search],
  );

  const sorting = useMemo(
    () => sortingFromSearch(search.sort ?? "date", search.order ?? "desc"),
    [search.sort, search.order],
  );

  const { items, total, limit, offset, loading, error } = useTtnsListQuery({
    tenantId: activeTenantId,
    params: listParams,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteTtn(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ttnsQueryKeys.lists(),
      });
      setDeleting(null);
      toast.success("ТТН успешно удалена");
    },
    onError: (err) => toast.error(ttnDeleteErrorMessage(err)),
  });

  const patchSearch = (
    patch: TtnsFiltersValue & {
      sort?: TtnSortField | undefined;
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
          "recycling_contract_id" in patch ||
          "date_from" in patch ||
          "date_to" in patch ||
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
        <AlertTitle>Не удалось загрузить ТТН</AlertTitle>
        <AlertDescription>{error.message}</AlertDescription>
      </Alert>
    );
  }

  return (
    <TenantRequiredGate tenantId={activeTenantId} resourceLabel="ТТН">
      <div className="space-y-4">
        <PageContextBar
          sticky={false}
          title="Товарно-транспортные накладные"
          description="ТТН не связан с сопроводительным паспортом — документы ведутся отдельно."
          actions={
            <Button asChild size="sm">
              <Link to={routes.waste.ttns.new}>
                <Plus className="size-3.5" />
                Создать ТТН
              </Link>
            </Button>
          }
        />

        <TtnsFilters
          tenantId={activeTenantId}
          values={search}
          onChange={patchSearch}
        />

        <DataTable
          columns={columns}
          data={items}
          isLoading={loading}
          getRowId={(row) => row.id}
          manualSorting
          sorting={sorting}
          onSortingChange={(next) => {
            const { sort, order } = sortingToSearch(next);
            patchSearch({
              sort: (sort as TtnSortField | undefined) ?? undefined,
              order,
            });
          }}
          emptyTitle="ТТН пока нет"
          emptyDescription="Создайте накладную: номер, дата перевозки, единица и действующий договор утилизации."
        />
        <DataTablePagination
          total={total}
          limit={limit}
          offset={offset}
          disabled={loading}
          onOffsetChange={(nextOffset) => patchSearch({ offset: nextOffset })}
        />

        <ConfirmDialog
          open={deleting !== null}
          confirmDisabled={deleteMutation.isPending}
          onOpenChange={(open) => {
            if (!open) setDeleting(null);
          }}
          title="Удалить ТТН?"
          confirmLabel="Удалить"
          description={
            <>
              ТТН «{deleting?.number}» от {formatDate(deleting?.date ?? null)}{" "}
              будет удалена.
            </>
          }
          onConfirm={() => {
            if (deleting) void deleteMutation.mutateAsync(deleting.id);
          }}
        />
      </div>
    </TenantRequiredGate>
  );
}
