import { useMemo, useState } from "react";
import { Link, useNavigate, useSearch } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { useTenant } from "../../../../entities/tenant";
import {
  DEFAULT_COUNTERPARTIES_LIST_LIMIT,
  deleteCounterparty,
  useCounterpartiesListQuery,
  counterpartiesQueryKeys,
  type Counterparty,
  type CounterpartySortField,
  type CounterpartySortOrder,
} from "../../../../entities/waste/counterparties";
import { CounterpartyFormModal } from "../../../../features/waste/upsert-counterparty";
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
  Switch,
  TenantRequiredGate,
  toast,
} from "../../../../shared/ui";
import { counterpartiesColumns } from "./counterparties-columns";
import {
  sortingFromSearch,
  sortingToSearch,
} from "../../../../shared/lib/sorting";

export function CounterpartiesPage() {
  const { activeTenantId } = useTenant();
  const navigate = useNavigate({ from: "/directories/counterparties" });
  const search = useSearch({ from: "/directories/counterparties" });

  const [modalMode, setModalMode] = useState<"create" | "edit" | null>(null);
  const [editing, setEditing] = useState<Counterparty | null>(null);
  const [deleting, setDeleting] = useState<Counterparty | null>(null);
  const columns = useMemo(
    () => counterpartiesColumns(setDeleting, setModalMode, setEditing),
    [],
  );

  const showInactive = search.is_active === false;

  const listParams = useMemo(
    () => ({
      search: search.q || undefined,
      is_individual: search.is_individual,
      is_active: !showInactive,
      sort: search.sort ?? ("name" as const),
      order: search.order ?? ("asc" as const),
      limit: search.limit ?? DEFAULT_COUNTERPARTIES_LIST_LIMIT,
      offset: search.offset ?? 0,
    }),
    [search, showInactive],
  );

  const sorting = useMemo(
    () => sortingFromSearch(search.sort ?? "name", search.order ?? "asc"),
    [search.sort, search.order],
  );

  const {
    items: counterparties,
    total,
    limit,
    offset,
    loading,
    error,
  } = useCounterpartiesListQuery({
    tenantId: activeTenantId,
    params: listParams,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteCounterparty(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: counterpartiesQueryKeys.lists(),
      });
      setDeleting(null);
      toast.success("Контрагент успешно удалён");
    },
    onError: (err) => toast.error(err.message),
  });

  const patchSearch = (patch: {
    q?: string | undefined;
    is_individual?: boolean | undefined;
    is_active?: boolean | undefined;
    sort?: CounterpartySortField | undefined;
    order?: CounterpartySortOrder | undefined;
    offset?: number;
  }) => {
    void navigate({
      search: (prev) => {
        const next = { ...prev, ...patch };
        if (
          "q" in patch ||
          "is_individual" in patch ||
          "is_active" in patch ||
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
        <AlertTitle>Не удалось загрузить контрагентов</AlertTitle>
        <AlertDescription>{error.message}</AlertDescription>
      </Alert>
    );
  }

  return (
    <TenantRequiredGate tenantId={activeTenantId} resourceLabel="контрагентов">
      <div className="space-y-4">
        <PageContextBar
          sticky={false}
          title="Контрагенты"
          description="Юрлица и физлица организации."
          actions={
            <>
              <Button
                type="button"
                size="sm"
                onClick={() => {
                  setEditing(null);
                  setModalMode("create");
                }}
              >
                <Plus className="size-3.5" />
                Добавить контрагента
              </Button>
              <Button asChild variant="outline" size="sm">
                <Link to="/directories">К справочникам</Link>
              </Button>
            </>
          }
        />

        <div className="flex flex-wrap items-center gap-3">
          <ListSearchField
            value={search.q ?? ""}
            placeholder="Поиск по УНП, наименованию"
            onSearch={(q) => patchSearch({ q: q || undefined })}
          />
          <Select
            aria-label="Тип контрагента"
            className="w-44"
            value={
              search.is_individual === true
                ? "true"
                : search.is_individual === false
                  ? "false"
                  : ""
            }
            onChange={(event) => {
              const value = event.target.value;
              patchSearch({
                is_individual:
                  value === "true"
                    ? true
                    : value === "false"
                      ? false
                      : undefined,
              });
            }}
          >
            <option value="">Все типы</option>
            <option value="false">Юрлица</option>
            <option value="true">Физлица</option>
          </Select>
          <label className="flex items-center gap-2 text-sm text-foreground">
            <Switch
              checked={showInactive}
              onCheckedChange={(checked) =>
                patchSearch({
                  is_active: checked ? false : undefined,
                })
              }
              aria-label="Показать неактивных"
            />
            Показать неактивных
          </label>
        </div>

        <DataTable
          columns={columns}
          data={counterparties}
          isLoading={loading}
          getRowId={(row) => row.id}
          manualSorting
          sorting={sorting}
          onSortingChange={(next) => {
            const { sort, order } = sortingToSearch(next);
            patchSearch({
              sort: (sort as CounterpartySortField | undefined) ?? undefined,
              order,
            });
          }}
          emptyTitle="Контрагентов пока нет"
          emptyDescription="Добавьте первого контрагента — юрлицо или физлицо организации."
        />
        <DataTablePagination
          total={total}
          limit={limit}
          offset={offset}
          disabled={loading}
          onOffsetChange={(nextOffset) => patchSearch({ offset: nextOffset })}
        />

        <CounterpartyFormModal
          open={modalMode !== null}
          mode={modalMode === "edit" ? "edit" : "create"}
          initial={editing}
          onOpenChange={(open) => {
            if (!open) {
              setModalMode(null);
              setEditing(null);
            }
          }}
          onSaved={() => {
            toast.success(
              modalMode === "edit"
                ? "Контрагент успешно обновлён"
                : "Контрагент успешно создан",
            );
            setModalMode(null);
            setEditing(null);
          }}
        />

        <ConfirmDialog
          open={deleting !== null}
          confirmDisabled={deleteMutation.isPending}
          onOpenChange={(open) => {
            if (!open) setDeleting(null);
          }}
          title="Удалить контрагента?"
          confirmLabel="Удалить"
          description={
            <>
              Контрагент «{deleting?.name}» будет удалён без возможности
              восстановления. Это не снятие флага «Активен».
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
