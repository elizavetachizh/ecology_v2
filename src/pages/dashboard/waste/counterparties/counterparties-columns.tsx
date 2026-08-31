import { Link } from "@tanstack/react-router";
import { Pencil, Trash2 } from "lucide-react";
import type { Counterparty } from "../../../../entities/waste/counterparties";
import {
  Badge,
  DataTableColumnHeader,
  DataTableRowAction,
  DataTableRowActions,
  type ColumnDef,
} from "../../../../shared/ui";
import { routes } from "../../../../shared/config/routes";

function counterpartiesColumns(
  setDeleting: (counterparty: Counterparty) => void,
): ColumnDef<Counterparty>[] {
  return [
    {
      id: "name",
      accessorKey: "name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Наименование" />
      ),
      cell: ({ row }) => (
        <Link
          to={routes.directories.counterparties.detail}
          params={{ counterpartyId: row.original.id }}
          className="font-medium hover:underline"
        >
          {row.original.name}
        </Link>
      ),
    },
    {
      id: "full_name",
      accessorKey: "full_name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Полное" />
      ),
      cell: ({ row }) => row.original.full_name || "—",
    },
    {
      id: "unp",
      accessorKey: "unp",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="УНП" />
      ),
      cell: ({ row }) => (
        <span className="tabular-nums">{row.original.unp || "—"}</span>
      ),
    },
    {
      id: "kind",
      header: "Тип",
      enableSorting: false,
      cell: ({ row }) => (
        <Badge variant={row.original.is_individual ? "info" : "secondary"}>
          {row.original.is_individual ? "Физлицо" : "Юрлицо"}
        </Badge>
      ),
    },
    {
      id: "status",
      header: "Статус",
      enableSorting: false,
      cell: ({ row }) => (
        <Badge variant={row.original.is_active ? "success" : "outline"}>
          {row.original.is_active ? "Активен" : "Неактивен"}
        </Badge>
      ),
    },
    {
      id: "actions",
      header: () => <div className="text-right">Действия</div>,
      enableSorting: false,
      cell: ({ row }) => (
        <DataTableRowActions>
          <DataTableRowAction asChild label="Изменить контрагента">
            <Link
              to={routes.directories.counterparties.detail}
              params={{ counterpartyId: row.original.id }}
            >
              <Pencil />
              Изменить
            </Link>
          </DataTableRowAction>
          <DataTableRowAction
            label="Удалить контрагента"
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

export { counterpartiesColumns };
