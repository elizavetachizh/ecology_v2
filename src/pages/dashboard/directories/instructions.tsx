import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Pencil, Plus, Trash2 } from "lucide-react";
import {
  Alert,
  AlertDescription,
  AlertTitle,
  Button,
  ConfirmDialog,
  DataTable,
  DataTableRowAction,
  DataTableRowActions,
  type ColumnDef,
} from "../../../shared/ui";
import { getWastesByInstruction } from "../../../entities/waste/directory";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useDebounce } from "../../../shared/hooks";
import {
  deleteInstruction,
  getInstructions,
  INSTRUCTION_STATUS_LABEL,
  instructionsQueryKeys,
  type Instruction,
} from "../../../entities/waste/instructions";
import { queryClient } from "../../../shared/lib/query-client";

export function useInstructionsOptions() {
  const [search, setSearch] = useState<string>("");
  const debouncedSearch = useDebounce(search, 400);
  const instructionsQuery = useQuery({
    queryKey: ["instructions", debouncedSearch],
    queryFn: ({ signal }) =>
      getInstructions(
        { search: debouncedSearch, limit: 20, offset: 0 },
        signal,
      ),
    select: (data) => data.items,
  });

  return {
    options: instructionsQuery.data ?? [],
    loading: instructionsQuery.isLoading,
    error: instructionsQuery.error,
    search,
    setSearch,
  };
}

export function InstructionsPage() {
  const {
    options: instructions,
    loading,
    search,
    setSearch,
  } = useInstructionsOptions();
  const [deletingInstruction, setDeletingInstruction] =
    useState<Instruction | null>(null);

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteInstruction(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: instructionsQueryKeys.lists(),
      });
      setDeletingInstruction(null);
    },
  });

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

      {instructions.length === 0 ? (
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
        emptyTitle="Инструкций пока нет"
        emptyDescription="Создайте первую инструкцию — это отправная точка заполнения справочников."
      />

      <ConfirmDialog
        open={deletingInstruction !== null}
        onOpenChange={(open) => {
          if (!open) setDeletingInstruction(null);
        }}
        title="Удалить инструкцию?"
        description={
          deletingInstruction &&
          getWastesByInstruction(deletingInstruction.id).length > 0 ? (
            <span className="text-destructive">
              Инструкцию «{deletingInstruction.name}» нельзя удалить, пока к ней
              привязаны отходы.
            </span>
          ) : (
            <>
              Инструкция «{deletingInstruction?.name}» будет удалена без
              возможности восстановления.
            </>
          )
        }
        confirmDisabled={
          deletingInstruction !== null &&
          getWastesByInstruction(deletingInstruction.id).length > 0
        }
        onConfirm={() => {
          if (deletingInstruction) {
            void deleteMutation.mutateAsync(deletingInstruction.id);
          }
        }}
      />
    </div>
  );
}
