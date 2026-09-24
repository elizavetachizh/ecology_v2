import { Printer } from "lucide-react";
import { useGenerateReport } from "../../../../shared/hooks";
import { Button, PdfPreviewPanel } from "../../../../shared/ui";
import { passportDownloadErrorMessage } from "../model/passport-download-error";
import { downloadPassport } from "../../../../entities/waste/passports";

type PrintPassportButtonProps = {
  passportId: string;
  number: string;
};

type PassportPreviewValues = {
  number: string;
};

export function PrintPassportButton({
  passportId,
  number,
}: PrintPassportButtonProps) {
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
  const onPreview = () => void generate.runPreview(values);
  const onDownloadWord = () => void generate.runDownloadDocx(values);
  const onDownloadPdf = () => void generate.downloadPreviewPdf();

  return (
    <>
      <Button type="button" variant="outline" size="sm" onClick={onPreview}>
        <Printer />
        Сформировать паспорт
      </Button>

      <PdfPreviewPanel
        open={generate.previewOpen}
        onOpenChange={generate.handlePreviewOpenChange}
        title="паспорта"
        subtitle={number}
        preview={generate.preview}
        previewKey={generate.previewKey}
        error={generate.previewError}
        downloadError={generate.downloadError}
        isLoading={generate.isPreviewLoading}
        isDownloading={generate.isDownloading}
        onRetry={onPreview}
        onDownload={onDownloadWord}
        format="docx"
        onDownloadPdf={onDownloadPdf}
      />
    </>
  );
}
