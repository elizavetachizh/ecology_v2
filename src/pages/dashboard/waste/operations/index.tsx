import { useMemo, useState } from "react";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { useTenant } from "../../../../entities/tenant";
import {
  DEFAULT_OPERATIONS_LIST_LIMIT,
  deleteOperation,
  operationsQueryKeys,
  useOperationsListQuery,
  type Operation,
} from "../../../../entities/waste/operations";
import { CreateOperationModal } from "../../../../features/waste/create-operation";
import { queryClient } from "../../../../shared/lib/query-client";
import { formatDate } from "../../../../shared/lib/format-date";
import {
  Alert,
  AlertDescription,
  AlertTitle,
  Button,
  ConfirmDialog,
  DataTable,
  DataTablePagination,
  PageContextBar,
  TenantRequiredGate,
  toast,
} from "../../../../shared/ui";
import { operationsColumns } from "./ui/operations-columns";
import {
  OperationsFilters,
  type OperationsFiltersValue,
} from "./ui/operations-filters";

function invalidateOperationQueries() {
  void queryClient.invalidateQueries({
    queryKey: operationsQueryKeys.lists(),
  });
  void queryClient.invalidateQueries({
    queryKey: operationsQueryKeys.details(),
  });
  void queryClient.invalidateQueries({
    queryKey: operationsQueryKeys.balances(),
  });
  void queryClient.invalidateQueries({
    queryKey: operationsQueryKeys.current(),
  });
}

export function WasteOperationsPage() {
  const { activeTenantId } = useTenant();
  const navigate = useNavigate({ from: "/waste/operations" });
  const search = useSearch({ from: "/waste/operations" });

  const [modalMode, setModalMode] = useState<"create" | "edit" | null>(null);
  const [editing, setEditing] = useState<Operation | null>(null);
  const [deleting, setDeleting] = useState<Operation | null>(null);
  const columns = useMemo(
    () => operationsColumns(setDeleting, setModalMode, setEditing),
    [],
  );

  const listParams = useMemo(
    () => ({
      unit_id: search.unit_id,
      waste_id: search.waste_id,
      operation_type: search.operation_type,
      date_from: search.date_from,
      date_to: search.date_to,
      limit: search.limit ?? DEFAULT_OPERATIONS_LIST_LIMIT,
      offset: search.offset ?? 0,
    }),
    [search],
  );

  const {
    items: operations,
    total,
    limit,
    offset,
    loading,
    error,
  } = useOperationsListQuery({
    tenantId: activeTenantId,
    params: listParams,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteOperation(id),
    onSuccess: () => {
      invalidateOperationQueries();
      setDeleting(null);
      toast.success("Операция успешно удалена");
    },
    onError: (err) => toast.error(err.message),
  });

  const patchSearch = (patch: OperationsFiltersValue & { offset?: number }) => {
    void navigate({
      search: (prev) => {
        const next = { ...prev, ...patch };
        if (
          "unit_id" in patch ||
          "waste_id" in patch ||
          "operation_type" in patch ||
          "date_from" in patch ||
          "date_to" in patch
        ) {
          next.offset = patch.offset ?? 0;
        }
        return next;
      },
    });
  };

  if (error) {
    return (
      <Alert variant="error">
        <AlertTitle>Не удалось загрузить операции</AlertTitle>
        <AlertDescription>{error.message}</AlertDescription>
      </Alert>
    );
  }

  return (
    <TenantRequiredGate tenantId={activeTenantId} resourceLabel="операций">
      <div className="space-y-4">
        <PageContextBar
          sticky={false}
          title="Журнал операций"
          description="Здесь вы можете просматривать и управлять операциями по отходам."
          actions={
            <Button
              type="button"
              size="sm"
              onClick={() => {
                setEditing(null);
                setModalMode("create");
              }}
            >
              <Plus className="size-3.5" />
              Создать операцию
            </Button>
          }
        />

        <OperationsFilters
          tenantId={activeTenantId}
          values={search}
          onChange={patchSearch}
        />

        <DataTable
          columns={columns}
          data={operations}
          isLoading={loading}
          getRowId={(row) => row.id}
          emptyTitle="Пока нет операций"
          emptyDescription="Создайте первую операцию, чтобы начать учет отходов."
        />
        <DataTablePagination
          total={total}
          limit={limit}
          offset={offset}
          disabled={loading}
          onOffsetChange={(nextOffset) => patchSearch({ offset: nextOffset })}
        />

        <CreateOperationModal
          open={modalMode !== null}
          mode={modalMode === "edit" ? "edit" : "create"}
          initial={editing}
          onOpenChange={(open) => {
            if (!open) {
              setModalMode(null);
              setEditing(null);
            }
          }}
          onSaved={() => {
            toast.success(
              modalMode === "edit"
                ? "Операция успешно обновлена"
                : "Операция успешно создана",
            );
            setModalMode(null);
            setEditing(null);
          }}
        />

        <ConfirmDialog
          open={deleting !== null}
          confirmDisabled={deleteMutation.isPending}
          onOpenChange={(open) => {
            if (!open) setDeleting(null);
          }}
          title="Удалить операцию?"
          confirmLabel="Удалить"
          description={
            <>
              Операция от {formatDate(deleting?.date ?? null)} по «
              {deleting?.waste.waste_classifier.name ?? "—"}» будет удалена.
              Остатки по этой единице и отходу будут пересчитаны.
            </>
          }
          onConfirm={() => {
            if (deleting) void deleteMutation.mutateAsync(deleting.id);
          }}
        />
      </div>
    </TenantRequiredGate>
  );
}
