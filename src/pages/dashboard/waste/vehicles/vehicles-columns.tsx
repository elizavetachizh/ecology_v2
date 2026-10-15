import { Link } from "@tanstack/react-router";
import { Pencil, Trash2 } from "lucide-react";
import {
  VehicleStatusBadge,
  type Vehicle,
} from "../../../../entities/waste/vehicles";
import {
  DataTableColumnHeader,
  DataTableRowAction,
  DataTableRowActions,
  type ColumnDef,
} from "../../../../shared/ui";
import { routes } from "../../../../shared/config/routes";

function optionalNumber(value: number | null) {
  if (value === null) {
    return <span className="text-muted-foreground">—</span>;
  }
  return value;
}

function vehiclesColumns(
  setDeleting: (vehicle: Vehicle) => void,
): ColumnDef<Vehicle>[] {
  return [
    {
      id: "make",
      accessorKey: "make",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Марка" />
      ),
      cell: ({ row }) => (
        <Link
          to={routes.directories.vehicles.detail}
          params={{ vehicleId: row.original.id }}
          className="font-medium hover:underline"
        >
          {row.original.make}
        </Link>
      ),
    },
    {
      id: "model",
      accessorKey: "model",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Модель" />
      ),
      cell: ({ row }) => row.original.model,
    },
    {
      id: "license_plate",
      accessorKey: "license_plate",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Госномер" />
      ),
      cell: ({ row }) => row.original.license_plate,
    },
    {
      id: "weight",
      accessorKey: "weight",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Масса" />
      ),
      cell: ({ row }) => optionalNumber(row.original.weight),
    },
    {
      id: "status",
      accessorKey: "status",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Статус" />
      ),
      cell: ({ row }) => <VehicleStatusBadge status={row.original.status} />,
    },
    {
      id: "beltopgas_id",
      accessorKey: "beltopgas_id",
      header: "ID Белтопгаз",
      enableSorting: false,
      cell: ({ row }) => optionalNumber(row.original.beltopgas_id),
    },
    {
      id: "actions",
      header: () => <div className="text-right">Действия</div>,
      enableSorting: false,
      cell: ({ row }) => (
        <DataTableRowActions>
          <DataTableRowAction asChild label="Изменить транспортное средство">
            <Link
              to={routes.directories.vehicles.detail}
              params={{ vehicleId: row.original.id }}
            >
              <Pencil />
              Изменить
            </Link>
          </DataTableRowAction>
          <DataTableRowAction
            label="Удалить транспортное средство"
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

export { vehiclesColumns };
