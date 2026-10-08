import { downloadPassport } from "../../../../entities/waste/passports";
import { useGenerateReport } from "../../../../shared/hooks";
import { passportDownloadErrorMessage } from "./passport-download-error";

type PreviewPassportParams = {
  passportId: string;
  number: string;
};

type PassportPreviewValues = {
  number: string;
};

export function usePreviewPassport({
  passportId,
  number,
}: PreviewPassportParams) {
  const generate = useGenerateReport<PassportPreviewValues>({
    fetchFile: (_values, format, signal) =>
      downloadPassport(
        passportId,
        { format: format === "docx" ? "docx" : "pdf", number },
        signal,
      ),
    mapError: passportDownloadErrorMessage,
  });
  const values = { number };

  return {
    start: () => void generate.runPreview(values),
    onDownloadWord: () => void generate.runDownloadDocx(values),
    onDownloadPdf: () => generate.downloadPreviewPdf(),
    previewOpen: generate.previewOpen,
    onOpenChange: generate.handlePreviewOpenChange,
    preview: generate.preview,
    previewKey: generate.previewKey,
    error: generate.previewError,
    downloadError: generate.downloadError,
    isLoading: generate.isPreviewLoading,
    isDownloading: generate.isDownloading,
  };
}
