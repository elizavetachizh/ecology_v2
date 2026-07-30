import type { ReactNode } from "react";
import type { Row } from "@tanstack/react-table";
import { ChevronRight } from "lucide-react";
import { cn } from "../../lib/cn";
import { Button } from "../button";

type DataTableExpandCellProps<TData> = {
  row: Row<TData>;
  children: ReactNode;
  className?: string;
};

/** Ячейка с отступом уровня и кнопкой expand/collapse для tree-таблицы */
export function DataTableExpandCell<TData>({
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
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-7 shrink-0"
          aria-label={row.getIsExpanded() ? "Свернуть" : "Развернуть"}
          aria-expanded={row.getIsExpanded()}
          onClick={(event) => {
            event.stopPropagation();
            row.getToggleExpandedHandler()();
          }}
        >
          <ChevronRight
            className={cn(
              "size-4 transition-transform",
              row.getIsExpanded() && "rotate-90",
            )}
          />
        </Button>
      ) : (
        <span className="inline-flex size-7 shrink-0" aria-hidden />
      )}
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
