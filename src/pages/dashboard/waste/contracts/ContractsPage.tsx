import { useMemo, useState } from "react";
import { Link, useNavigate, useSearch } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { useTenant } from "../../../../entities/tenant";
import {
  CONTRACT_STATUS_LABEL,
  CONTRACT_TYPE_LABEL,
  ContractStatusValues,
  ContractTypeValues,
  DEFAULT_CONTRACTS_LIST_LIMIT,
  contractsQueryKeys,
  deleteContract,
  useContractsListQuery,
  type Contract,
  type ContractSortField,
  type ContractSortOrder,
  type ContractStatus,
  type ContractType,
} from "../../../../entities/waste/contracts";
import {
  ContractCounterpartySelect,
  contractDeleteErrorMessage,
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
  ListSearchField,
  PageContextBar,
  Select,
  TenantRequiredGate,
  toast,
} from "../../../../shared/ui";
import {
  sortingFromSearch,
  sortingToSearch,
} from "../../../../shared/lib/sorting";
import { contractsColumns } from "./contracts-columns";

export function ContractsPage() {
  const { activeTenantId } = useTenant();
  const navigate = useNavigate({ from: "/directories/contracts" });
  const search = useSearch({ from: "/directories/contracts" });

  const [deleting, setDeleting] = useState<Contract | null>(null);
  const columns = useMemo(() => contractsColumns(setDeleting), []);

  const listParams = useMemo(
    () => ({
      search: search.q || undefined,
      status: search.status,
      contract_type: search.contract_type,
      counterparty_id: search.counterparty_id,
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

  const patchSearch = (patch: {
    q?: string | undefined;
    status?: ContractStatus | undefined;
    contract_type?: ContractType | undefined;
    counterparty_id?: string | undefined;
    sort?: ContractSortField | undefined;
    order?: ContractSortOrder | undefined;
    offset?: number;
  }) => {
    void navigate({
      search: (prev) => {
        const next = { ...prev, ...patch };
        if (
          "q" in patch ||
          "status" in patch ||
          "contract_type" in patch ||
          "counterparty_id" in patch ||
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
          title="Договоры"
          description="Сначала контрагент, затем договор утилизации с перечнем отходов. Договор перевозки — только если в паспорте способ «по договору перевозки»."
          actions={
            <>
              <Button asChild size="sm">
                <Link to="/directories/contracts/new">
                  <Plus className="size-3.5" />
                  Создать договор
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
            placeholder="Поиск по номеру"
            onSearch={(q) => patchSearch({ q: q || undefined })}
          />
          <Select
            aria-label="Тип договора"
            className="w-44"
            value={search.contract_type ?? ""}
            onChange={(event) =>
              patchSearch({
                contract_type: (event.target.value || undefined) as
                  | ContractType
                  | undefined,
              })
            }
          >
            <option value="">Все типы</option>
            {ContractTypeValues.map((type) => (
              <option key={type} value={type}>
                {CONTRACT_TYPE_LABEL[type]}
              </option>
            ))}
          </Select>
          <Select
            aria-label="Статус договора"
            className="w-44"
            value={search.status ?? ""}
            onChange={(event) =>
              patchSearch({
                status: (event.target.value || undefined) as
                  | ContractStatus
                  | undefined,
              })
            }
          >
            <option value="">Все статусы</option>
            {ContractStatusValues.map((status) => (
              <option key={status} value={status}>
                {CONTRACT_STATUS_LABEL[status]}
              </option>
            ))}
          </Select>
          <div className="w-64">
            <ContractCounterpartySelect
              tenantId={activeTenantId}
              value={search.counterparty_id ?? ""}
              placeholder="Все контрагенты"
              onChange={(id) =>
                patchSearch({ counterparty_id: id || undefined })
              }
            />
          </div>
        </div>

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
          emptyTitle="Договоров пока нет"
          emptyDescription="Создайте договор утилизации с перечнем отходов — он понадобится для сопроводительного паспорта."
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
