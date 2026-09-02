import { Link } from "@tanstack/react-router";
import { Pencil, Trash2 } from "lucide-react";
import {
  OrderStatusBadge,
  type Order,
} from "../../../../entities/waste/orders";
import {
  DataTableColumnHeader,
  DataTableRowAction,
  DataTableRowActions,
  type ColumnDef,
} from "../../../../shared/ui";
import { formatDate } from "../../../../shared/lib/format-date";
import { routes } from "../../../../shared/config/routes";

function unitLabel(unit: Order["unit"]) {
  return unit.short_name ? `${unit.name} (${unit.short_name})` : unit.name;
}

function ordersColumns(setDeleting: (order: Order) => void): ColumnDef<Order>[] {
  return [
    {
      id: "number",
      accessorKey: "number",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Номер" />
      ),
      cell: ({ row }) => (
        <Link
          to={routes.directories.orders.detail}
          params={{ orderId: row.original.id }}
          className="font-medium hover:underline"
        >
          {row.original.number}
        </Link>
      ),
    },
    {
      id: "unit",
      header: "Подразделение",
      enableSorting: false,
      cell: ({ row }) => unitLabel(row.original.unit),
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
      id: "status",
      accessorKey: "status",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Статус" />
      ),
      cell: ({ row }) => <OrderStatusBadge status={row.original.status} />,
    },
    {
      id: "actions",
      header: () => <div className="text-right">Действия</div>,
      enableSorting: false,
      cell: ({ row }) => (
        <DataTableRowActions>
          <DataTableRowAction asChild label="Изменить приказ">
            <Link
              to={routes.directories.orders.detail}
              params={{ orderId: row.original.id }}
            >
              <Pencil />
              Изменить
            </Link>
          </DataTableRowAction>
          <DataTableRowAction
            label="Удалить приказ"
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

export { ordersColumns };
