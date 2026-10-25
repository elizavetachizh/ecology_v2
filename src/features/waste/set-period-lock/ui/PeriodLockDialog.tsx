import { useLayoutEffect, useRef, type RefObject } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { PeriodLock } from "../../../../entities/waste/operations";
import {
  Button,
  FormField,
  Input,
  Modal,
  ModalContent,
  ModalDescription,
  ModalFooter,
  ModalHeader,
  ModalTitle,
} from "../../../../shared/ui";
import {
  periodLockFormDefaults,
  periodLockFormSchema,
  type PeriodLockFormValues,
} from "../model/period-lock-form.schema";
import { useUpdatePeriodLock } from "../model/use-update-period-lock";
import { formatDateTime } from "../../../../shared/lib/format-date";

type PeriodLockDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  periodLock: PeriodLock | null;
};

export function PeriodLockDialog({
  open,
  onOpenChange,
  periodLock,
}: PeriodLockDialogProps) {
  const pendingRef = useRef(false);

  const handleOpenChange = (next: boolean) => {
    if (!next && pendingRef.current) return;
    onOpenChange(next);
  };

  return (
    <Modal open={open} onOpenChange={handleOpenChange}>
      {open ? (
        <PeriodLockDialogForm
          pendingRef={pendingRef}
          periodLock={periodLock}
          onDismiss={handleOpenChange}
          onSaved={() => onOpenChange(false)}
        />
      ) : null}
    </Modal>
  );
}

type PeriodLockDialogFormProps = {
  pendingRef: RefObject<boolean>;
  periodLock: PeriodLock | null;
  onDismiss: (open: boolean) => void;
  onSaved: () => void;
};

function PeriodLockDialogForm({
  pendingRef,
  periodLock,
  onDismiss,
  onSaved,
}: PeriodLockDialogFormProps) {
  const mutation = useUpdatePeriodLock();
  const pending = mutation.isPending;
  const lockDate = periodLock?.lock_date ?? null;
  const updatedBy = periodLock?.updated_by ?? null;
  const updatedAt = periodLock?.updated_at ?? null;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PeriodLockFormValues>({
    resolver: zodResolver(periodLockFormSchema),
    defaultValues: periodLockFormDefaults(lockDate),
  });

  useLayoutEffect(() => {
    pendingRef.current = pending;
    return () => {
      pendingRef.current = false;
    };
  }, [pending, pendingRef]);

  const onSave = handleSubmit((values) => {
    if (!values.lock_date) return;
    mutation.mutate({ lock_date: values.lock_date }, { onSuccess: onSaved });
  });

  return (
    <>
      <ModalContent
        className="max-w-md"
        showClose={!pending}
        onEscapeKeyDown={(event) => {
          if (pending) event.preventDefault();
        }}
        onPointerDownOutside={(event) => {
          if (pending) event.preventDefault();
        }}
        onInteractOutside={(event) => {
          if (pending) event.preventDefault();
        }}
      >
        <form className="grid gap-4" onSubmit={onSave}>
          <ModalHeader>
            <ModalTitle>Операционный период</ModalTitle>
            <ModalDescription>
              Пользователям будет недоступно создание новых и изменение
              существующих операций в закрытом периоде.
            </ModalDescription>
          </ModalHeader>
          <FormField
            htmlFor="period-lock-date"
            label="Последний закрытый день"
            required
            error={errors.lock_date?.message}

            description={
              updatedBy && updatedAt
                ? `Изменил ${updatedBy.username}, ${formatDateTime(updatedAt)}`
                : null
            }
          >
            <Input
              id="period-lock-date"
              type="date"
              disabled={pending}
              aria-invalid={Boolean(errors.lock_date)}
              {...register("lock_date")}
            />
          </FormField>

          <ModalFooter>
            <Button
              type="button"
              variant="outline"
              disabled={pending}
              onClick={() => onDismiss(false)}
            >
              Отмена
            </Button>

            <Button type="submit" disabled={pending}>
              {pending ? "Сохранение…" : "Сохранить"}
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </>
  );
}
