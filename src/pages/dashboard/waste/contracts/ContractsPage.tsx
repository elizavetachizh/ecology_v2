import { useMemo, useState } from "react";
import { Link, useNavigate, useSearch } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { useTenant } from "../../../../entities/tenant";
import {
  DEFAULT_CONTRACTS_LIST_LIMIT,
  contractsQueryKeys,
  deleteContract,
  updateContract,
  useContractsListQuery,
  type Contract,
  type ContractSortField,
  type ContractStatus,
} from "../../../../entities/waste/contracts";
import {
  contractDeleteErrorMessage,
  contractStatusErrorMessage,
} from "../../../../features/waste/upsert-contract";
import { queryClient } from "../../../../shared/lib/query-client";
import {
  Alert,
  AlertDescription,
  AlertTitle,
  Button,
  ConfirmDialog,
  DataTable,
  DataTablePagination,
  DirectoryBreadcrumb,
  PageContextBar,
  TenantRequiredGate,
  toast,
} from "../../../../shared/ui";
import {
  sortingFromSearch,
  sortingToSearch,
} from "../../../../shared/lib/sorting";
import { contractsColumns } from "./contracts-columns";
import { hasContractsListFilters } from "./ui/has-contracts-list-filters";
import {
  ContractsFilters,
  type ContractsFiltersValue,
} from "./ui/contracts-filters";
import { routes } from "../../../../shared/config/routes";

export function ContractsPage() {
  const { activeTenantId } = useTenant();
  const navigate = useNavigate({ from: routes.directories.contracts.list });
  const search = useSearch({ from: routes.directories.contracts.list });

  const [deleting, setDeleting] = useState<Contract | null>(null);

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: ContractStatus }) =>
      updateContract(id, { status }),
    onSuccess: (updated) => {
      void queryClient.invalidateQueries({
        queryKey: contractsQueryKeys.lists(),
      });
      void queryClient.invalidateQueries({
        queryKey: contractsQueryKeys.details(),
      });
      toast.success(
        updated.status === "inactive"
          ? "Договор помечен как закрытый"
          : "Договор помечен как действующий",
      );
    },
    onError: (err) => toast.error(contractStatusErrorMessage(err)),
  });

  const columns = useMemo(
    () =>
      contractsColumns(setDeleting, (contract, status) => {
        statusMutation.mutate({ id: contract.id, status });
      }),
    [statusMutation],
  );

  const listParams = useMemo(
    () => ({
      search: search.q || undefined,
      status: search.status,
      contract_type: search.contract_type,
      counterparty_id: search.counterparty_id,
      waste_id: search.waste_id,
      sort: search.sort ?? ("start_date" as const),
      order: search.order ?? ("desc" as const),
      limit: search.limit ?? DEFAULT_CONTRACTS_LIST_LIMIT,
      offset: search.offset ?? 0,
    }),
    [search],
  );

  const sorting = useMemo(
    () =>
      sortingFromSearch(search.sort ?? "start_date", search.order ?? "desc"),
    [search.sort, search.order],
  );

  const hasFilters = hasContractsListFilters(search);

  const { items, total, limit, offset, loading, error } = useContractsListQuery(
    {
      tenantId: activeTenantId,
      params: listParams,
    },
  );

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteContract(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: contractsQueryKeys.lists(),
      });
      setDeleting(null);
      toast.success("Договор успешно удалён");
    },
    onError: (err) => toast.error(contractDeleteErrorMessage(err)),
  });

  const patchSearch = (
    patch: ContractsFiltersValue & {
      sort?: ContractSortField | undefined;
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
          "contract_type" in patch ||
          "counterparty_id" in patch ||
          "waste_id" in patch ||
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
        <AlertTitle>Не удалось загрузить договоры</AlertTitle>
        <AlertDescription>{error.message}</AlertDescription>
      </Alert>
    );
  }

  return (
    <TenantRequiredGate tenantId={activeTenantId} resourceLabel="договоров">
      <div className="space-y-4">
        <PageContextBar
          sticky={false}
          eyebrow={
            <DirectoryBreadcrumb
              directoryLabel="Договоры"
              directoryTo={routes.directories.contracts.list}
            />
          }
          title="Договоры"
          description="Сначала контрагент, затем договор утилизации с перечнем отходов. Договор перевозки — только если в паспорте способ «по договору перевозки»."
          actions={
            <Button asChild size="sm">
              <Link to={routes.directories.contracts.new}>
                <Plus className="size-3.5" />
                Создать договор
              </Link>
            </Button>
          }
        />

        <ContractsFilters
          tenantId={activeTenantId}
          values={{
            q: search.q,
            status: search.status,
            contract_type: search.contract_type,
            counterparty_id: search.counterparty_id,
            waste_id: search.waste_id,
          }}
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
              sort: (sort as ContractSortField | undefined) ?? undefined,
              order,
            });
          }}
          emptyTitle={hasFilters ? "Ничего не найдено" : "Договоров пока нет"}
          emptyDescription={
            hasFilters
              ? "Измените фильтры или сбросьте поиск."
              : "Создайте свой первый договор."
          }
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
          title="Удалить договор?"
          confirmLabel="Удалить"
          description={
            <>
              Договор «{deleting?.number}» будет удалён. Если на него ссылается
              паспорт или ТТН, удаление будет отклонено.
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
