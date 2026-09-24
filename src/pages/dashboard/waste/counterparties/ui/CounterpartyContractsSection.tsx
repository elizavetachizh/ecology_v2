import { useMemo, useState } from "react";
import { Link, useNavigate, useSearch } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { useTenant } from "../../../../../entities/tenant";
import {
  DEFAULT_CONTRACTS_LIST_LIMIT,
  contractsQueryKeys,
  deleteContract,
  updateContract,
  useContractsListQuery,
  type Contract,
  type ContractSortField,
  type ContractStatus,
} from "../../../../../entities/waste/contracts";
import {
  contractDeleteErrorMessage,
  contractStatusErrorMessage,
} from "../../../../../features/waste/upsert-contract";
import { queryClient } from "../../../../../shared/lib/query-client";
import {
  sortingFromSearch,
  sortingToSearch,
} from "../../../../../shared/lib/sorting";
import {
  Alert,
  AlertDescription,
  AlertTitle,
  Button,
  ConfirmDialog,
  DataTable,
  DataTablePagination,
  toast,
} from "../../../../../shared/ui";
import { routes } from "../../../../../shared/config/routes";
import { contractsColumns } from "../../contracts/contracts-columns";
import { hasContractsListFilters } from "../../contracts/ui/has-contracts-list-filters";
import {
  ContractsFilters,
  type ContractsFiltersValue,
} from "../../contracts/ui/contracts-filters";

type CounterpartyContractsSectionProps = {
  counterpartyId: string;
};

export function CounterpartyContractsSection({
  counterpartyId,
}: CounterpartyContractsSectionProps) {
  const { activeTenantId } = useTenant();
  const navigate = useNavigate({
    from: routes.directories.counterparties.detail,
  });
  const search = useSearch({
    from: routes.directories.counterparties.detail,
  });
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
      contractsColumns(
        setDeleting,
        (contract, status) => {
          statusMutation.mutate({ id: contract.id, status });
        },
        { hideCounterparty: true },
      ),
    [statusMutation],
  );

  const listParams = useMemo(
    () => ({
      search: search.q || undefined,
      status: search.status,
      contract_type: search.contract_type,
      counterparty_id: counterpartyId,
      waste_id: search.waste_id,
      sort: search.sort ?? ("start_date" as const),
      order: search.order ?? ("desc" as const),
      limit: search.limit ?? DEFAULT_CONTRACTS_LIST_LIMIT,
      offset: search.offset ?? 0,
    }),
    [counterpartyId, search],
  );

  const sorting = useMemo(
    () =>
      sortingFromSearch(search.sort ?? "start_date", search.order ?? "desc"),
    [search.sort, search.order],
  );

  const filterValues: ContractsFiltersValue = {
    q: search.q,
    status: search.status,
    contract_type: search.contract_type,
    waste_id: search.waste_id,
  };
  const hasFilters = hasContractsListFilters(filterValues);

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

  return (
    <section className="mx-auto max-w-4xl space-y-3 rounded-xl border border-border bg-card p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <h2 className="text-sm font-semibold text-foreground">
            Договоры ({total})
          </h2>
          <p className="text-sm text-muted-foreground">
            Договоры утилизации и перевозки с этим контрагентом.
          </p>
        </div>
        <Button asChild size="sm">
          <Link
            to={routes.directories.contracts.new}
            search={{ counterparty_id: counterpartyId }}
          >
            <Plus className="size-3.5" />
            Создать договор
          </Link>
        </Button>
      </div>

      <ContractsFilters
        tenantId={activeTenantId}
        hideCounterparty
        values={filterValues}
        onChange={patchSearch}
      />

      {error ? (
        <Alert variant="error">
          <AlertTitle>Не удалось загрузить договоры</AlertTitle>
          <AlertDescription>{error.message}</AlertDescription>
        </Alert>
      ) : (
        <>
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
                : "Создайте договор утилизации или перевозки с этим контрагентом."
            }
          />
          <DataTablePagination
            total={total}
            limit={limit}
            offset={offset}
            disabled={loading}
            onOffsetChange={(nextOffset) => patchSearch({ offset: nextOffset })}
          />
        </>
      )}

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
    </section>
  );
}
