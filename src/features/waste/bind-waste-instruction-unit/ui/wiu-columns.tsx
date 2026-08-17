import { Link } from "@tanstack/react-router";
import { Pencil, Unlink } from "lucide-react";
import type { WasteInstructionUnit } from "../../../../entities/waste/waste-instruction-units";
import {
  DataTableRowAction,
  DataTableRowActions,
  Badge,
  type ColumnDef,
} from "../../../../shared/ui";
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
      cell: ({ row }) => {
        const sources = row.original.waste_sources;
        if (sources.length === 0) {
          return (
            <span className="text-xs text-muted-foreground">Не указаны</span>
          );
        }
        return (
          <div className="flex max-w-xs flex-wrap gap-1">
            {sources.map((source) => (
              <Badge key={source.id} variant="secondary">
                {source.name}
              </Badge>
            ))}
          </div>
        );
      },
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
export { wiuColumns };
