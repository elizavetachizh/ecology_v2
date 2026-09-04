import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import {
  downloadPassports,
  type PassportJournalFormat,
} from "../../../../entities/waste/passports";
import {
  Alert,
  AlertDescription,
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
import { downloadBlob } from "../lib/download-blob";
import {
  journalPeriodDefaults,
  journalPeriodSchema,
  type JournalPeriodValues,
} from "../model/journal-period.schema";
import { passportDownloadErrorMessage } from "../model/passport-download-error";

type PrintPassportsJournalModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultStartDate?: string;
  defaultEndDate?: string;
};

export function PrintPassportsJournalModal({
  open,
  onOpenChange,
  defaultStartDate,
  defaultEndDate,
}: PrintPassportsJournalModalProps) {
  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      {open ? (
        <PrintPassportsJournalForm
          defaultStartDate={defaultStartDate}
          defaultEndDate={defaultEndDate}
          onOpenChange={onOpenChange}
        />
      ) : null}
    </Modal>
  );
}

type PrintPassportsJournalFormProps = {
  defaultStartDate?: string;
  defaultEndDate?: string;
  onOpenChange: (open: boolean) => void;
};

function PrintPassportsJournalForm({
  defaultStartDate,
  defaultEndDate,
  onOpenChange,
}: PrintPassportsJournalFormProps) {
  const [error, setError] = useState<string | null>(null);
  const form = useForm<JournalPeriodValues>({
    resolver: zodResolver(journalPeriodSchema),
    defaultValues: journalPeriodDefaults(defaultStartDate, defaultEndDate),
  });
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = form;

  const mutation = useMutation({
    mutationFn: (
      vars: JournalPeriodValues & { format: PassportJournalFormat },
    ) =>
      downloadPassports({
        start_date: vars.start_date,
        end_date: vars.end_date,
        format: vars.format,
      }),
    onSuccess: (file) => {
      downloadBlob(file.blob, file.fileName);
      onOpenChange(false);
    },
    onError: (err) => setError(passportDownloadErrorMessage(err)),
  });

  const onDownload = (format: PassportJournalFormat) =>
    handleSubmit((values) => {
      setError(null);
      mutation.mutate({ ...values, format });
    })();

  return (
    <ModalContent className="max-w-md">
      <form
        className="min-w-0"
        onSubmit={(event) => {
          event.preventDefault();
          onDownload("xlsx");
        }}
      >
        <ModalHeader>
          <ModalTitle>Печать журнала паспортов</ModalTitle>
          <ModalDescription>
            Скачается список сопроводительных паспортов за выбранный период по
            дате вывоза.
          </ModalDescription>
        </ModalHeader>

        <div className="grid gap-4 py-2">
          {error ? (
            <Alert variant="error">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : null}

          <FormField
            htmlFor="start_date"
            label="Начало периода"
            required
            error={errors.start_date?.message}
          >
            <Input
              id="start_date"
              type="date"
              {...register("start_date")}
              disabled={mutation.isPending}
              aria-invalid={Boolean(errors.start_date)}
            />
          </FormField>
          <FormField
            htmlFor="end_date"
            label="Конец периода"
            required
            error={errors.end_date?.message}
          >
            <Input
              id="end_date"
              type="date"
              {...register("end_date")}
              disabled={mutation.isPending}
              aria-invalid={Boolean(errors.end_date)}
            />
          </FormField>
        </div>

        <ModalFooter>
          <Button
            type="button"
            variant="outline"
            disabled={mutation.isPending}
            onClick={() => onOpenChange(false)}
          >
            Отмена
          </Button>
          <Button
            type="button"
            variant="secondary"
            disabled={mutation.isPending}
            onClick={() => onDownload("pdf")}
          >
            {mutation.isPending ? "Скачивание…" : "Скачать PDF"}
          </Button>
          <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? "Скачивание…" : "Скачать Excel"}
          </Button>
        </ModalFooter>
      </form>
    </ModalContent>
  );
}
