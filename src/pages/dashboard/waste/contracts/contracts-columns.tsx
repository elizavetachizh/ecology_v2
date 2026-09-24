import { Link } from "@tanstack/react-router";
import { Check, Pencil, Trash2, Undo2 } from "lucide-react";
import {
  CONTRACT_TYPE_LABEL,
  ContractStatusBadge,
  TRANSFER_PURPOSE_LABEL,
  type Contract,
  type ContractStatus,
} from "../../../../entities/waste/contracts";
import {
  Badge,
  DataTableColumnHeader,
  DataTableRowAction,
  DataTableRowActions,
  type ColumnDef,
} from "../../../../shared/ui";
import { formatDate } from "../../../../shared/lib/format-date";
import { routes } from "../../../../shared/config/routes";

function contractsColumns(
  setDeleting: (contract: Contract) => void,
  onStatusChange: (contract: Contract, status: ContractStatus) => void,
  options?: { hideCounterparty?: boolean },
): ColumnDef<Contract>[] {
  const columns: ColumnDef<Contract>[] = [
    {
      id: "number",
      accessorKey: "number",
      size: 100,
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Номер" />
      ),
      cell: ({ row }) => (
        <Link
          to={routes.directories.contracts.detail}
          params={{ contractId: row.original.id }}
          className="font-medium hover:underline"
        >
          {row.original.number}
        </Link>
      ),
    },
    {
      id: "contract_type",
      size: 120,
      accessorKey: "contract_type",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Тип" />
      ),
      cell: ({ row }) => CONTRACT_TYPE_LABEL[row.original.contract_type],
    },
    {
      id: "transfer_purpose",
      accessorKey: "transfer_purpose",
      size: 120,
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Цель передачи" />
      ),
      enableSorting: false,
      cell: ({ row }) => {
        const purpose = row.original.transfer_purpose;
        return (
          <div className="flex max-w-xs flex-wrap items-center gap-1">
            {purpose ? TRANSFER_PURPOSE_LABEL[purpose] : "—"}
            {row.original.with_ownership_transfer ? (
              <Badge variant="secondary">С передачей права</Badge>
            ) : null}
          </div>
        );
      },
    },
    {
      id: "counterparty",
      header: "Контрагент",
      enableSorting: false,
      cell: ({ row }) => row.original.counterparty.name,
    },
    {
      id: "start_date",
      accessorKey: "start_date",
      size: 100,
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Заключён" />
      ),
      cell: ({ row }) => formatDate(row.original.start_date),
    },
    {
      id: "end_date",
      accessorKey: "end_date",
      size: 100,
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Окончание" />
      ),
      cell: ({ row }) => formatDate(row.original.end_date),
    },
    {
      id: "status",
      accessorKey: "status",
      size: 100,
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Статус" />
      ),
      cell: ({ row }) => <ContractStatusBadge status={row.original.status} />,
    },
    {
      id: "wastes",
      header: "Отходы",
      enableSorting: false,
      cell: ({ row }) => (
        <div className="flex max-w-xs flex-wrap gap-1">
          {row.original.wastes.map((waste) => (
            <Badge
              title={waste.waste.waste_classifier.name}
              key={waste.id}
              variant="secondary"
            >
              {waste.waste.waste_classifier.code}
            </Badge>
          ))}
        </div>
      ),
    },
    {
      id: "actions",
      size: 100,
      header: () => <div className="text-right">Действия</div>,
      enableSorting: false,
      cell: ({ row }) => (
        <DataTableRowActions>
          {row.original.status === "active" ? (
            <DataTableRowAction
              label="Пометить как закрытый"
              onClick={() => onStatusChange(row.original, "inactive")}
            >
              <Check />
              Пометить как закрытый
            </DataTableRowAction>
          ) : (
            <DataTableRowAction
              label="Пометить как действующий"
              onClick={() => onStatusChange(row.original, "active")}
            >
              <Undo2 />
              Пометить как действующий
            </DataTableRowAction>
          )}
          <DataTableRowAction asChild label="Изменить договор">
            <Link
              to={routes.directories.contracts.detail}
              params={{ contractId: row.original.id }}
            >
              <Pencil />
              Изменить
            </Link>
          </DataTableRowAction>
          <DataTableRowAction
            label="Удалить договор"
            onClick={() => setDeleting(row.original)}
          >
            <Trash2 className="text-destructive" />
            Удалить
          </DataTableRowAction>
        </DataTableRowActions>
      ),
    },
  ];

  if (!options?.hideCounterparty) return columns;
  return columns.filter((column) => column.id !== "counterparty");
}

export { contractsColumns };
