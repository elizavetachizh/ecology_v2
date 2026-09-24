import { useState } from "react";
import { FileText } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { downloadPassports } from "../../../../entities/waste/passports";
import { useGenerateReport } from "../../../../shared/hooks";
import { formatDate } from "../../../../shared/lib/format-date";
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
  PdfPreviewPanel,
} from "../../../../shared/ui";
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
  const [submitted, setSubmitted] = useState<JournalPeriodValues | null>(null);
  const generate = useGenerateReport<JournalPeriodValues>({
    fetchFile: (values, format, signal) =>
      downloadPassports(
        { ...values, format: format === "pdf" ? "pdf" : "xlsx" },
        signal,
      ),
    mapError: passportDownloadErrorMessage,
  });

  const startPreview = (values: JournalPeriodValues) => {
    setSubmitted(values);
    void generate.runPreview(values);
    onOpenChange(false);
  };

  const periodLabel = submitted
    ? `${formatDate(submitted.start_date)} — ${formatDate(submitted.end_date)}`
    : undefined;

  return (
    <>
      <Modal open={open} onOpenChange={onOpenChange}>
        {open ? (
          <PrintPassportsJournalForm
            defaultStartDate={defaultStartDate}
            defaultEndDate={defaultEndDate}
            onCancel={() => onOpenChange(false)}
            onSubmit={startPreview}
          />
        ) : null}
      </Modal>

      <PdfPreviewPanel
        open={generate.previewOpen}
        onOpenChange={generate.handlePreviewOpenChange}
        title="журнала паспортов"
        periodLabel={periodLabel}
        preview={generate.preview}
        previewKey={generate.previewKey}
        error={generate.previewError}
        downloadError={generate.downloadError}
        isLoading={generate.isPreviewLoading}
        isDownloading={generate.isDownloading}
        onRetry={() => {
          if (submitted) void generate.runPreview(submitted);
        }}
        onDownload={() => {
          if (submitted) void generate.runDownloadXlsx(submitted);
        }}
        onDownloadPdf={generate.downloadPreviewPdf}
      />
    </>
  );
}

type PrintPassportsJournalFormProps = {
  defaultStartDate?: string;
  defaultEndDate?: string;
  onCancel: () => void;
  onSubmit: (values: JournalPeriodValues) => void;
};

function PrintPassportsJournalForm({
  defaultStartDate,
  defaultEndDate,
  onCancel,
  onSubmit,
}: PrintPassportsJournalFormProps) {
  const form = useForm<JournalPeriodValues>({
    resolver: zodResolver(journalPeriodSchema),
    defaultValues: journalPeriodDefaults(defaultStartDate, defaultEndDate),
  });
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = form;

  return (
    <ModalContent className="max-w-md">
      <form
        className="min-w-0"
        onSubmit={(event) => {
          event.preventDefault();
          void handleSubmit(onSubmit)();
        }}
      >
        <ModalHeader>
          <ModalTitle>Печать журнала паспортов</ModalTitle>
          <ModalDescription>
            Выберите период по дате вывоза и откройте предпросмотр PDF. Excel и
            PDF можно скачать из окна предпросмотра.
          </ModalDescription>
        </ModalHeader>

        <div className="grid gap-4 py-2">
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
              aria-invalid={Boolean(errors.end_date)}
            />
          </FormField>
        </div>

        <ModalFooter>
          <Button type="button" variant="outline" onClick={onCancel}>
            Отмена
          </Button>
          <Button type="submit">
            <FileText />
            Сформировать
          </Button>
        </ModalFooter>
      </form>
    </ModalContent>
  );
}
