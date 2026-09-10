import { useMemo, useState } from "react";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { useTenant } from "../../../../entities/tenant";
import {
  DEFAULT_ORDERS_LIST_LIMIT,
  deleteOrder,
  ordersQueryKeys,
  useOrdersListQuery,
  type Order,
  type OrderSortField,
} from "../../../../entities/waste/orders";
import { orderDeleteErrorMessage } from "../../../../features/waste/upsert-order";
import { queryClient } from "../../../../shared/lib/query-client";
import { ConfirmDialog, toast } from "../../../../shared/ui";
import {
  sortingFromSearch,
  sortingToSearch,
} from "../../../../shared/lib/sorting";
import { formatDate } from "../../../../shared/lib/format-date";
import { DirectoryListChrome } from "../../../../widgets/directory-list";
import { ordersColumns } from "./orders-columns";
import { OrdersFilters, type OrdersFiltersValue } from "./ui/orders-filters";
import { routes } from "../../../../shared/config/routes";

export function OrdersPage() {
  const { activeTenantId } = useTenant();
  const navigate = useNavigate({ from: routes.directories.orders.list });
  const search = useSearch({ from: routes.directories.orders.list });

  const [deleting, setDeleting] = useState<Order | null>(null);

  const columns = useMemo(() => ordersColumns(setDeleting), []);

  const listParams = useMemo(
    () => ({
      search: search.q || undefined,
      status: search.status,
      unit_id: search.unit_id,
      sort: search.sort ?? ("start_date" as const),
      order: search.order ?? ("desc" as const),
      limit: search.limit ?? DEFAULT_ORDERS_LIST_LIMIT,
      offset: search.offset ?? 0,
    }),
    [search],
  );

  const sorting = useMemo(
    () =>
      sortingFromSearch(search.sort ?? "start_date", search.order ?? "desc"),
    [search.sort, search.order],
  );

  const { items, total, limit, offset, loading, error } = useOrdersListQuery({
    tenantId: activeTenantId,
    params: listParams,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteOrder(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ordersQueryKeys.lists(),
      });
      setDeleting(null);
      toast.success("Приказ успешно удалён");
    },
    onError: (err) => toast.error(orderDeleteErrorMessage(err)),
  });

  const patchSearch = (
    patch: OrdersFiltersValue & {
      sort?: OrderSortField | undefined;
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
      resourceLabel="приказов"
      error={error}
      errorTitle="Не удалось загрузить приказы"
      header={{
        title: "Приказы",
        description:
          "Приказы по подразделениям или на всё предприятие: номер и дата начала действия. Документ бессрочный.",
        directoryLabel: "Приказы",
        directoryTo: routes.directories.orders.list,
        createTo: routes.directories.orders.new,
        createLabel: "Создать приказ",
      }}
      toolbar={
        <OrdersFilters
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
      emptyTitle="Приказов пока нет"
      emptyDescription="Создайте первый приказ."
      sorting={sorting}
      onSortingChange={(next) => {
        const { sort, order } = sortingToSearch(next);
        patchSearch({
          sort: (sort as OrderSortField | undefined) ?? undefined,
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
          title="Удалить приказ?"
          confirmLabel="Удалить"
          description={
            <>
              Приказ «{deleting?.number}» от{" "}
              {deleting ? formatDate(deleting.start_date) : ""} будет удалён.
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
