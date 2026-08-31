import { Link } from "@tanstack/react-router";
import { Pencil, Trash2 } from "lucide-react";
import {
  StandardStatusBadge,
  type Standard,
} from "../../../../entities/waste/standards";
import { UOM_LABEL } from "../../../../entities/waste/wastes";
import {
  Badge,
  DataTableColumnHeader,
  DataTableRowAction,
  DataTableRowActions,
  type ColumnDef,
} from "../../../../shared/ui";
import { formatDate } from "../../../../shared/lib/format-date";
import { routes } from "../../../../shared/config/routes";

function formatAmount(value: string): string {
  const n = Number(value);
  if (!Number.isFinite(n)) return value;
  return n.toLocaleString("ru-RU", { maximumFractionDigits: 6 });
}

function unitLabel(unit: Standard["unit"]) {
  return unit.short_name ? `${unit.name} (${unit.short_name})` : unit.name;
}

function standardsColumns(
  setDeleting: (standard: Standard) => void,
): ColumnDef<Standard>[] {
  return [
    {
      id: "unit",
      header: "Подразделение",
      enableSorting: false,
      cell: ({ row }) => (
        <Link
          to={routes.directories.standards.detail}
          params={{ standardId: row.original.id }}
          className="font-medium hover:underline"
        >
          {unitLabel(row.original.unit)}
        </Link>
      ),
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
      cell: ({ row }) => <StandardStatusBadge status={row.original.status} />,
    },
    {
      id: "wastes",
      header: "Отходы",
      enableSorting: false,
      cell: ({ row }) => (
        <div className="flex max-w-xs flex-wrap gap-1">
          {row.original.wastes.map((item) => (
            <Badge key={item.id} variant="secondary">
              {`${item.waste.waste_classifier.code} — ${formatAmount(item.amount)} ${UOM_LABEL[item.waste.uom]}`}
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
          <DataTableRowAction asChild label="Изменить норматив">
            <Link
              to={routes.directories.standards.detail}
              params={{ standardId: row.original.id }}
            >
              <Pencil />
              Изменить
            </Link>
          </DataTableRowAction>
          <DataTableRowAction
            label="Удалить норматив"
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

export { standardsColumns };
