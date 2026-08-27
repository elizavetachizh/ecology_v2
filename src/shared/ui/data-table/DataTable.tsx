import { useState } from "react";
import {
  flexRender,
  getCoreRowModel,
  getExpandedRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type ExpandedState,
  type OnChangeFn,
  type Row,
  type SortingState,
} from "@tanstack/react-table";
import { cn } from "../../lib/cn";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../table";
import { DataTableEmpty } from "./DataTableEmpty";

/**
 * DataTable (TanStack Table)
 *
 * Server lists: `manualSorting` + controlled `sorting` / `onSortingChange`
 * (URL `sort`/`order` → API). Client-only tables: omit manualSorting.
 *
 * header: ({ column }) => <DataTableColumnHeader column={column} title="…" />
 * id колонки должен совпадать с API sort field.
 */
export type DataTableProps<TData, TValue = unknown> = {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  /** Обязателен для selection / expand / cache (ADR) */
  getRowId: (row: TData, index: number) => string;
  /** Дочерние строки для tree/hierarchy */
  getSubRows?: (row: TData) => TData[] | undefined;
  /** Начальное состояние раскрытия: true = все открыты (неконтролируемый режим) */
  initialExpanded?: ExpandedState;
  /** Контролируемое раскрытие (приоритетнее initialExpanded) */
  expanded?: ExpandedState;
  onExpandedChange?: (expanded: ExpandedState) => void;
  /** Контролируемая сортировка (URL/API). Без props — локальный state. */
  sorting?: SortingState;
  /** Вызывается с уже вычисленным SortingState (не Updater). */
  onSortingChange?: (sorting: SortingState) => void;
  /**
   * Серверная сортировка: UI только меняет state, data уже отсортирована API.
   * Для MDM list pages с пагинацией — всегда true.
   */
  manualSorting?: boolean;
  className?: string;
  isLoading?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  onRowClick?: (row: Row<TData>) => void;
  /** Доп. классы строки (статусы, превышения и т.п.) */
  getRowClassName?: (row: Row<TData>) => string | undefined;
};

export function DataTable<TData, TValue = unknown>({
  columns,
  data,
  getRowId,
  getSubRows,
  initialExpanded = {},
  expanded: expandedProp,
  onExpandedChange,
  sorting: sortingProp,
  onSortingChange,
  manualSorting = false,
  className,
  isLoading = false,
  emptyTitle,
  emptyDescription,
  onRowClick,
  getRowClassName,
}: DataTableProps<TData, TValue>) {
  const [sortingInternal, setSortingInternal] = useState<SortingState>([]);
  const [expandedInternal, setExpandedInternal] =
    useState<ExpandedState>(initialExpanded);

  const isSortingControlled = sortingProp !== undefined;
  const sorting = isSortingControlled ? sortingProp : sortingInternal;

  const handleSortingChange: OnChangeFn<SortingState> = (updater) => {
    const next = typeof updater === "function" ? updater(sorting) : updater;
    if (!isSortingControlled) setSortingInternal(next);
    onSortingChange?.(next);
  };

  const isExpandedControlled = expandedProp !== undefined;
  const expanded = isExpandedControlled ? expandedProp : expandedInternal;

  const handleExpandedChange = (
    updater: ExpandedState | ((old: ExpandedState) => ExpandedState),
  ) => {
    const next = typeof updater === "function" ? updater(expanded) : updater;
    if (!isExpandedControlled) setExpandedInternal(next);
    onExpandedChange?.(next);
  };

  const table = useReactTable({
    data,
    columns,
    getRowId: (row, index) => getRowId(row, index),
    getSubRows,
    state: { sorting, expanded },
    onSortingChange: handleSortingChange,
    onExpandedChange: handleExpandedChange,
    manualSorting,
    getCoreRowModel: getCoreRowModel(),
    ...(manualSorting ? {} : { getSortedRowModel: getSortedRowModel() }),
    getExpandedRowModel: getExpandedRowModel(),
  });

  const columnCount = table.getAllLeafColumns().length || columns.length;

  return (
    <div
      data-slot="data-table"
      className={cn(
        "overflow-hidden rounded-xl border border-border bg-card",
        className,
      )}
    >
      <Table className="table-fixed">
        <TableHeader className="bg-muted/40">
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id} className="hover:bg-transparent">
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id} style={{ width: header.getSize() }}>
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow className="hover:bg-transparent">
              <TableCell
                colSpan={columnCount}
                className="h-28 text-center text-muted-foreground"
              >
                Загрузка…
              </TableCell>
            </TableRow>
          ) : table.getRowModel().rows.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() ? "selected" : undefined}
                className={cn(
                  onRowClick && "cursor-pointer",
                  getRowClassName?.(row),
                )}
                onClick={() => onRowClick?.(row)}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell
                    key={cell.id}
                    style={{ width: cell.column.getSize() }}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <DataTableEmpty
              colSpan={columnCount}
              title={emptyTitle}
              description={emptyDescription}
            />
          )}
        </TableBody>
      </Table>
    </div>
  );
}
