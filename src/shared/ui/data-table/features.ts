import {
  columnSizingFeature,
  createExpandedRowModel,
  createSortedRowModel,
  rowExpandingFeature,
  rowSortingFeature,
  sortFn_alphanumeric,
  tableFeatures,
} from "@tanstack/react-table";

/** Features of the shared DataTable: sorting, tree expand, fixed column sizes. */
export const dataTableFeatures = tableFeatures({
  rowSortingFeature,
  rowExpandingFeature,
  columnSizingFeature,
  sortedRowModel: createSortedRowModel(),
  expandedRowModel: createExpandedRowModel(),
  sortFns: { alphanumeric: sortFn_alphanumeric },
});

export type DataTableFeatures = typeof dataTableFeatures;
