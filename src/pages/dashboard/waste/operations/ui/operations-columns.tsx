import { Check, Pencil, Trash2, X } from "lucide-react";
import {
  canMutateOperation,
  canReviewOperation,
  OPERATION_TYPE_LABEL,
  OperationStatusBadge,
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

type OperationsColumnActions = {
  onEdit: (operation: Operation) => void;
  onDelete: (operation: Operation) => void;
  onApprove: (operation: Operation) => void;
  onReject: (operation: Operation) => void;
};

function operationsColumns({
  onEdit,
  onDelete,
  onApprove,
  onReject,
}: OperationsColumnActions): ColumnDef<Operation>[] {
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
      id: "status",
      accessorKey: "status",
      enableSorting: false,
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Статус" />
      ),
      cell: ({ row }) => <OperationStatusBadge status={row.original.status} />,
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
      accessorFn: (row) => row.balance?.amount,
      enableSorting: false,
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Остаток после операции" />
      ),
      cell: ({ row }) =>
        row.original.balance
          ? `${formatAmount(row.original.balance.amount)} ${UOM_LABEL[row.original.waste.uom]}`
          : "—",
    },
    {
      id: "actions",
      header: () => <div className="text-right">Действия</div>,
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
              <>
                <DataTableRowAction
                  label="Изменить операцию"
                  onClick={() => onEdit(operation)}
                >
                  <Pencil />
                  Изменить
                </DataTableRowAction>
                <DataTableRowAction
                  label="Удалить операцию"
                  onClick={() => onDelete(operation)}
                >
                  <Trash2 className="text-destructive" />
                  Удалить
                </DataTableRowAction>
              </>
            ) : null}
          </DataTableRowActions>
        );
      },
    },
  ];
}

export { operationsColumns };
