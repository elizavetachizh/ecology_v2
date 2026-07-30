import {
  DataTableColumnHeader,
  type ColumnDef,
} from "../../../../../shared/ui";
import {
  OPERATION_STATUS_LABEL,
  type OperationRow,
  type OperationStatus,
} from "../model/operations.mock";

const statusClassName: Record<OperationStatus, string> = {
  posted: "bg-success-muted text-success",
  draft: "bg-muted text-muted-foreground",
  needs_review: "bg-warning-muted text-warning-foreground",
  error: "bg-destructive-muted text-destructive",
};

function StatusBadge({ status }: { status: OperationStatus }) {
  return (
    <span
      className={`inline-flex rounded-md px-2 py-0.5 text-xs font-medium ${statusClassName[status]}`}
    >
      {OPERATION_STATUS_LABEL[status]}
    </span>
  );
}

export const operationsColumns: ColumnDef<OperationRow>[] = [
  {
    accessorKey: "date",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Дата" />
    ),
    cell: ({ row }) =>
      new Date(row.original.date).toLocaleDateString("ru-RU"),
  },
  {
    accessorKey: "department",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Структурная единица" />
    ),
  },
  {
    accessorKey: "waste",
    header: "Отход",
    cell: ({ row }) => (
      <span className="max-w-[220px] truncate block" title={row.original.waste}>
        {row.original.waste}
      </span>
    ),
  },
  {
    accessorKey: "operationType",
    header: "Тип операции",
  },
  {
    accessorKey: "quantity",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Количество" />
    ),
    cell: ({ row }) =>
      `${row.original.quantity.toLocaleString("ru-RU")} ${row.original.unit}`,
  },
  {
    accessorKey: "storagePlace",
    header: "Место хранения",
  },
  {
    accessorKey: "document",
    header: "Документ-основание",
  },
  {
    accessorKey: "status",
    header: "Статус",
    cell: ({ row }) => <StatusBadge status={row.original.status} />,
  },
];
