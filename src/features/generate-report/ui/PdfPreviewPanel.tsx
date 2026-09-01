import { Download, LoaderCircle } from "lucide-react";
import type { GeneratedReportFile } from "../model/preview.types";
import {
  Alert,
  AlertDescription,
  Button,
  Modal,
  ModalContent,
  ModalDescription,
  ModalFooter,
  ModalHeader,
  ModalTitle,
} from "../../../shared/ui";
import { PdfJsPreview } from "./PdfJsPreview";

type PdfPreviewPanelProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  periodLabel: string;
  preview: GeneratedReportFile | null;
  error: string | null;
  isLoading: boolean;
  isDownloading: boolean;
  onRetry: () => void;
  onDownloadExcel: () => void;
  onDownloadPdf: () => void;
};

export function PdfPreviewPanel({
  open,
  onOpenChange,
  periodLabel,
  preview,
  error,
  isLoading,
  isDownloading,
  onRetry,
  onDownloadExcel,
  onDownloadPdf,
}: PdfPreviewPanelProps) {
  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent className="h-[min(90vh,860px)] max-h-[90vh] max-w-[min(96vw,1440px)] grid-rows-[auto_minmax(0,1fr)_auto] overflow-hidden p-0">
        <ModalHeader className="border-b border-border px-6 py-5">
          <ModalTitle>Предпросмотр PDF ПОД-9</ModalTitle>
          <ModalDescription>
            Период: {periodLabel}
            {preview ? ` · ${preview.fileName}` : ""}
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

          {preview && !isLoading && !error ? (
            <PdfJsPreview
              key={`${preview.fileName}-${preview.blob.size}`}
              blob={preview.blob}
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
            disabled={isDownloading}
            onClick={onDownloadExcel}
          >
            {isDownloading ? <LoaderCircle className="animate-spin" /> : null}
            Скачать Excel
          </Button>
          <Button
            type="button"
            onClick={onDownloadPdf}
            disabled={!preview || isDownloading}
          >
            <Download />
            Скачать PDF
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
