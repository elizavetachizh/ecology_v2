import { Pencil, Trash2 } from "lucide-react";
import type { WasteSource } from "../../../../entities/waste/waste-sources";
import {
  DataTableColumnHeader,
  DataTableRowAction,
  DataTableRowActions,
  type ColumnDef,
} from "../../../../shared/ui";
import { formatDateTime } from "../../../../shared/lib/format-date";

function wasteSourcesColumns(
  setDeleting: (wasteSource: WasteSource) => void,
  setModalMode: (mode: "edit" | "create") => void,
  setEditing: (wasteSource: WasteSource) => void,
): ColumnDef<WasteSource>[] {
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
      id: "created_at",
      accessorFn: (row) => `${row.created_at} ${row.created_by.username}`,
      enableSorting: false,
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Cоздано" />
      ),
      cell: ({ row }) => (
        <>
          {row.original.created_by.username}
          <span className="text-muted-foreground block text-xs">
            {formatDateTime(row.original.created_at)}
          </span>
        </>
      ),
    },
    {
      id: "actions",
      header: () => <div className="text-right">Действия</div>,
      enableSorting: false,
      cell: ({ row }) => (
        <DataTableRowActions>
          <DataTableRowAction
            label="Изменить источник"
            onClick={() => {
              setEditing(row.original);
              setModalMode("edit");
            }}
          >
            <Pencil />
            Изменить
          </DataTableRowAction>
          <DataTableRowAction
            label="Удалить источник"
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
export { wasteSourcesColumns };
