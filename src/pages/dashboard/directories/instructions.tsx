import { useMemo, useSyncExternalStore } from "react";
import { Link } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import {
  Alert,
  AlertDescription,
  AlertTitle,
  Button,
  DataTable,
  type ColumnDef,
} from "../../../shared/ui";
import {
  getInstructions,
  INSTRUCTION_STATUS_LABEL,
  subscribeInstructions,
  type Instruction,
} from "./model/instructions.store";

export function InstructionsPage() {
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
    </div>
  );
}
