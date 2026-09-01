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
  NEUTRALIZATION_METHOD_LABEL,
  OPERATION_TYPE_LABEL,
  OperationStatusBadge,
  rejectOperation,
  TRANSFER_RECEIPT_PURPOSE_LABEL,
  USE_PURPOSE_LABEL,
  type Operation,
} from "../../../../entities/waste/operations";
import { UOM_LABEL, wasteLabel } from "../../../../entities/waste/wastes";
import { formatDate, formatDateTime } from "../../../../shared/lib/format-date";
import {
  Alert,
  AlertDescription,
  Button,
  ConfirmDialog,
  PageContextBar,
  toast,
} from "../../../../shared/ui";
import { routes } from "../../../../shared/config/routes";
import { invalidateOperationQueries } from "../model/invalidate-operation-queries";
import { useEditOperationForm } from "../model/use-edit-operation-form";
import { OperationEditFields } from "./OperationEditFields";

type OperationCardProps = {
  operation: Operation;
  onCancel: () => void;
  onDeleted: () => void;
  onSaved: (operation: Operation, meta: { close: boolean }) => void;
};

function formatAmount(value: string): string {
  const n = Number(value);
  if (!Number.isFinite(n)) return value;
  return n.toLocaleString("ru-RU", { maximumFractionDigits: 6 });
}

export function OperationCard({
  operation,
  onCancel,
  onDeleted,
  onSaved,
}: OperationCardProps) {
  const [approving, setApproving] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const canMutate = canMutateOperation(operation.status);
  const canReview = canReviewOperation(operation.status);
  const {
    form,
    error,
    pending: savePending,
    onSubmit,
  } = useEditOperationForm({
    operation,
    onSaved,
  });

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
    savePending ||
    approveMutation.isPending ||
    rejectMutation.isPending ||
    deleteMutation.isPending;

  return (
    <FormProvider {...form}>
      <form
        onSubmit={form.handleSubmit((values) => onSubmit(false, values))}
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
            </>
          }
        />

        {error ? (
          <Alert variant="error">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : null}

        <div className="grid gap-3 rounded-xl border items-start border-border bg-card p-4 sm:grid-cols-2">
          {canMutate ? (
            <div className="contents">
              <OperationEditFields
                operation={operation}
                pending={actionPending}
              />
            </div>
          ) : (
            <>
              <SummaryItem label="Дата" value={formatDate(operation.date)} />
              <SummaryItem
                label="Количество"
                value={`${formatAmount(operation.amount)} ${uom}`}
              />
            </>
          )}
          <SummaryItem label="Место учёта" value={operation.unit.name} />
          <SummaryItem label="Отход" value={wasteLabel(operation.waste)} />
          <SummaryItem
            label="Тип операции"
            value={OPERATION_TYPE_LABEL[operation.operation_type]}
          />
          <SummaryItem
            label="Остаток после операции"
            value={
              operation.balance
                ? `${formatAmount(operation.balance.amount)} ${uom}`
                : "—"
            }
          />
          <TypeSpecificSummary
            operation={operation}
            hideWasteSource={canMutate}
          />
          <div className="grid gap-1">
            <dt className="text-xs font-medium text-muted-foreground">
              Связанная операция
            </dt>
            <dd className="text-sm text-foreground">
              {operation.linked_operation_id ? (
                <Link
                  to={routes.waste.operations.detail}
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
          <SummaryItem
            label="Дата создания операции"
            value={formatDateTime(operation.created_at)}
          />
          <SummaryItem
            label="Кем создана операция"
            value={operation.created_by.username}
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {canMutate ? (
            <>
              <Button type="submit" disabled={actionPending}>
                {savePending ? "Сохранение…" : "Сохранить"}
              </Button>{" "}
              <Button
                type="button"
                variant="secondary"
                disabled={actionPending}
                onClick={() =>
                  void form.handleSubmit((values) => onSubmit(true, values))()
                }
              >
                Сохранить и закрыть
              </Button>
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
            </>
          ) : null}
          <Button
            type="button"
            variant="outline"
            disabled={actionPending}
            onClick={onCancel}
          >
            Закрыть
          </Button>
        </div>
      </form>

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
    </FormProvider>
  );
}

function TypeSpecificSummary({
  operation,
  hideWasteSource,
}: {
  operation: Operation;
  hideWasteSource: boolean;
}) {
  if (operation.operation_type === "formed") {
    if (hideWasteSource) return null;
    return (
      <SummaryItem
        label="Источник образования"
        value={operation.waste_source?.name ?? "—"}
      />
    );
  }
  if (operation.operation_type === "used") {
    return (
      <SummaryItem
        label="Цель использования"
        value={
          operation.use_purpose ? USE_PURPOSE_LABEL[operation.use_purpose] : "—"
        }
      />
    );
  }
  if (operation.operation_type === "neutralized") {
    return (
      <SummaryItem
        label="Способ обезвреживания"
        value={
          operation.neutralization_method
            ? NEUTRALIZATION_METHOD_LABEL[operation.neutralization_method]
            : "—"
        }
      />
    );
  }
  if (
    operation.operation_type === "received_in" ||
    operation.operation_type === "transferred_in"
  ) {
    return (
      <>
        <SummaryItem
          label={
            operation.operation_type === "received_in"
              ? "Откуда поступило"
              : "Куда передано"
          }
          value={operation.unit_side?.name ?? "—"}
        />
        <SummaryItem
          label="Цель передачи или поступления"
          value={
            operation.transfer_receipt_purpose
              ? TRANSFER_RECEIPT_PURPOSE_LABEL[
                  operation.transfer_receipt_purpose
                ]
              : "—"
          }
        />
      </>
    );
  }
  if (operation.operation_type === "received_out") {
    return (
      <>
        <SummaryItem
          label="Контрагент"
          value={operation.counterparty?.name ?? "—"}
        />
        <SummaryItem
          label="Цель передачи или поступления"
          value={
            operation.transfer_receipt_purpose
              ? TRANSFER_RECEIPT_PURPOSE_LABEL[
                  operation.transfer_receipt_purpose
                ]
              : "—"
          }
        />
      </>
    );
  }
  if (operation.operation_type === "transferred_out") {
    return (
      <>
        <SummaryItem
          label="Цель передачи или поступления"
          value={
            operation.transfer_receipt_purpose
              ? TRANSFER_RECEIPT_PURPOSE_LABEL[
                  operation.transfer_receipt_purpose
                ]
              : "—"
          }
        />
        <SummaryItem
          label={operation.passport_id ? "Сопроводительный паспорт" : "ТТН"}
          value={operation.passport?.number ?? operation.ttn?.number ?? "—"}
        />
      </>
    );
  }
  return null;
}

function SummaryItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid gap-1">
      <dt className="text-xs font-medium text-muted-foreground">{label}</dt>
      <dd className="text-sm text-foreground">{value}</dd>
    </div>
  );
}
