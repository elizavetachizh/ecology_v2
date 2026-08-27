import { Link } from "@tanstack/react-router";
import { Check, Pencil, Trash2, Undo2 } from "lucide-react";
import {
  PermitStatusBadge,
  type Permit,
  type PermitStatus,
} from "../../../../entities/waste/permits";
import { UOM_LABEL } from "../../../../entities/waste/wastes";
import {
  Badge,
  DataTableColumnHeader,
  DataTableRowAction,
  DataTableRowActions,
  type ColumnDef,
} from "../../../../shared/ui";
import { formatDate } from "../../../../shared/lib/format-date";

function formatAmount(value: string): string {
  const n = Number(value);
  if (!Number.isFinite(n)) return value;
  return n.toLocaleString("ru-RU", { maximumFractionDigits: 6 });
}

function unitLabel(unit: Permit["unit"]) {
  return unit.short_name ? `${unit.name} (${unit.short_name})` : unit.name;
}

function permitsColumns(
  setDeleting: (permit: Permit) => void,
  onStatusChange: (permit: Permit, status: PermitStatus) => void,
): ColumnDef<Permit>[] {
  return [
    {
      id: "number",
      accessorKey: "number",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Номер" />
      ),
      cell: ({ row }) => (
        <Link
          to="/directories/permits/$permitId"
          params={{ permitId: row.original.id }}
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
      id: "end_date",
      accessorKey: "end_date",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Окончание" />
      ),
      cell: ({ row }) => formatDate(row.original.end_date),
    },
    {
      id: "status",
      accessorKey: "status",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Статус" />
      ),
      cell: ({ row }) => <PermitStatusBadge status={row.original.status} />,
    },
    {
      id: "burial_wastes",
      header: "Захоронение",
      enableSorting: false,
      cell: ({ row }) => (
        <div className="flex max-w-xs flex-wrap gap-1">
          {row.original.burial_wastes.map((item) => (
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
          {row.original.status === "active" ? (
            <DataTableRowAction
              label="Пометить как недействующее"
              onClick={() => onStatusChange(row.original, "inactive")}
            >
              <Check />
              Пометить как недействующее
            </DataTableRowAction>
          ) : (
            <DataTableRowAction
              label="Пометить как действующее"
              onClick={() => onStatusChange(row.original, "active")}
            >
              <Undo2 />
              Пометить как действующее
            </DataTableRowAction>
          )}
          <DataTableRowAction asChild label="Изменить разрешение">
            <Link
              to="/directories/permits/$permitId"
              params={{ permitId: row.original.id }}
            >
              <Pencil />
              Изменить
            </Link>
          </DataTableRowAction>
          <DataTableRowAction
            label="Удалить разрешение"
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

export { permitsColumns };
