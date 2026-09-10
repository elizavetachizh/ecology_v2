import { FileText } from "lucide-react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { downloadPassports } from "../../../../entities/waste/passports";
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
import { formatDate } from "../../../../shared/lib/format-date";
import { PdfPreviewPanel, useGenerateReport } from "../../../generate-report";
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
  const form = useForm<JournalPeriodValues>({
    resolver: zodResolver(journalPeriodSchema),
    defaultValues: journalPeriodDefaults(defaultStartDate, defaultEndDate),
  });
  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
  } = form;

  const startDate = useWatch<JournalPeriodValues, "start_date">({
    control,
    name: "start_date",
  });
  const endDate = useWatch<JournalPeriodValues, "end_date">({
    control,
    name: "end_date",
  });

  const generate = useGenerateReport<JournalPeriodValues>({
    fetchFile: (values, format, signal) =>
      downloadPassports({ ...values, format }, signal),
    mapError: passportDownloadErrorMessage,
  });

  const onPreview = () => void handleSubmit(generate.runPreview)();

  return (
    <>
      <ModalContent className="max-w-md">
        <form
          className="min-w-0"
          onSubmit={(event) => {
            event.preventDefault();
            onPreview();
          }}
        >
          <ModalHeader>
            <ModalTitle>Печать журнала паспортов</ModalTitle>
            <ModalDescription>
              Выберите период по дате вывоза и откройте предпросмотр PDF. Excel
              и PDF можно скачать из окна предпросмотра.
            </ModalDescription>
          </ModalHeader>

          <div className="grid gap-4 py-2">
            {generate.downloadError ? (
              <Alert variant="error">
                <AlertDescription>{generate.downloadError}</AlertDescription>
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
                disabled={generate.pending}
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
                disabled={generate.pending}
                aria-invalid={Boolean(errors.end_date)}
              />
            </FormField>
          </div>

          <ModalFooter>
            <Button
              type="button"
              variant="outline"
              disabled={generate.pending}
              onClick={() => onOpenChange(false)}
            >
              Отмена
            </Button>
            <Button type="submit" disabled={generate.pending}>
              <FileText />
              {generate.isPreviewLoading ? "Формируем…" : "Предпросмотр"}
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>

      <PdfPreviewPanel
        open={generate.previewOpen}
        onOpenChange={generate.handlePreviewOpenChange}
        title="журнала паспортов"
        periodLabel={`${formatDate(startDate)} — ${formatDate(endDate)}`}
        preview={generate.preview}
        error={generate.previewError}
        downloadError={generate.downloadError}
        isLoading={generate.isPreviewLoading}
        isDownloading={generate.isDownloading}
        onRetry={onPreview}
        onDownloadExcel={() => void handleSubmit(generate.runDownloadXlsx)()}
        onDownloadPdf={generate.downloadPreviewPdf}
      />
    </>
  );
}
