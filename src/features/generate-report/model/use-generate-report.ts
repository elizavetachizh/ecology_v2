import { useRef, useState } from "react";
import type {
  GeneratedReportFile,
  ReportFormat,
} from "../../../entities/reports";
import { downloadBlob } from "../../../shared/lib/download-blob";

export type ReportGenerateAction = "preview" | "download-xlsx";

type UseGenerateReportParams<TValues> = {
  fetchFile: (
    values: TValues,
    format: ReportFormat,
    signal: AbortSignal,
  ) => Promise<GeneratedReportFile>;
  mapError: (error: unknown) => string;
};

export function useGenerateReport<TValues>({
  fetchFile,
  mapError,
}: UseGenerateReportParams<TValues>) {
  const [previewOpen, setPreviewOpen] = useState(false);
  const [preview, setPreview] = useState<GeneratedReportFile | null>(null);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const [action, setAction] = useState<ReportGenerateAction | null>(null);
  const requestRef = useRef<AbortController | null>(null);

  const isPreviewLoading = action === "preview";
  const isDownloading = action === "download-xlsx";
  const pending = action !== null;

  const abortPending = () => {
    requestRef.current?.abort();
    requestRef.current = null;
  };

  const runPreview = async (values: TValues) => {
    abortPending();
    const controller = new AbortController();
    requestRef.current = controller;

    setPreviewOpen(true);
    setPreview(null);
    setPreviewError(null);
    setDownloadError(null);
    setAction("preview");

    try {
      setPreview(await fetchFile(values, "pdf", controller.signal));
    } catch (requestError) {
      if (controller.signal.aborted) return;
      setPreviewError(mapError(requestError));
    } finally {
      if (!controller.signal.aborted) setAction(null);
    }
  };

  const runDownloadXlsx = async (values: TValues) => {
    abortPending();
    const controller = new AbortController();
    requestRef.current = controller;

    setDownloadError(null);
    setAction("download-xlsx");

    try {
      const file = await fetchFile(values, "xlsx", controller.signal);
      if (controller.signal.aborted) return;
      downloadBlob(file.blob, file.fileName);
    } catch (requestError) {
      if (controller.signal.aborted) return;
      setDownloadError(mapError(requestError));
    } finally {
      if (!controller.signal.aborted) setAction(null);
    }
  };

  const handlePreviewOpenChange = (nextOpen: boolean) => {
    setPreviewOpen(nextOpen);
    if (!nextOpen && isPreviewLoading) {
      abortPending();
      setAction(null);
    }
  };

  const downloadPreviewPdf = () => {
    if (!preview) return;
    downloadBlob(preview.blob, preview.fileName);
  };

  return {
    previewOpen,
    preview,
    previewError,
    downloadError,
    isPreviewLoading,
    isDownloading,
    pending,
    runPreview,
    runDownloadXlsx,
    handlePreviewOpenChange,
    downloadPreviewPdf,
  };
}
