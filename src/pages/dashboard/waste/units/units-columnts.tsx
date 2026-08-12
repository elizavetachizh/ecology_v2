import { Link } from "@tanstack/react-router";
import type { UnitTree } from "../../../../entities/waste/units";
import {
  Badge,
  DataTableColumnHeader,
  DataTableExpandCell,
  DataTableRowAction,
  DataTableRowActions,
  type ColumnDef,
} from "../../../../shared/ui";
import { ClipboardList, Pencil, Plus, Trash2 } from "lucide-react";

/** id колонок = API UnitSortField (где сортировка поддерживается) */
function unitsColumns(
  openCreateUnit: (unitId: string, options?: { isPod9?: boolean }) => void,
  setDeletingUnit: (unit: UnitTree | null) => void,
): ColumnDef<UnitTree>[] {
  return [
    {
      id: "name",
      accessorKey: "name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Название" />
      ),
      cell: ({ row }) => (
        <DataTableExpandCell row={row}>
          <Link
            to="/directories/structure/units/$unitId"
            params={{ unitId: row.original.id }}
            search={{ instructionId: undefined }}
            className="font-medium hover:underline"
            onClick={(event) => event.stopPropagation()}
          >
            {row.original.name}
          </Link>
        </DataTableExpandCell>
      ),
    },
    {
      id: "short_name",
      accessorKey: "short_name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Краткое" />
      ),
      cell: ({ row }) => row.original.short_name || "—",
    },
    {
      id: "is_pod9",
      header: "ПОД-9",
      enableSorting: false,
      cell: ({ row }) =>
        row.original.is_pod9 ? <Badge variant="info">ПОД-9</Badge> : "—",
    },
    {
      id: "region_id",
      accessorFn: (row) => row.region?.name,
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Регион" />
      ),
      cell: ({ row }) => row.original.region?.name ?? "—",
    },
    {
      id: "district_id",
      accessorFn: (row) => row.district?.name,
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Район" />
      ),
      cell: ({ row }) => row.original.district?.name ?? "—",
    },
    {
      id: "actions",
      header: () => <div className="text-right">Действия</div>,
      enableSorting: false,
      cell: ({ row }) => (
        <DataTableRowActions>
          <DataTableRowAction
            label="Добавить дочернюю единицу"
            onClick={() => openCreateUnit(row.original.id)}
          >
            <Plus />
            Дочерняя
          </DataTableRowAction>
          <DataTableRowAction
            label="Создать журнал ПОД-9"
            onClick={() => openCreateUnit(row.original.id, { isPod9: true })}
          >
            <ClipboardList />
            ПОД-9
          </DataTableRowAction>
          <DataTableRowAction asChild label="Редактировать единицу">
            <Link
              to="/directories/structure/units/$unitId"
              params={{ unitId: row.original.id }}
              search={{ instructionId: undefined }}
            >
              <Pencil />
              Изменить
            </Link>
          </DataTableRowAction>
          <DataTableRowAction
            label="Удалить единицу"
            onClick={() => setDeletingUnit(row.original)}
          >
            <Trash2 className="text-destructive" />
            Удалить
          </DataTableRowAction>
        </DataTableRowActions>
      ),
    },
  ];
}
export { unitsColumns };
