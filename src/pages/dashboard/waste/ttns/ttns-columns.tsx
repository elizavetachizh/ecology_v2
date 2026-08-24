import { Link } from "@tanstack/react-router";
import { Pencil, Trash2 } from "lucide-react";
import { TtnStatusBadge, type Ttn } from "../../../../entities/waste/ttns";
import {
  DataTableColumnHeader,
  DataTableRowAction,
  DataTableRowActions,
  type ColumnDef,
} from "../../../../shared/ui";
import { formatDate } from "../../../../shared/lib/format-date";

function ttnsColumns(setDeleting: (ttn: Ttn) => void): ColumnDef<Ttn>[] {
  return [
    {
      id: "number",
      accessorKey: "number",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Номер" />
      ),
      cell: ({ row }) => (
        <Link
          to="/waste/ttns/$ttnId"
          params={{ ttnId: row.original.id }}
          className="font-medium hover:underline"
        >
          {row.original.number}
        </Link>
      ),
    },
    {
      id: "date",
      accessorKey: "date",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Дата перевозки" />
      ),
      cell: ({ row }) => formatDate(row.original.date),
    },
    {
      id: "unit",
      header: "Структурная единица",
      enableSorting: false,
      cell: ({ row }) => row.original.unit.name,
    },
    {
      id: "recycling_contract",
      header: "Договор утилизации",
      enableSorting: false,
      cell: ({ row }) => row.original.recycling_contract.number,
    },
    {
      id: "status",
      accessorKey: "status",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Статус" />
      ),
      cell: ({ row }) => <TtnStatusBadge status={row.original.status} />,
    },
    {
      id: "actions",
      header: () => <div className="text-right">Действия</div>,
      enableSorting: false,
      cell: ({ row }) => (
        <DataTableRowActions>
          <DataTableRowAction asChild label="Изменить ТТН">
            <Link to="/waste/ttns/$ttnId" params={{ ttnId: row.original.id }}>
              <Pencil />
              Изменить
            </Link>
          </DataTableRowAction>
          <DataTableRowAction
            label="Удалить ТТН"
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

export { ttnsColumns };
