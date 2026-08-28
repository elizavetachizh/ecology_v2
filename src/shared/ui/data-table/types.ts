import type {
  Column as TanstackColumn,
  ColumnDef as TanstackColumnDef,
  ExpandedState,
  Row as TanstackRow,
  RowData,
  SortingState,
} from "@tanstack/react-table";
import type { DataTableFeatures } from "./features";

export type ColumnDef<
  TData extends RowData,
  TValue = unknown,
> = TanstackColumnDef<DataTableFeatures, TData, TValue>;

export type Column<TData extends RowData, TValue = unknown> = TanstackColumn<
  DataTableFeatures,
  TData,
  TValue
>;

export type Row<TData extends RowData> = TanstackRow<DataTableFeatures, TData>;

export type { ExpandedState, RowData, SortingState };
