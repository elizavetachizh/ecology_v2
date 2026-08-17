import { Pencil, Trash2 } from "lucide-react";
import {
  OPERATION_TYPE_LABEL,
  type Operation,
} from "../../../../../entities/waste/operations";
import { UOM_LABEL } from "../../../../../entities/waste/wastes";
import { formatDate } from "../../../../../shared/lib/format-date";
import {
  DataTableColumnHeader,
  DataTableRowAction,
  DataTableRowActions,
  type ColumnDef,
} from "../../../../../shared/ui";

function formatAmount(value: string): string {
  const n = Number(value);
  if (!Number.isFinite(n)) return value;
  return n.toLocaleString("ru-RU", { maximumFractionDigits: 6 });
}

function operationsColumns(
  setDeleting: (operation: Operation) => void,
  setModalMode: (mode: "edit" | "create") => void,
  setEditing: (operation: Operation) => void,
): ColumnDef<Operation>[] {
  return [
    {
      id: "date",
      accessorKey: "date",
      enableSorting: false,
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Дата" />
      ),
      cell: ({ row }) => formatDate(row.original.date),
    },
    {
      id: "unit",
      accessorFn: (row) => row.unit.name,
      enableSorting: false,
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Структурная единица" />
      ),
      cell: ({ row }) => row.original.unit.name,
    },
    {
      id: "waste",
      accessorFn: (row) => row.waste.waste_classifier.name,
      enableSorting: false,
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Отход" />
      ),
      cell: ({ row }) => (
        <span
          className="block max-w-[220px] truncate"
          title={row.original.waste.waste_classifier.name}
        >
          {row.original.waste.waste_classifier.name}
        </span>
      ),
    },
    {
      id: "operation_type",
      accessorKey: "operation_type",
      enableSorting: false,
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Тип операции" />
      ),
      cell: ({ row }) => OPERATION_TYPE_LABEL[row.original.operation_type],
    },
    {
      id: "amount",
      accessorKey: "amount",
      enableSorting: false,
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Количество" />
      ),
      cell: ({ row }) =>
        `${formatAmount(row.original.amount)} ${UOM_LABEL[row.original.waste.uom]}`,
    },
    {
      id: "waste_source",
      accessorFn: (row) => row.waste_source?.name,
      enableSorting: false,
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Источник" />
      ),
      cell: ({ row }) => row.original.waste_source?.name ?? "—",
    },
    {
      id: "balance",
      accessorFn: (row) => row.balance.amount,
      enableSorting: false,
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Остаток после операции" />
      ),
      cell: ({ row }) =>
        `${formatAmount(row.original.balance.amount)} ${UOM_LABEL[row.original.waste.uom]}`,
    },
    {
      id: "actions",
      header: () => <div className="text-right">Действия</div>,
      enableSorting: false,
      cell: ({ row }) => (
        <DataTableRowActions>
          <DataTableRowAction
            label="Изменить операцию"
            onClick={() => {
              setEditing(row.original);
              setModalMode("edit");
            }}
          >
            <Pencil />
            Изменить
          </DataTableRowAction>
          <DataTableRowAction
            label="Удалить операцию"
            onClick={() => setDeleting(row.original)}
          >
            <Trash2 className="text-destructive" />
            Удалить
          </DataTableRowAction>
        </DataTableRowActions>
      ),
    },
  ];
}

export { operationsColumns };
