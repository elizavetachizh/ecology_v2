import {
  HAZARD_CLASS_LABEL,
  PHYSICAL_STATE_LABEL,
  UOM_LABEL,
  type Waste,
} from "../../../../entities/waste/wastes";
import { Pencil, Trash2 } from "lucide-react";
import {
  DataTableColumnHeader,
  DataTableRowAction,
  DataTableRowActions,
  type ColumnDef,
} from "../../../../shared/ui";
import { Link } from "@tanstack/react-router";

/** id колонок = API WasteSortField */
function wastesColumns(
  setDeletingWaste: (waste: Waste) => void,
): ColumnDef<Waste>[] {
  return [
    {
      id: "code",
      accessorFn: (row) => row.waste_classifier.code,
      size: 112,
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Код" />
      ),
      cell: ({ row }) => (
        <span className="whitespace-nowrap">
          {row.original.waste_classifier.code}
        </span>
      ),
    },
    {
      id: "name",
      accessorFn: (row) => row.waste_classifier.name,
      size: 480,
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Наименование" />
      ),
      cell: ({ row }) => {
        const name = row.original.waste_classifier.name;
        return (
          <Link
            to="/directories/wastes/$wasteId"
            params={{ wasteId: row.original.id }}
            search={{ instructionId: undefined }}
            title={name}
            className="block min-w-0 break-words font-medium hover:underline"
          >
            {name}
          </Link>
        );
      },
    },
    {
      id: "hazard_class",
      accessorKey: "hazard_class",
      size: 160,
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Класс опасности" />
      ),
      cell: ({ row }) => HAZARD_CLASS_LABEL[row.original.hazard_class],
    },
    {
      id: "physical_state",
      accessorKey: "physical_state",
      size: 140,
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Состояние" />
      ),
      cell: ({ row }) =>
        row.original.physical_state
          ? PHYSICAL_STATE_LABEL[row.original.physical_state]
          : "—",
    },
    {
      id: "uom",
      accessorKey: "uom",
      size: 96,
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Ед. изм." />
      ),
      cell: ({ row }) => UOM_LABEL[row.original.uom],
    },
    {
      id: "actions",
      size: 72,
      header: () => <div className="text-right">Действия</div>,
      enableSorting: false,
      cell: ({ row }) => (
        <DataTableRowActions>
          <DataTableRowAction asChild label="Изменить отход">
            <Link
              to="/directories/wastes/$wasteId"
              params={{ wasteId: row.original.id }}
              search={{ instructionId: undefined }}
            >
              <Pencil />
              Изменить
            </Link>
          </DataTableRowAction>
          <DataTableRowAction
            label="Удалить отход"
            onClick={() => setDeletingWaste(row.original)}
          >
            <Trash2 className="text-destructive" />
            Удалить
          </DataTableRowAction>
        </DataTableRowActions>
      ),
    },
  ];
}
export { wastesColumns };
