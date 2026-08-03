import { ExternalLink, Pencil, Plus, Trash2 } from "lucide-react";
import { Link } from "@tanstack/react-router";
import {
  Button,
  DataTableColumnHeader,
  DataTableExpandCell,
  DataTableRowAction,
  DataTableRowActions,
  type ColumnDef,
} from "../../../../shared/ui";
import {
  STRUCTURE_TYPE_LABEL,
  type StructureNode,
} from "../model/structure.mock";

export type StructureColumnsOptions = {
  onAddUnit: (parentId: string) => void;
  onDeleteNode: (node: StructureNode) => void;
};

export function createStructureColumns({
  onAddUnit,
  onDeleteNode,
}: StructureColumnsOptions): ColumnDef<StructureNode>[] {
  return [
    {
      accessorKey: "name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Наименование" />
      ),
      cell: ({ row }) => {
        if (row.original.type === "actions") {
          const parentId = row.original.parentId ?? "";
          return (
            <div
              className="flex flex-wrap items-center gap-2"
              style={{ paddingLeft: `${row.depth * 1.25}rem` }}
            >
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={(event) => {
                  event.stopPropagation();
                  onAddUnit(parentId);
                }}
              >
                <Plus className="size-3.5" />
                Добавить структурную единицу
              </Button>
            </div>
          );
        }

        const content = (
          <div className="min-w-0">
            <div className="truncate font-medium">{row.original.name}</div>
            {row.original.code ? (
              <div className="truncate text-xs text-muted-foreground">
                Код: {row.original.code}
              </div>
            ) : null}
          </div>
        );

        if (row.original.type === "unit") {
          return (
            <DataTableExpandCell row={row}>
              <Link
                to="/directories/structure/units/$unitId"
                params={{ unitId: row.original.id }}
                className="min-w-0 hover:underline"
                onClick={(event) => event.stopPropagation()}
              >
                {content}
              </Link>
            </DataTableExpandCell>
          );
        }

        if (row.original.type === "pod9") {
          return (
            <DataTableExpandCell row={row}>
              <Link
                to="/directories/structure/pod9/$pod9Id"
                params={{ pod9Id: row.original.id }}
                search={{ instructionId: undefined }}
                className="min-w-0 hover:underline"
                onClick={(event) => event.stopPropagation()}
              >
                {content}
              </Link>
            </DataTableExpandCell>
          );
        }

        return <DataTableExpandCell row={row}>{content}</DataTableExpandCell>;
      },
    },
    {
      accessorKey: "type",
      header: "Тип",
      cell: ({ row }) => {
        if (row.original.type === "actions") return null;

        if (row.original.type === "pod9") {
          return (
            <span className="inline-flex rounded-md bg-info-muted px-2 py-0.5 text-xs font-medium text-info">
              ПОД-9
            </span>
          );
        }

        return (
          <span className="text-muted-foreground">
            {row.original.typeLabel ||
              STRUCTURE_TYPE_LABEL[
                row.original.type as Exclude<StructureNode["type"], "actions">
              ]}
          </span>
        );
      },
    },
    {
      accessorKey: "period",
      header: "Период",
      cell: ({ row }) => {
        if (row.original.type === "actions") return null;
        if (row.original.type !== "pod9") return "—";
        return row.original.period ?? "—";
      },
    },
    {
      accessorKey: "status",
      header: "Статус",
      cell: ({ row }) => {
        if (row.original.type === "actions") return null;
        if (row.original.type !== "pod9") return "—";

        const status = row.original.status;
        if (!status) return "—";

        const tone =
          status === "Сформирован"
            ? "bg-success-muted text-success"
            : status === "Требует проверки"
              ? "bg-warning-muted text-warning-foreground"
              : status === "Черновик" || status === "Не сформирован"
                ? "bg-muted text-muted-foreground"
                : "bg-muted text-muted-foreground";

        return (
          <span
            className={`inline-flex rounded-md px-2 py-0.5 text-xs font-medium ${tone}`}
          >
            {status}
          </span>
        );
      },
    },
    {
      id: "actions",
      header: () => <div className="text-right">Действия</div>,
      enableSorting: false,
      cell: ({ row }) => {
        if (row.original.type === "actions") return null;
        const isUnit = row.original.type === "unit";

        return (
          <DataTableRowActions>
            <DataTableRowAction
              asChild
              label={isUnit ? "Редактировать единицу" : "Открыть ПОД-9"}
            >
              {isUnit ? (
                <Link
                  to="/directories/structure/units/$unitId"
                  params={{ unitId: row.original.id }}
                >
                  <Pencil />
                  Изменить
                </Link>
              ) : (
                <Link
                  to="/directories/structure/pod9/$pod9Id"
                  params={{ pod9Id: row.original.id }}
                  search={{ instructionId: undefined }}
                >
                  <ExternalLink />
                  Открыть
                </Link>
              )}
            </DataTableRowAction>
            <DataTableRowAction
              label={isUnit ? "Удалить единицу" : "Удалить ПОД-9"}
              onClick={() => onDeleteNode(row.original)}
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
