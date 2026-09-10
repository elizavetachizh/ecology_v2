import type { ReactNode } from "react";
import {
  Alert,
  AlertDescription,
  AlertTitle,
  DataTable,
  DataTablePagination,
  TenantRequiredGate,
  type ColumnDef,
  type SortingState,
} from "../../../shared/ui";
import {
  DirectoryListHeader,
  type DirectoryListHeaderProps,
} from "./DirectoryListHeader";

export type DirectoryListChromeProps<TData extends { id: string }> = {
  tenantId: string | null | undefined;
  resourceLabel: string;
  error?: { message: string } | null;
  errorTitle: string;
  header: DirectoryListHeaderProps;
  toolbar?: ReactNode;
  columns: ColumnDef<TData>[];
  data: TData[];
  loading?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  sorting?: SortingState;
  onSortingChange?: (sorting: SortingState) => void;
  total: number;
  limit: number;
  offset: number;
  onOffsetChange: (offset: number) => void;
  getRowId?: (row: TData, index: number) => string;
  footer?: ReactNode;
};

export function DirectoryListChrome<TData extends { id: string }>({
  tenantId,
  resourceLabel,
  error,
  errorTitle,
  header,
  toolbar,
  columns,
  data,
  loading = false,
  emptyTitle,
  emptyDescription,
  sorting,
  onSortingChange,
  total,
  limit,
  offset,
  onOffsetChange,
  getRowId = (row) => row.id,
  footer,
}: DirectoryListChromeProps<TData>) {
  if (error) {
    return (
      <Alert variant="error">
        <AlertTitle>{errorTitle}</AlertTitle>
        <AlertDescription>{error.message}</AlertDescription>
      </Alert>
    );
  }

  return (
    <TenantRequiredGate tenantId={tenantId} resourceLabel={resourceLabel}>
      <div className="space-y-4">
        <DirectoryListHeader {...header} />
        {toolbar}
        <DataTable
          columns={columns}
          data={data}
          isLoading={loading}
          getRowId={getRowId}
          manualSorting
          sorting={sorting}
          onSortingChange={onSortingChange}
          emptyTitle={emptyTitle}
          emptyDescription={emptyDescription}
        />
        <DataTablePagination
          total={total}
          limit={limit}
          offset={offset}
          disabled={loading}
          onOffsetChange={onOffsetChange}
        />
        {footer}
      </div>
    </TenantRequiredGate>
  );
}
