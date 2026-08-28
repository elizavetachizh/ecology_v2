import type { ReactNode } from "react";
import { Subscribe } from "@tanstack/react-table";
import { ChevronRight } from "lucide-react";
import { cn } from "../../lib/cn";
import { Button } from "../button";
import type { Row, RowData } from "./types";

type DataTableExpandCellProps<TData extends RowData> = {
  row: Row<TData>;
  children: ReactNode;
  className?: string;
};

function isRowExpanded(
  expanded: true | Record<string, boolean>,
  rowId: string,
) {
  return expanded === true ? true : Boolean(expanded[rowId]);
}

/** Ячейка с отступом уровня и кнопкой expand/collapse для tree-таблицы */
export function DataTableExpandCell<TData extends RowData>({
  row,
  children,
  className,
}: DataTableExpandCellProps<TData>) {
  const canExpand = row.getCanExpand();

  return (
    <div
      className={cn("flex items-center gap-1", className)}
      style={{ paddingLeft: `${row.depth * 1.25}rem` }}
    >
      {canExpand ? (
        <Subscribe
          source={row.table.atoms.expanded}
          selector={(expanded) => isRowExpanded(expanded, row.id)}
        >
          {(expanded) => (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-7 shrink-0"
              aria-label={expanded ? "Свернуть" : "Развернуть"}
              aria-expanded={expanded}
              onClick={(event) => {
                event.stopPropagation();
                row.getToggleExpandedHandler()();
              }}
            >
              <ChevronRight
                className={cn(
                  "size-4 transition-transform",
                  expanded && "rotate-90",
                )}
              />
            </Button>
          )}
        </Subscribe>
      ) : (
        <span className="inline-flex size-7 shrink-0" aria-hidden />
      )}
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
