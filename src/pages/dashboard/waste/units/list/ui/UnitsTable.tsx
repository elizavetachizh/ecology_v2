import type { UnitTree } from "../../../../../../entities/waste/units";
import {
  DataTable,
  DataTablePagination,
  type ColumnDef,
  type ExpandedState,
  type SortingState,
} from "../../../../../../shared/ui";

type UnitsTablePagination = {
  total: number;
  limit: number;
  offset: number;
};

type UnitsTableProps = {
  mode: "tree" | "flat";
  columns: ColumnDef<UnitTree>[];
  rows: UnitTree[];
  loading: boolean;
  sorting: SortingState;
  onSortingChange: (sorting: SortingState) => void;
  focusId: string | null;
  expanded: ExpandedState;
  onExpandedChange: (expanded: ExpandedState) => void;
  pagination: UnitsTablePagination | null;
  onOffsetChange: (offset: number) => void;
};

export function UnitsTable({
  mode,
  columns,
  rows,
  loading,
  sorting,
  onSortingChange,
  focusId,
  expanded,
  onExpandedChange,
  pagination,
  onOffsetChange,
}: UnitsTableProps) {
  const isFlat = mode === "flat";

  return (
    <>
      <DataTable
        columns={columns}
        data={rows}
        getRowId={(row) => row.id}
        getSubRows={isFlat ? undefined : (row) => row.children}
        expanded={isFlat ? undefined : expanded}
        onExpandedChange={isFlat ? undefined : onExpandedChange}
        isLoading={loading}
        manualSorting
        sorting={sorting}
        onSortingChange={onSortingChange}
        emptyTitle={isFlat ? "Журналов ПОД-9 нет" : "Структура пуста"}
        emptyDescription={
          isFlat
            ? "Создайте журнал ПОД-9 из дерева структуры у родительской единицы."
            : "Добавьте структурную единицу."
        }
        getRowClassName={(row) => {
          if (focusId && row.original.id === focusId) {
            return "bg-info-muted/60 ring-1 ring-inset ring-info/30";
          }
          return undefined;
        }}
      />
      {pagination ? (
        <DataTablePagination
          total={pagination.total}
          limit={pagination.limit}
          offset={pagination.offset}
          disabled={loading}
          onOffsetChange={onOffsetChange}
        />
      ) : null}
    </>
  );
}
