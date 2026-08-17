import { Link } from "@tanstack/react-router";
import { WasteSourcesCell } from "../../../../entities/waste/waste-sources/ui/WasteSourcesCell";
import {
  DataTableRowAction,
  DataTableRowActions,
  type ColumnDef,
} from "../../../../shared/ui";
import { Pencil, Unlink } from "lucide-react";
import type { WasteInstructionUnit } from "../../../../entities/waste/waste-instruction-units";

function uiwColumns(
  setEditing: (waste: WasteInstructionUnit) => void,
  setModalMode: (mode: "edit" | "create") => void,
  setDetaching: (waste: WasteInstructionUnit) => void,
): ColumnDef<WasteInstructionUnit>[] {
  return [
    {
      id: "waste",
      header: "Отход",
      cell: ({ row }) => (
        <Link
          to="/directories/wastes/$wasteId"
          params={{ wasteId: row.original.waste_id }}
          search={{ instructionId: undefined }}
          className="font-medium hover:underline"
        >
          {`${row.original.waste.waste_classifier.code} -  ${row.original.waste.waste_classifier.name}`}
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
            label="Отвязать подразделение"
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
export { uiwColumns };
