import { useMemo, useState } from "react";
import { Link, useNavigate, useSearch } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { useTenant } from "../../../../entities/tenant";
import {
  DEFAULT_PASSPORTS_LIST_LIMIT,
  deletePassport,
  passportsQueryKeys,
  updatePassport,
  usePassportsListQuery,
  type Passport,
  type PassportSortField,
  type PassportStatus,
} from "../../../../entities/waste/passports";
import {
  passportDeleteErrorMessage,
  passportWriteErrorMessage,
} from "../../../../features/waste/upsert-passport";
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
import { passportsColumns } from "./passports-columns";
import {
  PassportsFilters,
  type PassportsFiltersValue,
} from "./ui/passports-filters";
import { routes } from "../../../../shared/config/routes";

export function PassportsPage() {
  const { activeTenantId } = useTenant();
  const navigate = useNavigate({ from: routes.waste.passports.list });
  const search = useSearch({ from: routes.waste.passports.list });

  const [deleting, setDeleting] = useState<Passport | null>(null);

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: PassportStatus }) =>
      updatePassport(id, { status }),
    onSuccess: (updated) => {
      void queryClient.invalidateQueries({
        queryKey: passportsQueryKeys.lists(),
      });
      void queryClient.invalidateQueries({
        queryKey: passportsQueryKeys.details(),
      });
      toast.success(
        updated.status === "inactive"
          ? "Паспорт помечен как недействующий"
          : "Паспорт помечен как действующий",
      );
    },
    onError: (err) => toast.error(passportWriteErrorMessage(err)),
  });

  const columns = useMemo(
    () =>
      passportsColumns(setDeleting, (passport, status) => {
        statusMutation.mutate({ id: passport.id, status });
      }),
    [statusMutation],
  );

  const listParams = useMemo(
    () => ({
      search: search.q || undefined,
      status: search.status,
      transport_type: search.transport_type,
      unit_id: search.unit_id,
      recycling_contract_id: search.recycling_contract_id,
      date_from: search.date_from,
      date_to: search.date_to,
      sort: search.sort ?? ("date" as const),
      order: search.order ?? ("desc" as const),
      limit: search.limit ?? DEFAULT_PASSPORTS_LIST_LIMIT,
      offset: search.offset ?? 0,
    }),
    [search],
  );

  const sorting = useMemo(
    () => sortingFromSearch(search.sort ?? "date", search.order ?? "desc"),
    [search.sort, search.order],
  );

  const { items, total, limit, offset, loading, error } = usePassportsListQuery(
    {
      tenantId: activeTenantId,
      params: listParams,
    },
  );

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deletePassport(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: passportsQueryKeys.lists(),
      });
      setDeleting(null);
      toast.success("Паспорт успешно удалён");
    },
    onError: (err) => toast.error(passportDeleteErrorMessage(err)),
  });

  const patchSearch = (
    patch: PassportsFiltersValue & {
      sort?: PassportSortField | undefined;
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
          "transport_type" in patch ||
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
        <AlertTitle>Не удалось загрузить паспорта</AlertTitle>
        <AlertDescription>{error.message}</AlertDescription>
      </Alert>
    );
  }

  return (
    <TenantRequiredGate tenantId={activeTenantId} resourceLabel="паспортов">
      <div className="space-y-4">
        <PageContextBar
          sticky={false}
          title="Сопроводительные паспорта"
          description="Сначала договор утилизации с перечнем отходов, затем паспорт. К операциям вывоза паспорт пока не привязан."
          actions={
            <Button asChild size="sm">
              <Link to={routes.waste.passports.new}>
                <Plus className="size-3.5" />
                Создать паспорт
              </Link>
            </Button>
          }
        />

        <PassportsFilters
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
              sort: (sort as PassportSortField | undefined) ?? undefined,
              order,
            });
          }}
          emptyTitle="Паспортов пока нет"
          emptyDescription="Создайте сопроводительный паспорт: реквизиты, договор утилизации, отходы из его перечня."
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
          title="Удалить паспорт?"
          confirmLabel="Удалить"
          description={
            <>
              Сопроводительный паспорт «{deleting?.number}» от{" "}
              {formatDate(deleting?.date ?? null)} будет удалён.
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
