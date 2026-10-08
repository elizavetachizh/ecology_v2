import { PdfPreviewPanel } from "../../../../shared/ui";
import type { usePreviewPassport } from "../model/use-preview-passport";

type PreviewPassportState = ReturnType<typeof usePreviewPassport>;

type PassportPreviewPanelProps = {
  number: string;
  preview: PreviewPassportState;
  onClose?: () => void;
};

export function PassportPreviewPanel({
  number,
  preview,
  onClose,
}: PassportPreviewPanelProps) {
  return (
    <PdfPreviewPanel
      open={preview.previewOpen}
      onOpenChange={(open) => {
        preview.onOpenChange(open);
        if (!open) onClose?.();
      }}
      title="паспорта"
      subtitle={number}
      preview={preview.preview}
      previewKey={preview.previewKey}
      error={preview.error}
      downloadError={preview.downloadError}
      isLoading={preview.isLoading}
      isDownloading={preview.isDownloading}
      onRetry={preview.start}
      onDownload={preview.onDownloadWord}
      format="docx"
      onDownloadPdf={preview.onDownloadPdf}
    />
  );
}
