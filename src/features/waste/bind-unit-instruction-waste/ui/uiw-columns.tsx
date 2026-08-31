import { routes } from "../../../../shared/config/routes";
import { Link } from "@tanstack/react-router";
import {
  DataTableRowAction,
  DataTableRowActions,
  type ColumnDef,
} from "../../../../shared/ui";
import { Pencil, Unlink } from "lucide-react";
import { WasteSourcesCell } from "../../../../entities/waste/waste-sources";
import type { UnitInstructionWaste } from "../../../../entities/waste/unit-instruction-waste";
import { UOM_LABEL } from "../../../../entities/waste/wastes";

function uiwColumns(
  setEditing: (waste: UnitInstructionWaste) => void,
  setModalMode: (mode: "edit" | "create") => void,
  setDetaching: (waste: UnitInstructionWaste) => void,
): ColumnDef<UnitInstructionWaste>[] {
  return [
    {
      id: "waste",
      header: "Отход",
      cell: ({ row }) => (
        <Link
          to={routes.directories.wastes.detail}
          params={{ wasteId: row.original.waste_id }}
          search={{ instructionId: undefined }}
          className="font-medium hover:underline"
        >
          {`${row.original.waste.waste_classifier.code} - ${row.original.waste.waste_classifier.name}`}
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
      cell: ({ row }) =>
        `${row.original.transport_unit} ${UOM_LABEL[row.original.waste.uom]}`,
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
            label="Отвязать отход"
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
