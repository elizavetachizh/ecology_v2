import { useMemo, useState } from "react";
import { Link, useNavigate, useSearch } from "@tanstack/react-router";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { useTenant } from "../../../app/providers/tenant/tenant-context";
import {
  Alert,
  AlertDescription,
  AlertTitle,
  Button,
  ConfirmDialog,
  DataTable,
  DataTablePagination,
  DataTableRowAction,
  DataTableRowActions,
  Input,
  Select,
  type ColumnDef,
} from "../../../shared/ui";
import { useMutation } from "@tanstack/react-query";
import {
  DEFAULT_INSTRUCTIONS_LIST_LIMIT,
  deleteInstruction,
  INSTRUCTION_STATUS_LABEL,
  InstructionStatusValues,
  instructionsQueryKeys,
  useInstructionsListQuery,
  type Instruction,
  type InstructionStatus,
} from "../../../entities/waste/instructions";
import { queryClient } from "../../../shared/lib/query-client";

function formatDate(value: string | null) {
  if (!value) return "—";
  const [year, month, day] = value.split("-");
  if (!year || !month || !day) return value;
  return `${day}.${month}.${year}`;
}

export function InstructionsPage() {
  const { activeTenantId } = useTenant();
  const navigate = useNavigate({ from: "/directories/instructions" });
  const search = useSearch({ from: "/directories/instructions" });

  const listParams = useMemo(
    () => ({
      search: search.q || undefined,
      status: search.status,
      sort: search.sort ?? ("name" as const),
      order: search.order ?? ("asc" as const),
      limit: search.limit ?? DEFAULT_INSTRUCTIONS_LIST_LIMIT,
      offset: search.offset ?? 0,
    }),
    [search],
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

  const [deletingInstruction, setDeletingInstruction] =
    useState<Instruction | null>(null);
  const [searchInput, setSearchInput] = useState(search.q ?? "");

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
    offset?: number;
  }) => {
    void navigate({
      search: (prev) => {
        const next = { ...prev, ...patch };
        if ("q" in patch || "status" in patch) {
          next.offset = patch.offset ?? 0;
        }
        return next;
      },
    });
  };

  const columns = useMemo<ColumnDef<Instruction>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Наименование",
        cell: ({ row }) => (
          <Link
            to="/directories/instructions/$instructionId"
            params={{ instructionId: row.original.id }}
            className="font-medium hover:underline"
          >
            {row.original.name}
          </Link>
        ),
      },
      {
        accessorKey: "short_name",
        header: "Краткое",
        cell: ({ row }) => row.original.short_name || "—",
      },
      {
        accessorKey: "start_date",
        header: "Начало",
        cell: ({ row }) => formatDate(row.original.start_date),
      },
      {
        accessorKey: "end_date",
        header: "Окончание",
        cell: ({ row }) => formatDate(row.original.end_date),
      },
      {
        accessorKey: "status",
        header: "Статус",
        cell: ({ row }) => (
          <span className="rounded-md bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
            {INSTRUCTION_STATUS_LABEL[row.original.status]}
          </span>
        ),
      },
      {
        id: "actions",
        header: () => <div className="text-right">Действия</div>,
        enableSorting: false,
        cell: ({ row }) => (
          <DataTableRowActions>
            <DataTableRowAction asChild label="Редактировать инструкцию">
              <Link
                to="/directories/instructions/$instructionId"
                params={{ instructionId: row.original.id }}
              >
                <Pencil />
                Изменить
              </Link>
            </DataTableRowAction>
            <DataTableRowAction
              label="Удалить инструкцию"
              onClick={() => setDeletingInstruction(row.original)}
            >
              <Trash2 className="text-destructive" />
              Удалить
            </DataTableRowAction>
          </DataTableRowActions>
        ),
      },
    ],
    [],
  );

  if (!activeTenantId) {
    return (
      <Alert variant="info">
        <AlertTitle>Выберите организацию</AlertTitle>
        <AlertDescription>
          Чтобы работать со справочником инструкций, выберите организацию в
          верхней панели.
        </AlertDescription>
      </Alert>
    );
  }

  if (error) {
    return (
      <Alert variant="error">
        <AlertTitle>Не удалось загрузить инструкции</AlertTitle>
        <AlertDescription>{error.message}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Инструкции
          </h1>
          <p className="text-sm text-muted-foreground">
            Первый шаг: создайте инструкцию по обращению с отходами. Затем
            заполните структурные единицы организации.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild size="sm">
            <Link to="/directories/instructions/new">
              <Plus className="size-3.5" />
              Создать инструкцию
            </Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link to="/directories">К справочникам</Link>
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Input
          className="max-w-xs"
          placeholder="Поиск по названию или краткому"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              patchSearch({ q: searchInput.trim() || undefined });
            }
          }}
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => patchSearch({ q: searchInput.trim() || undefined })}
        >
          Найти
        </Button>
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
            Эколог сначала создаёт свой документ — инструкцию. После сохранения
            система предложит перейти к созданию структурных единиц.
          </AlertDescription>
        </Alert>
      ) : null}

      <DataTable
        columns={columns}
        data={instructions}
        getRowId={(row) => row.id}
        isLoading={loading}
        emptyTitle="Инструкций пока нет"
        emptyDescription="Создайте первую инструкцию — это отправная точка заполнения справочников."
      />

      <DataTablePagination
        total={total}
        limit={limit}
        offset={offset}
        disabled={loading}
        onOffsetChange={(nextOffset) => patchSearch({ offset: nextOffset })}
      />

      <ConfirmDialog
        open={deletingInstruction !== null}
        onOpenChange={(open) => {
          if (!open) setDeletingInstruction(null);
        }}
        title="Удалить инструкцию?"
        description={`Инструкция «{deletingInstruction?.name}» будет удалена без
              возможности восстановления.`}
        confirmDisabled={deletingInstruction !== null}
        onConfirm={() => {
          if (deletingInstruction) {
            void deleteMutation.mutateAsync(deletingInstruction.id);
          }
        }}
      />
    </div>
  );
}
