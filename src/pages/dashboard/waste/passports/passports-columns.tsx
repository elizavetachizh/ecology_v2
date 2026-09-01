import { Link } from "@tanstack/react-router";
import { Check, Pencil, Trash2, Undo2 } from "lucide-react";
import {
  PASSPORT_TRANSPORT_TYPE_LABEL,
  PassportStatusBadge,
  type Passport,
  type PassportStatus,
} from "../../../../entities/waste/passports";
import {
  Badge,
  DataTableColumnHeader,
  DataTableRowAction,
  DataTableRowActions,
  type ColumnDef,
} from "../../../../shared/ui";
import { formatDate } from "../../../../shared/lib/format-date";
import { routes } from "../../../../shared/config/routes";

function passportsColumns(
  setDeleting: (passport: Passport) => void,
  onStatusChange: (passport: Passport, status: PassportStatus) => void,
): ColumnDef<Passport>[] {
  return [
    {
      id: "number",
      accessorKey: "number",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Номер" />
      ),
      cell: ({ row }) => (
        <Link
          to={routes.waste.passports.detail}
          params={{ passportId: row.original.id }}
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
        <DataTableColumnHeader column={column} title="Дата вывоза" />
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
      id: "transport_type",
      accessorKey: "transport_type",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Перевозка" />
      ),
      cell: ({ row }) =>
        PASSPORT_TRANSPORT_TYPE_LABEL[row.original.transport_type],
    },
    {
      id: "status",
      accessorKey: "status",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Статус" />
      ),
      cell: ({ row }) => <PassportStatusBadge status={row.original.status} />,
    },
    {
      id: "wastes",
      header: "Отходы",
      enableSorting: false,
      cell: ({ row }) => (
        <div className="flex max-w-xs flex-wrap gap-1">
          {row.original.wastes.map((waste) => (
            <Badge key={waste.id} variant="secondary">
              {waste.waste.waste_classifier.code}
            </Badge>
          ))}
        </div>
      ),
    },
    {
      id: "actions",
      header: () => <div className="text-right">Действия</div>,
      enableSorting: false,
      cell: ({ row }) => (
        <DataTableRowActions>
          {row.original.status === "active" ? (
            <DataTableRowAction
              label="Пометить как недействующий"
              onClick={() => onStatusChange(row.original, "inactive")}
            >
              <Check />
              Пометить как недействующий
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
          <DataTableRowAction asChild label="Изменить паспорт">
            <Link
              to={routes.waste.passports.detail}
              params={{ passportId: row.original.id }}
            >
              <Pencil />
              Изменить
            </Link>
          </DataTableRowAction>
          <DataTableRowAction
            label="Удалить паспорт"
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

export { passportsColumns };
