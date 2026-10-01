import { Link } from "@tanstack/react-router";
import { Pencil, Trash2 } from "lucide-react";
import {
  Badge,
  DataTableColumnHeader,
  DataTableRowAction,
  DataTableRowActions,
  type ColumnDef,
} from "../../../../shared/ui";
import type { Person } from "../../../../entities/waste/persons";
import { formatDateTime } from "../../../../shared/lib/format-date";
import { routes } from "../../../../shared/config/routes";

function personsColumns(
  setDeleting: (person: Person) => void,
): ColumnDef<Person>[] {
  return [
    {
      id: "name",
      accessorKey: "name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Наименование" />
      ),
      cell: ({ row }) => (
        <Link
          to={routes.directories.persons.detail}
          params={{ personId: row.original.id }}
          className="font-medium hover:underline"
        >
          {row.original.name}
        </Link>
      ),
    },
    {
      id: "last_seen_at",
      accessorKey: "last_seen_at",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Последнее посещение" />
      ),
      cell: ({ row }) => {
        const lastSeenAt = row.original.user?.last_seen_at;
        return (
          <span className="text-muted-foreground">
            {lastSeenAt ? formatDateTime(lastSeenAt) : "—"}
          </span>
        );
      },
    },
    {
      id: "units",
      header: "Подразделения",
      enableSorting: false,
      cell: ({ row }) => {
        const units = row.original.units;
        if (units.length === 0) {
          return <span className="text-muted-foreground">—</span>;
        }
        return (
          <div className="flex max-w-xs flex-wrap gap-1">
            {units.map((unit) => (
              <Badge
                key={unit.id}
                variant="secondary"
                title={unit.short_name || undefined}
              >
                {unit.name}
              </Badge>
            ))}
          </div>
        );
      },
    },
    {
      id: "actions",
      header: () => <div className="text-right">Действия</div>,
      enableSorting: false,
      cell: ({ row }) => (
        <DataTableRowActions>
          <DataTableRowAction asChild label="Изменить ответственного">
            <Link
              to={routes.directories.persons.detail}
              params={{ personId: row.original.id }}
            >
              <Pencil />
              Изменить
            </Link>
          </DataTableRowAction>
          <DataTableRowAction
            label="Удалить ответственного"
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
export { personsColumns };
