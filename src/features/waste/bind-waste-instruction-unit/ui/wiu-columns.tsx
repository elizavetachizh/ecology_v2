import { Link } from "@tanstack/react-router";
import { Pencil, Unlink } from "lucide-react";
import type { WasteInstructionUnit } from "../../../../entities/waste/waste-instruction-units";
import {
  DataTableRowAction,
  DataTableRowActions,
  type ColumnDef,
} from "../../../../shared/ui";
import { WasteSourcesCell } from "../../../../entities/waste/waste-sources";
function wiuColumns(
  setEditing: (waste: WasteInstructionUnit) => void,
  setModalMode: (mode: "edit" | "create") => void,
  setDetaching: (waste: WasteInstructionUnit) => void,
): ColumnDef<WasteInstructionUnit>[] {
  return [
    {
      id: "unit",
      header: "Журнал ПОД-9",
      cell: ({ row }) => (
        <Link
          to="/directories/units/$unitId"
          params={{ unitId: row.original.unit_id }}
          search={{ instructionId: undefined }}
          className="font-medium hover:underline"
        >
          {row.original.unit.short_name
            ? `${row.original.unit.name} (${row.original.unit.short_name})`
            : row.original.unit.name}
        </Link>
      ),
    },
    {
      id: "sources",
      header: "Источники",
      cell: ({ row }) => (
        <WasteSourcesCell sources={row.original.waste_sources} />
      ),
    },
    {
      id: "transport_unit",
      header: "Тр. ед.",
      cell: ({ row }) => row.original.transport_unit,
    },
    {
      id: "actions",
      header: () => <div className="text-right">Действия</div>,
      enableSorting: false,
      cell: ({ row }) => (
        <DataTableRowActions>
          <DataTableRowAction
            label="Изменить привязку"
            onClick={() => {
              setEditing(row.original);
              setModalMode("edit");
            }}
          >
            <Pencil />
            Изменить
          </DataTableRowAction>
          <DataTableRowAction
            label="Отвязать журнал ПОД-9"
            onClick={() => setDetaching(row.original)}
          >
            <Unlink className="text-destructive" />
            Отвязать
          </DataTableRowAction>
        </DataTableRowActions>
      ),
    },
  ];
}
export { wiuColumns };
