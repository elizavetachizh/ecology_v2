import { routes } from "../../../../shared/config/routes";
import { useMemo, useState } from "react";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { useTenant } from "../../../../entities/tenant";
import {
  approveOperation,
  DEFAULT_OPERATIONS_LIST_LIMIT,
  deleteOperation,
  operationsQueryKeys,
  rejectOperation,
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
  const navigate = useNavigate({ from: routes.waste.operations.list });
  const search = useSearch({ from: routes.waste.operations.list });

  const [createOpen, setCreateOpen] = useState(false);
  const [deleting, setDeleting] = useState<Operation | null>(null);
  const [approving, setApproving] = useState<Operation | null>(null);
  const [rejecting, setRejecting] = useState<Operation | null>(null);
  const columns = useMemo(
    () =>
      operationsColumns({
        onDelete: setDeleting,
        onApprove: setApproving,
        onReject: setRejecting,
      }),
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

  const approveMutation = useMutation({
    mutationFn: (id: string) => approveOperation(id),
    onSuccess: () => {
      invalidateOperationQueries();
      setApproving(null);
      toast.success("Операция подтверждена, остатки учтены");
    },
    onError: (err) => toast.error(err.message),
  });

  const rejectMutation = useMutation({
    mutationFn: (id: string) => rejectOperation(id),
    onSuccess: () => {
      invalidateOperationQueries();
      setRejecting(null);
      toast.success("Операция отклонена");
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
            <Button type="button" size="sm" onClick={() => setCreateOpen(true)}>
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
          onRowClick={(row) => {
            void navigate({
              to: routes.waste.operations.detail,
              params: { operationId: row.original.id },
            });
          }}
        />
        <DataTablePagination
          total={total}
          limit={limit}
          offset={offset}
          disabled={loading}
          onOffsetChange={(nextOffset) => patchSearch({ offset: nextOffset })}
        />

        <CreateOperationModal
          open={createOpen}
          onOpenChange={setCreateOpen}
          onSaved={() => {
            toast.success("Операция успешно создана");
            setCreateOpen(false);
          }}
        />

        <ConfirmDialog
          open={approving !== null}
          confirmDisabled={approveMutation.isPending}
          confirmVariant="default"
          onOpenChange={(open) => {
            if (!open) setApproving(null);
          }}
          title="Подтвердить операцию?"
          confirmLabel="Подтвердить"
          description={
            <>
              Поступление от {formatDate(approving?.date ?? null)} по «
              {approving?.waste.waste_classifier.name ?? "—"}» будет
              подтверждено. Остатки изменятся на обеих сторонах пары.
            </>
          }
          onConfirm={() => {
            if (approving) void approveMutation.mutateAsync(approving.id);
          }}
        />

        <ConfirmDialog
          open={rejecting !== null}
          confirmDisabled={rejectMutation.isPending}
          onOpenChange={(open) => {
            if (!open) setRejecting(null);
          }}
          title="Отклонить операцию?"
          confirmLabel="Отклонить"
          description={
            <>
              Пара операций от {formatDate(rejecting?.date ?? null)} по «
              {rejecting?.waste.waste_classifier.name ?? "—"}» будет отклонена.
              Остатки не изменятся.
            </>
          }
          onConfirm={() => {
            if (rejecting) void rejectMutation.mutateAsync(rejecting.id);
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
