import { useState } from "react";
import { FormProvider } from "react-hook-form";
import { Link } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { Check, Trash2, X } from "lucide-react";
import {
  approveOperation,
  canMutateOperation,
  canReviewOperation,
  deleteOperation,
  OPERATION_TYPE_LABEL,
  operationsQueryKeys,
  OperationStatusBadge,
  rejectOperation,
  type Operation,
} from "../../../../entities/waste/operations";
import { UOM_LABEL } from "../../../../entities/waste/wastes";
import { queryClient } from "../../../../shared/lib/query-client";
import { formatDate, formatDateTime } from "../../../../shared/lib/format-date";
import {
  Alert,
  AlertDescription,
  AlertTitle,
  Button,
  ConfirmDialog,
  PageContextBar,
  toast,
} from "../../../../shared/ui";
import { useUpsertOperationForm } from "../model/use-upsert-operation-form";
import { OperationStepDate } from "./steps/OperationStepDate";
import { OperationStepDetails } from "./steps/OperationStepDetails";

type OperationCardProps = {
  operation: Operation;
  onSaved: (operation: Operation) => void;
  onCancel: () => void;
  onDeleted: () => void;
};

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

function formatAmount(value: string): string {
  const n = Number(value);
  if (!Number.isFinite(n)) return value;
  return n.toLocaleString("ru-RU", { maximumFractionDigits: 6 });
}

export function OperationCard({
  operation,
  onSaved,
  onCancel,
  onDeleted,
}: OperationCardProps) {
  const [approving, setApproving] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const canMutate = canMutateOperation(operation.status);
  const canReview = canReviewOperation(operation.status);
  const { form, error, pending, onSubmit } = useUpsertOperationForm({
    mode: "edit",
    initial: operation,
    onSaved,
  });
  const fieldsLocked = !canMutate || pending;

  const approveMutation = useMutation({
    mutationFn: () => approveOperation(operation.id),
    onSuccess: () => {
      invalidateOperationQueries();
      setApproving(false);
      toast.success("Операция подтверждена, остатки учтены");
    },
    onError: (err) => toast.error(err.message),
  });

  const rejectMutation = useMutation({
    mutationFn: () => rejectOperation(operation.id),
    onSuccess: () => {
      invalidateOperationQueries();
      setRejecting(false);
      toast.success("Операция отклонена");
    },
    onError: (err) => toast.error(err.message),
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteOperation(operation.id),
    onSuccess: () => {
      invalidateOperationQueries();
      setDeleting(false);
      onDeleted();
    },
    onError: (err) => toast.error(err.message),
  });

  const uom = UOM_LABEL[operation.waste.uom];
  const actionPending =
    pending ||
    approveMutation.isPending ||
    rejectMutation.isPending ||
    deleteMutation.isPending;

  return (
    <>
      <FormProvider {...form}>
        <form
          onSubmit={
            canMutate
              ? form.handleSubmit(onSubmit)
              : (event) => event.preventDefault()
          }
          className="mx-auto max-w-4xl space-y-6"
        >
          <PageContextBar
            eyebrow="Журнал операций"
            title={`${OPERATION_TYPE_LABEL[operation.operation_type]} · ${formatDate(operation.date)}`}
            actions={
              <>
                <OperationStatusBadge status={operation.status} />
                {canReview ? (
                  <>
                    <Button
                      type="button"
                      size="sm"
                      disabled={actionPending}
                      onClick={() => setApproving(true)}
                    >
                      <Check />
                      Подтвердить
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      disabled={actionPending}
                      onClick={() => setRejecting(true)}
                    >
                      <X />
                      Отклонить
                    </Button>
                  </>
                ) : null}
                {canMutate ? (
                  <Button
                    type="button"
                    size="sm"
                    variant="destructive"
                    disabled={actionPending}
                    onClick={() => setDeleting(true)}
                  >
                    <Trash2 />
                    Удалить
                  </Button>
                ) : null}
              </>
            }
          />

          {error ? (
            <Alert variant="error">
              <AlertTitle>Не удалось сохранить</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : null}

          <dl className="grid gap-3 rounded-xl border border-border bg-card p-4 sm:grid-cols-2">
            <OperationStepDate pending={fieldsLocked} />
            <SummaryItem label="Место учёта" value={operation.unit.name} />
            <SummaryItem
              label="Отход"
              value={operation.waste.waste_classifier.name}
            />
            <SummaryItem
              label="Остаток после операции"
              value={
                operation.balance
                  ? `${formatAmount(operation.balance.amount)} ${uom}`
                  : "—"
              }
            />
            <div className="grid gap-1">
              <dt className="text-xs font-medium text-muted-foreground">
                Связанная операция
              </dt>
              <dd className="text-sm text-foreground">
                {operation.linked_operation_id ? (
                  <Link
                    to="/waste/operations/$operationId"
                    params={{ operationId: operation.linked_operation_id }}
                    className="font-medium text-primary underline-offset-4 hover:underline"
                  >
                    Открыть связанную операцию
                  </Link>
                ) : (
                  "—"
                )}
              </dd>
            </div>
            <div className="flex flex-col gap-4 md:col-span-2">
              <OperationStepDetails
                pending={fieldsLocked}
                initial={operation}
                instructionId={undefined}
              />
            </div>{" "}
            <SummaryItem
              label="Дата создания операции"
              value={formatDateTime(operation.created_at)}
            />
            <SummaryItem
              label="Кем создана операция"
              value={operation.created_by.username}
            />
          </dl>

          <div className="flex flex-wrap gap-2">
            {canMutate ? (
              <Button type="submit" disabled={actionPending}>
                {pending ? "Сохранение…" : "Сохранить"}
              </Button>
            ) : null}
            <Button
              type="button"
              variant="outline"
              disabled={actionPending}
              onClick={onCancel}
            >
              Отмена
            </Button>
          </div>
        </form>
      </FormProvider>

      <ConfirmDialog
        open={approving}
        confirmDisabled={approveMutation.isPending}
        confirmVariant="default"
        onOpenChange={setApproving}
        title="Подтвердить операцию?"
        confirmLabel="Подтвердить"
        description={
          <>
            Поступление от {formatDate(operation.date)} по «
            {operation.waste.waste_classifier.name}» будет подтверждено. Остатки
            изменятся на обеих сторонах пары.
          </>
        }
        onConfirm={() => {
          void approveMutation.mutateAsync();
        }}
      />

      <ConfirmDialog
        open={rejecting}
        confirmDisabled={rejectMutation.isPending}
        onOpenChange={setRejecting}
        title="Отклонить операцию?"
        confirmLabel="Отклонить"
        description={
          <>
            Пара операций от {formatDate(operation.date)} по «
            {operation.waste.waste_classifier.name}» будет отклонена. Остатки не
            изменятся.
          </>
        }
        onConfirm={() => {
          void rejectMutation.mutateAsync();
        }}
      />

      <ConfirmDialog
        open={deleting}
        confirmDisabled={deleteMutation.isPending}
        onOpenChange={setDeleting}
        title="Удалить операцию?"
        confirmLabel="Удалить"
        description={
          <>
            Операция от {formatDate(operation.date)} по «
            {operation.waste.waste_classifier.name}» будет удалена. Остатки по
            этой единице и отходу будут пересчитаны.
          </>
        }
        onConfirm={() => {
          void deleteMutation.mutateAsync();
        }}
      />
    </>
  );
}

function SummaryItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid gap-1">
      <dt className="text-xs font-medium text-muted-foreground">{label}</dt>
      <dd className="text-sm text-foreground">{value}</dd>
    </div>
  );
}
