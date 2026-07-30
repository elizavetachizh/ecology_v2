import { useState } from "react";
import {
  flexRender,
  getCoreRowModel,
  getExpandedRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type ExpandedState,
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
 * data — массив строк таблицы (обычно view-model после маппинга ответа бэка).
 * columns — что показать и как отрисовать. Сопоставление с полями строки:
 *
 *   {
 *     accessorKey: "date",  // поле в объекте строки (row.date); также база для sort/filter
 *     header: "Дата",       // заголовок: строка или ({ column }) => <DataTableColumnHeader … />
 *     cell: ({ row }) => row.original.date, // опционально: кастомный рендер ячейки
 *   }
 *
 * - без `cell` показывается значение из accessorKey;
 * - `cell` нужен для формата, бейджа, кнопок и т.п.;
 * - вложенное/вычисляемое поле: accessorFn: (row) => row.waste.name вместо accessorKey;
 * - getRowId обязателен (стабильный id строки).
 *
 * Иерархия (tree):
 * - передайте getSubRows: (row) => row.children
 * - в первой колонке используйте <DataTableExpandCell row={row}>…</DataTableExpandCell>
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
  className,
  isLoading = false,
  emptyTitle,
  emptyDescription,
  onRowClick,
  getRowClassName,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [expandedInternal, setExpandedInternal] =
    useState<ExpandedState>(initialExpanded);

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
    onSortingChange: setSorting,
    onExpandedChange: handleExpandedChange,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
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
      <Table>
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
                  <TableCell key={cell.id}>
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
