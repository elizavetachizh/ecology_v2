import { useMemo, useState, useSyncExternalStore } from "react";
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
import {
  getInstructions,
  INSTRUCTION_STATUS_LABEL,
  subscribeInstructions,
  deleteInstruction,
  type Instruction,
} from "../../../entities/regulatory-document";
import { getWastesByInstruction } from "./model/pod9-wastes.store";

export function InstructionsPage() {
  const [deletingInstruction, setDeletingInstruction] =
    useState<Instruction | null>(null);
  const list = useSyncExternalStore(
    subscribeInstructions,
    getInstructions,
    getInstructions,
  );

  const columns = useMemo<ColumnDef<Instruction>[]>(
    () => [
      {
        accessorKey: "title",
        header: "Наименование",
        cell: ({ row }) => (
          <Link
            to="/directories/instructions/$instructionId"
            params={{ instructionId: row.original.id }}
            className="font-medium hover:underline"
          >
            {row.original.title}
          </Link>
        ),
      },
      {
        accessorKey: "number",
        header: "Номер",
        cell: ({ row }) => row.original.number,
      },
      {
        accessorKey: "approvedAt",
        header: "Дата утверждения",
        cell: ({ row }) => row.original.approvedAt,
      },
      {
        accessorKey: "responsible",
        header: "Ответственный",
        cell: ({ row }) => row.original.responsible,
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

      {list.length === 0 ? (
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
        data={list}
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
              Инструкцию «{deletingInstruction.title}» нельзя удалить, пока к
              ней привязаны отходы.
            </span>
          ) : (
            <>
              Инструкция «{deletingInstruction?.title}» будет удалена без
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
            deleteInstruction(deletingInstruction.id);
          }
        }}
      />
    </div>
  );
}
