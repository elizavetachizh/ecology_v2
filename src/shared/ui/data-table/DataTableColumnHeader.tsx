import { Subscribe } from "@tanstack/react-table";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import { cn } from "../../lib/cn";
import { Button } from "../button";
import type { Column, RowData } from "./types";

type DataTableColumnHeaderProps<TData extends RowData, TValue> = {
  column: Column<TData, TValue>;
  title: string;
  className?: string;
};

export function DataTableColumnHeader<TData extends RowData, TValue>({
  column,
  title,
  className,
}: DataTableColumnHeaderProps<TData, TValue>) {
  if (!column.getCanSort()) {
    return <div className={cn(className)}>{title}</div>;
  }

  return (
    <Subscribe
      source={column.table.atoms.sorting}
      selector={(sorting) => {
        const item = sorting.find((entry) => entry.id === column.id);
        if (!item) return false as const;
        return item.desc ? ("desc" as const) : ("asc" as const);
      }}
    >
      {(sorted) => (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className={cn(
            "-ml-2 h-8 px-2 font-medium text-muted-foreground",
            className,
          )}
          onClick={() => column.toggleSorting(sorted === "asc")}
        >
          <span>{title}</span>
          {sorted === "desc" ? (
            <ArrowDown className="size-3.5" />
          ) : sorted === "asc" ? (
            <ArrowUp className="size-3.5" />
          ) : (
            <ArrowUpDown className="size-3.5 opacity-50" />
          )}
        </Button>
      )}
    </Subscribe>
  );
}
