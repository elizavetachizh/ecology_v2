import { Download, LoaderCircle } from "lucide-react";
import type {
  PreviewFile,
  PreviewFileFormat,
} from "../../hooks/use-generate-report";
import { Alert, AlertDescription } from "../alert";
import { Button } from "../button";
import {
  Modal,
  ModalContent,
  ModalDescription,
  ModalFooter,
  ModalHeader,
  ModalTitle,
} from "../modal";
import { PdfJsPreview } from "./PdfJsPreview";

export type PdfPreviewPanelProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  periodLabel?: string;
  subtitle?: string;
  preview: PreviewFile | null;
  previewKey: number;
  error: string | null;
  downloadError?: string | null;
  isLoading: boolean;
  isDownloading: boolean;
  onRetry: () => void;
  onDownload: () => void;
  onDownloadPdf: () => void;
  title: string;
  format?: PreviewFileFormat;
};

export function PdfPreviewPanel({
  open,
  onOpenChange,
  periodLabel,
  subtitle,
  preview,
  previewKey,
  error,
  downloadError,
  isLoading,
  isDownloading,
  onRetry,
  onDownload,
  onDownloadPdf,
  title,
  format = "xlsx",
}: PdfPreviewPanelProps) {
  const formatLabel =
    format === "xlsx" ? "Excel" : format === "docx" ? "Word" : "PDF";

  const description = [
    periodLabel ? `Период: ${periodLabel}` : null,
    subtitle,
    preview ? preview.fileName : null,
  ]
    .filter((part) => Boolean(part))
    .join(" · ");
  const canDownloadOffice =
    !isLoading && !isDownloading && (Boolean(preview) || Boolean(error));

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent
        overlayClassName="z-[60]"
        className="z-[60] h-[min(90vh,860px)] max-h-[90vh] max-w-[min(96vw,1440px)] grid-rows-[auto_minmax(0,1fr)_auto] overflow-hidden p-0"
      >
        <ModalHeader className="border-b border-border px-6 py-5">
          <ModalTitle>Предпросмотр {title}</ModalTitle>
          <ModalDescription className={description ? undefined : "sr-only"}>
            {description || `Предпросмотр ${title}`}
          </ModalDescription>
        </ModalHeader>

        <div className="flex h-full min-h-0 flex-col overflow-hidden px-6 py-4">
          {isLoading ? (
            <div
              className="flex h-full min-h-64 flex-col items-center justify-center gap-3 text-muted-foreground"
              role="status"
            >
              <LoaderCircle className="size-7 animate-spin text-primary" />
              <span className="text-sm">
                Формируем PDF и загружаем предпросмотр…
              </span>
            </div>
          ) : null}

          {error ? (
            <div className="space-y-4">
              <Alert variant="error">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onRetry}
              >
                Повторить
              </Button>
            </div>
          ) : null}
          {downloadError ? (
            <Alert variant="error">
              <AlertDescription>{downloadError}</AlertDescription>
            </Alert>
          ) : null}

          {preview && !isLoading && !error ? (
            <PdfJsPreview
              key={previewKey}
              blob={preview.blob}
              label={`Предпросмотр ${title}`}
            />
          ) : null}
        </div>

        <ModalFooter className="border-t border-border px-6 py-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Закрыть
          </Button>
          <Button
            type="button"
            variant="outline"
            disabled={!canDownloadOffice}
            onClick={onDownload}
          >
            {isDownloading ? <LoaderCircle className="animate-spin" /> : null}
            Скачать {formatLabel}
          </Button>
          <Button
            type="button"
            onClick={onDownloadPdf}
            disabled={!preview || isLoading || isDownloading}
          >
            <Download />
            Скачать PDF
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
