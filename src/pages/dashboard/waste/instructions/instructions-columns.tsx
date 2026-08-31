import { routes } from "../../../../shared/config/routes";
import { Link } from "@tanstack/react-router";
import {
  InstructionStatusBadge,
  type Instruction,
} from "../../../../entities/waste/instructions";
import {
  DataTableColumnHeader,
  DataTableRowAction,
  DataTableRowActions,
  type ColumnDef,
} from "../../../../shared/ui";
import { Pencil, Trash2 } from "lucide-react";
import { formatDate } from "../../../../shared/lib/format-date";

/** id колонок = API InstructionSortField */
function instructionsColumns(
  setDeletingInstruction: (instruction: Instruction) => void,
): ColumnDef<Instruction>[] {
  return [
    {
      id: "name",
      accessorKey: "name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Наименование" />
      ),
      cell: ({ row }) => (
        <Link
          to={routes.directories.instructions.detail}
          params={{ instructionId: row.original.id }}
          className="font-medium hover:underline"
        >
          {row.original.name}
        </Link>
      ),
    },
    {
      id: "short_name",
      accessorKey: "short_name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Краткое" />
      ),
      cell: ({ row }) => row.original.short_name || "—",
    },
    {
      id: "start_date",
      accessorKey: "start_date",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Начало" />
      ),
      cell: ({ row }) => formatDate(row.original.start_date),
    },
    {
      id: "end_date",
      accessorKey: "end_date",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Окончание" />
      ),
      cell: ({ row }) => formatDate(row.original.end_date),
    },
    {
      id: "status",
      accessorKey: "status",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Статус" />
      ),
      cell: ({ row }) => (
        <InstructionStatusBadge status={row.original.status} />
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
              to={routes.directories.instructions.detail}
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
  ];
}
export { instructionsColumns };
