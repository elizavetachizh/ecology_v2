import { Check, Trash2, X } from "lucide-react";
import {
  canMutateOperation,
  canReviewOperation,
  OPERATION_TYPE_LABEL,
  OperationStatusBadge,
  type Operation,
} from "../../../../../entities/waste/operations";
import { UOM_LABEL } from "../../../../../entities/waste/wastes";
import {
  formatDate,
  formatDateTime,
} from "../../../../../shared/lib/format-date";
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

type OperationsColumnActions = {
  onDelete: (operation: Operation) => void;
  onApprove: (operation: Operation) => void;
  onReject: (operation: Operation) => void;
};

function operationsColumns({
  onDelete,
  onApprove,
  onReject,
}: OperationsColumnActions): ColumnDef<Operation>[] {
  return [
    {
      id: "date",
      accessorKey: "date",
      size: 100,
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Дата" />
      ),
      cell: ({ row }) => formatDate(row.original.date),
    },
    {
      id: "unit",
      accessorFn: (row) => row.unit.name,
      size: 170,
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Структурная единица" />
      ),
      cell: ({ row }) => row.original.unit.name,
    },
    {
      id: "waste",
      accessorFn: (row) => row.waste.waste_classifier.name,
      size: 100,
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Отход" />
      ),
      cell: ({ row }) => (
        <span
          className="block max-w-[220px] truncate"
          title={row.original.waste.waste_classifier.name}
        >
          {row.original.waste.waste_classifier.code}
        </span>
      ),
    },
    {
      id: "operation_type",
      accessorKey: "operation_type",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Тип операции" />
      ),
      cell: ({ row }) => (
        <>
          {OPERATION_TYPE_LABEL[row.original.operation_type]}
          <span className="text-muted-foreground text-xs block">
            {row.original.unit_side
              ? row.original.unit_side.name
              : row.original.counterparty
                ? row.original.counterparty.name
                : (row.original.waste_source?.name ?? "")}
          </span>
        </>
      ),
    },
    {
      id: "status",
      accessorKey: "status",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Статус" />
      ),
      cell: ({ row }) => <OperationStatusBadge status={row.original.status} />,
    },
    {
      id: "amount",
      accessorKey: "amount",
      size: 120,
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Количество" />
      ),
      cell: ({ row }) =>
        `${formatAmount(row.original.amount)} ${UOM_LABEL[row.original.waste.uom]}`,
    },
    {
      id: "balance",
      accessorFn: (row) => row.balance?.amount,
      size: 120,
      enableSorting: false,
      header: ({ column }) => (
        <DataTableColumnHeader
          className="break-normal"
          column={column}
          title="Остаток после операции"
        />
      ),
      cell: ({ row }) =>
        row.original.balance
          ? `${formatAmount(row.original.balance.amount)} ${UOM_LABEL[row.original.waste.uom]}`
          : "—",
    },
    {
      id: "created_at",
      accessorFn: (row) => `${row.created_at} ${row.created_by.username}`,
      size: 120,
      enableSorting: false,
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Cоздано" />
      ),
      cell: ({ row }) => (
        <>
          {row.original.created_by.username}
          <span className="text-muted-foreground block text-xs">
            {formatDateTime(row.original.created_at)}
          </span>
        </>
      ),
    },
    {
      id: "actions",
      header: () => <></>,
      size: 50,
      enableSorting: false,
      cell: ({ row }) => {
        const operation = row.original;
        const canReview = canReviewOperation(operation.status);
        const canMutate = canMutateOperation(operation.status);
        if (!canReview && !canMutate) return null;

        return (
          <DataTableRowActions>
            {canReview ? (
              <>
                <DataTableRowAction
                  label="Подтвердить операцию"
                  onClick={() => onApprove(operation)}
                >
                  <Check />
                  Подтвердить
                </DataTableRowAction>
                <DataTableRowAction
                  label="Отклонить операцию"
                  onClick={() => onReject(operation)}
                >
                  <X />
                  Отклонить
                </DataTableRowAction>
              </>
            ) : null}
            {canMutate ? (
              <DataTableRowAction
                label="Удалить операцию"
                onClick={() => onDelete(operation)}
              >
                <Trash2 className="text-destructive" />
                Удалить
              </DataTableRowAction>
            ) : null}
          </DataTableRowActions>
        );
      },
    },
  ];
}

export { operationsColumns };
