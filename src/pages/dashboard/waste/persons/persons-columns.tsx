import { Pencil, Trash2 } from "lucide-react";
import {
  DataTableColumnHeader,
  DataTableRowAction,
  DataTableRowActions,
  type ColumnDef,
} from "../../../../shared/ui";
import type { Person } from "../../../../entities/waste/persons";
import { formatDateTime } from "../../../../shared/lib/format-date";

function personsColumns(
  setDeleting: (person: Person) => void,
  setModalMode: (mode: "edit" | "create") => void,
  setEditing: (person: Person) => void,
): ColumnDef<Person>[] {
  return [
    {
      id: "name",
      accessorKey: "name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Наименование" />
      ),
      cell: ({ row }) => (
        <span className="font-medium">{row.original.name}</span>
      ),
    },
    {
      id: "last_seen_at",
      accessorKey: "last_seen_at",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Последнее посещение" />
      ),
      cell: ({ row }) => (
        <span className="text-muted-foreground">
          {row.original.user.last_seen_at
            ? formatDateTime(row.original.user.last_seen_at)
            : "-"}
        </span>
      ),
    },
    {
      id: "actions",
      header: () => <div className="text-right">Действия</div>,
      enableSorting: false,
      cell: ({ row }) => (
        <DataTableRowActions>
          <DataTableRowAction
            label="Изменить ответственного"
            onClick={() => {
              setEditing(row.original);
              setModalMode("edit");
            }}
          >
            <Pencil />
            Изменить
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
