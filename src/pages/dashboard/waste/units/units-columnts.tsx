import { Link } from "@tanstack/react-router";
import type { Unit, UnitTree } from "../../../../entities/waste/units";
import {
  Badge,
  DataTableColumnHeader,
  DataTableExpandCell,
  DataTableRowAction,
  DataTableRowActions,
  type ColumnDef,
} from "../../../../shared/ui";
import { Pencil, Plus, Trash2 } from "lucide-react";

type UnitsColumnsOptions = {
  /** Дерево: expand + действия «Дочерняя» / «ПОД-9». Flat: только edit/delete. */
  hierarchical?: boolean;
};

/** id колонок = API UnitSortField (где сортировка поддерживается) */
function unitsColumns(
  openCreateUnit: (unitId: string, options?: { isPod9?: boolean }) => void,
  setDeletingUnit: (unit: Unit | null) => void,
  options: UnitsColumnsOptions = {},
): ColumnDef<UnitTree>[] {
  const hierarchical = options.hierarchical ?? true;

  return [
    {
      id: "name",
      accessorKey: "name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Название" />
      ),
      cell: ({ row }) => {
        const link = (
          <Link
            to="/directories/structure/units/$unitId"
            params={{ unitId: row.original.id }}
            search={{ instructionId: undefined }}
            className="font-medium hover:underline"
            onClick={(event) => event.stopPropagation()}
          >
            {row.original.name}
          </Link>
        );

        if (!hierarchical) return link;

        return <DataTableExpandCell row={row}>{link}</DataTableExpandCell>;
      },
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
      cell: ({ row }) => {
        const unit = row.original;
        // У узла ПОД-9 нет дочерних / вложенных ПОД-9 — только edit/delete.
        const canAddChildren = hierarchical && !unit.is_pod9;

        return (
          <DataTableRowActions>
            {canAddChildren ? (
              <>
                <DataTableRowAction
                  label="Добавить дочернюю единицу"
                  onClick={() => openCreateUnit(unit.id)}
                >
                  <Plus />
                  Дочерняя
                </DataTableRowAction>
                <DataTableRowAction
                  label="Создать журнал ПОД-9"
                  onClick={() => openCreateUnit(unit.id, { isPod9: true })}
                >
                  <Plus />
                  ПОД-9
                </DataTableRowAction>
              </>
            ) : null}
            <DataTableRowAction asChild label="Редактировать единицу">
              <Link
                to="/directories/structure/units/$unitId"
                params={{ unitId: unit.id }}
                search={{ instructionId: undefined }}
              >
                <Pencil />
                Изменить
              </Link>
            </DataTableRowAction>
            <DataTableRowAction
              label="Удалить единицу"
              onClick={() => setDeletingUnit(unit)}
            >
              <Trash2 className="text-destructive" />
              Удалить
            </DataTableRowAction>
          </DataTableRowActions>
        );
      },
    },
  ];
}
export { unitsColumns };
