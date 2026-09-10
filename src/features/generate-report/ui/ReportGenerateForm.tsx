import type { ReactNode } from "react";
import { FileText } from "lucide-react";
import type { GeneratedReportFile } from "../../../entities/reports";
import type { ReportDefinition } from "../../../shared/config/reports";
import {
  Alert,
  AlertDescription,
  Button,
  FormSection,
  PageContextBar,
} from "../../../shared/ui";
import { PdfPreviewPanel } from "./PdfPreviewPanel";

type ReportGenerateFormProps = {
  report: ReportDefinition;
  showPageHeader?: boolean;
  pending: boolean;
  downloadError: string | null;
  onGenerate: () => void;
  children: ReactNode;
  afterSection?: ReactNode;
  preview: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    periodLabel: string;
    file: GeneratedReportFile | null;
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
  showPageHeader = true,
  pending,
  downloadError,
  onGenerate,
  children,
  afterSection,
  preview,
}: ReportGenerateFormProps) {
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

      {downloadError ? (
        <Alert variant="error">
          <AlertDescription>{downloadError}</AlertDescription>
        </Alert>
      ) : null}

      <div className="flex flex-wrap items-center gap-2">
        <Button type="button" disabled={pending} onClick={onGenerate}>
          <FileText />
          Сформировать
        </Button>
      </div>

      <PdfPreviewPanel
        open={preview.open}
        onOpenChange={preview.onOpenChange}
        title={`отчета ${report.title}`}
        periodLabel={preview.periodLabel}
        preview={preview.file}
        error={preview.error}
        downloadError={downloadError}
        isLoading={preview.isLoading}
        isDownloading={preview.isDownloading}
        onRetry={preview.onRetry}
        onDownloadExcel={preview.onDownloadExcel}
        onDownloadPdf={preview.onDownloadPdf}
      />
    </form>
  );
}
