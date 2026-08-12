import { useMemo, useState } from "react";
import { Link, useNavigate, useSearch } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { useTenant } from "../../../../app/providers/tenant/tenant-context";
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
import { useMutation } from "@tanstack/react-query";
import {
  DEFAULT_INSTRUCTIONS_LIST_LIMIT,
  deleteInstruction,
  INSTRUCTION_STATUS_LABEL,
  InstructionStatusValues,
  instructionsQueryKeys,
  useInstructionsListQuery,
  type Instruction,
  type InstructionSortField,
  type InstructionSortOrder,
  type InstructionStatus,
} from "../../../../entities/waste/instructions";
import { queryClient } from "../../../../shared/lib/query-client";
import {
  sortingFromSearch,
  sortingToSearch,
} from "../../../../shared/lib/sorting";
import { instructionsColumns } from "./instructions-columns";

export function InstructionsPage() {
  const { activeTenantId } = useTenant();
  const navigate = useNavigate({ from: "/directories/instructions" });
  const search = useSearch({ from: "/directories/instructions" });
  const [deletingInstruction, setDeletingInstruction] =
    useState<Instruction | null>(null);
  const columns = useMemo(
    () => instructionsColumns(setDeletingInstruction),
    [setDeletingInstruction],
  );

  const listParams = useMemo(
    () => ({
      search: search.q || undefined,
      status: search.status,
      sort: search.sort ?? ("name" as const),
      order: search.order ?? ("asc" as const),
      limit: search.limit ?? DEFAULT_INSTRUCTIONS_LIST_LIMIT,
      offset: search.offset ?? 0,
    }),
    [
      search.q,
      search.status,
      search.sort,
      search.order,
      search.limit,
      search.offset,
    ],
  );

  const sorting = useMemo(
    () => sortingFromSearch(search.sort ?? "name", search.order ?? "asc"),
    [search.sort, search.order],
  );

  const {
    items: instructions,
    total,
    limit,
    offset,
    loading,
    error,
  } = useInstructionsListQuery({
    tenantId: activeTenantId,
    params: listParams,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteInstruction(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: instructionsQueryKeys.lists(),
      });
      setDeletingInstruction(null);
    },
  });

  const patchSearch = (patch: {
    q?: string | undefined;
    status?: InstructionStatus | undefined;
    sort?: InstructionSortField | undefined;
    order?: InstructionSortOrder | undefined;
    offset?: number;
  }) => {
    void navigate({
      search: (prev) => {
        const next = { ...prev, ...patch };
        if (
          "q" in patch ||
          "status" in patch ||
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
        <AlertTitle>Не удалось загрузить инструкции</AlertTitle>
        <AlertDescription>{error.message}</AlertDescription>
      </Alert>
    );
  }

  return (
    <TenantRequiredGate tenantId={activeTenantId} resourceLabel="инструкций">
      <div className="space-y-4">
        <PageContextBar
          sticky={false}
          title="Инструкции"
          description="Первый шаг: создайте инструкцию по обращению с отходами. Затем заполните структурные единицы организации."
          actions={
            <>
              <Button asChild size="sm">
                <Link to="/directories/instructions/new">
                  <Plus className="size-3.5" />
                  Создать инструкцию
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
            placeholder="Поиск по названию или краткому"
            onSearch={(q) => patchSearch({ q: q || undefined })}
          />
          <Select
            aria-label="Статус"
            className="w-44"
            value={search.status ?? ""}
            onChange={(e) => {
              const value = e.target.value;
              patchSearch({
                status: value ? (value as InstructionStatus) : undefined,
              });
            }}
          >
            <option value="">Все статусы</option>
            {InstructionStatusValues.map((status) => (
              <option key={status} value={status}>
                {INSTRUCTION_STATUS_LABEL[status]}
              </option>
            ))}
          </Select>
        </div>

        {!loading && instructions.length === 0 ? (
          <Alert variant="info">
            <AlertTitle>Начните с инструкции</AlertTitle>
            <AlertDescription>
              Эколог сначала создаёт свой документ — инструкцию. После
              сохранения система предложит перейти к созданию структурных
              единиц.
            </AlertDescription>
          </Alert>
        ) : null}

        <DataTable
          columns={columns}
          data={instructions}
          getRowId={(row) => row.id}
          isLoading={loading}
          manualSorting
          sorting={sorting}
          onSortingChange={(next) => {
            const { sort, order } = sortingToSearch(next);
            patchSearch({
              sort: (sort as InstructionSortField | undefined) ?? undefined,
              order,
            });
          }}
          emptyTitle="Инструкций пока нет"
          emptyDescription="Создайте первую инструкцию — это отправная точка заполнения справочников."
        />

        <DataTablePagination
          total={total}
          limit={limit ?? DEFAULT_INSTRUCTIONS_LIST_LIMIT}
          offset={offset ?? 0}
          disabled={loading}
          onOffsetChange={(nextOffset) => patchSearch({ offset: nextOffset })}
        />

        <ConfirmDialog
          open={deletingInstruction !== null}
          confirmDisabled={deleteMutation.isPending}
          onOpenChange={(open) => {
            if (!open) setDeletingInstruction(null);
          }}
          title="Удалить инструкцию?"
          description={
            <>
              Инструкция «{deletingInstruction?.name ?? "—"}» будет удалена без
              возможности восстановления.
            </>
          }
          onConfirm={() => {
            if (deletingInstruction) {
              void deleteMutation.mutateAsync(deletingInstruction.id);
            }
          }}
        />
      </div>
    </TenantRequiredGate>
  );
}
