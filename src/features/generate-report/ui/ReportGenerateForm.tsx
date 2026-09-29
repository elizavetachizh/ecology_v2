import type { ReactNode } from "react";
import { FileText } from "lucide-react";
import type { ReportDefinition } from "../../../shared/config/reports";
import type { PreviewFile } from "../../../shared/hooks";
import {
  Alert,
  AlertDescription,
  Button,
  FormSection,
  ModalContent,
  ModalDescription,
  ModalFooter,
  ModalHeader,
  ModalTitle,
  PageContextBar,
  PdfPreviewPanel,
} from "../../../shared/ui";

type ReportGenerateFormProps = {
  report: ReportDefinition;
  /** Страница отчёта или то же тело полей внутри диалога. */
  variant?: "page" | "dialog";
  showPageHeader?: boolean;
  onClose?: () => void;
  pending: boolean;
  downloadError: string | null;
  onGenerate: () => void;
  children: ReactNode;
  afterSection?: ReactNode;
  preview: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    periodLabel: string;
    file: PreviewFile | null;
    previewKey: number;
    error: string | null;
    isLoading: boolean;
    isDownloading: boolean;
    onRetry: () => void;
    onDownloadExcel: () => void;
    onDownloadPdf: () => void;
  };
};

export function ReportGenerateForm({
  report,
  variant = "page",
  showPageHeader = true,
  onClose,
  pending,
  downloadError,
  onGenerate,
  children,
  afterSection,
  preview,
}: ReportGenerateFormProps) {
  const downloadAlert = downloadError ? (
    <Alert variant="error">
      <AlertDescription>{downloadError}</AlertDescription>
    </Alert>
  ) : null;

  const generateButton = (
    <Button type="button" disabled={pending} onClick={onGenerate}>
      <FileText />
      Сформировать
    </Button>
  );

  const previewPanel = (
    <PdfPreviewPanel
      open={preview.open}
      onOpenChange={preview.onOpenChange}
      title={`отчета ${report.title}`}
      periodLabel={preview.periodLabel}
      preview={preview.file}
      previewKey={preview.previewKey}
      error={preview.error}
      downloadError={downloadError}
      isLoading={preview.isLoading}
      isDownloading={preview.isDownloading}
      onRetry={preview.onRetry}
      onDownload={preview.onDownloadExcel}
      onDownloadPdf={preview.onDownloadPdf}
    />
  );

  if (variant === "dialog") {
    return (
      <ModalContent className="max-w-2xl">
        <form
          className="grid gap-4"
          onSubmit={(event) => event.preventDefault()}
        >
          <ModalHeader>
            <ModalTitle>{report.title}</ModalTitle>
            <ModalDescription>{report.formDescription}</ModalDescription>
          </ModalHeader>

          <div className="grid gap-4 md:grid-cols-2">{children}</div>

          {afterSection}
          {downloadAlert}

          <ModalFooter>
            {onClose ? (
              <Button
                type="button"
                variant="outline"
                disabled={pending}
                onClick={onClose}
              >
                Закрыть
              </Button>
            ) : null}
            {generateButton}
          </ModalFooter>
        </form>
        {previewPanel}
      </ModalContent>
    );
  }

  return (
    <form className="mx-auto max-w-4xl space-y-6">
      {showPageHeader ? (
        <PageContextBar
          eyebrow="Отчёты"
          title={report.title}
          description={report.pageDescription}
        />
      ) : null}

      <FormSection
        title="Параметры отчёта"
        description={report.formDescription}
      >
        {children}
      </FormSection>

      {afterSection}
      {downloadAlert}

      <div className="flex flex-wrap items-center gap-2">{generateButton}</div>

      {previewPanel}
    </form>
  );
}
