import { useEffect, useRef, useState } from "react";
import { downloadBlob } from "../lib/download-blob";

export type PreviewFile = {
  fileName: string;
  blob: Blob;
};

export const PREVIEW_FILE_FORMATS = ["xlsx", "pdf", "docx"] as const;
export type PreviewFileFormat = (typeof PREVIEW_FILE_FORMATS)[number];

type PreviewAction = "preview" | "download-xlsx" | "download-docx";

type UseGenerateReportParams<TValues> = {
  fetchFile: (
    values: TValues,
    format: PreviewFileFormat,
    signal: AbortSignal,
  ) => Promise<PreviewFile>;
  mapError: (error: unknown) => string;
};

type OfficeFormat = "xlsx" | "docx";

export function useGenerateReport<TValues>({
  fetchFile,
  mapError,
}: UseGenerateReportParams<TValues>) {
  const [previewOpen, setPreviewOpen] = useState(false);
  const [preview, setPreview] = useState<PreviewFile | null>(null);
  const [previewKey, setPreviewKey] = useState(0);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const [action, setAction] = useState<PreviewAction | null>(null);
  const requestRef = useRef<AbortController | null>(null);
  const actionRef = useRef<PreviewAction | null>(null);

  const isPreviewLoading = action === "preview";
  const isDownloading =
    action === "download-xlsx" || action === "download-docx";
  const pending = action !== null;

  const setCurrentAction = (next: PreviewAction | null) => {
    actionRef.current = next;
    setAction(next);
  };

  const abortPending = () => {
    requestRef.current?.abort();
    requestRef.current = null;
  };

  useEffect(() => {
    return () => {
      requestRef.current?.abort();
      requestRef.current = null;
    };
  }, []);

  const runPreview = async (values: TValues) => {
    abortPending();
    const controller = new AbortController();
    requestRef.current = controller;

    setPreviewOpen(true);
    setPreview(null);
    setPreviewError(null);
    setDownloadError(null);
    setCurrentAction("preview");

    try {
      const file = await fetchFile(values, "pdf", controller.signal);
      if (controller.signal.aborted) return;
      setPreview(file);
      setPreviewKey((key) => key + 1);
    } catch (requestError) {
      if (controller.signal.aborted) return;
      setPreviewError(mapError(requestError));
    } finally {
      if (!controller.signal.aborted) setCurrentAction(null);
    }
  };

  const runOfficeDownload = async (values: TValues, format: OfficeFormat) => {
    if (actionRef.current === "preview") return;

    abortPending();
    const controller = new AbortController();
    requestRef.current = controller;

    setDownloadError(null);
    setCurrentAction(format === "xlsx" ? "download-xlsx" : "download-docx");

    try {
      const file = await fetchFile(values, format, controller.signal);
      if (controller.signal.aborted) return;
      downloadBlob(file.blob, file.fileName);
    } catch (requestError) {
      if (controller.signal.aborted) return;
      setDownloadError(mapError(requestError));
    } finally {
      if (!controller.signal.aborted) setCurrentAction(null);
    }
  };

  const runDownloadXlsx = (values: TValues) =>
    runOfficeDownload(values, "xlsx");

  const runDownloadDocx = (values: TValues) =>
    runOfficeDownload(values, "docx");

  const handlePreviewOpenChange = (nextOpen: boolean) => {
    setPreviewOpen(nextOpen);
    if (nextOpen) return;
    abortPending();
    setCurrentAction(null);
    setPreview(null);
  };

  const downloadPreviewPdf = () => {
    if (!preview) return;
    downloadBlob(preview.blob, preview.fileName);
  };

  return {
    previewOpen,
    preview,
    previewKey,
    previewError,
    downloadError,
    isPreviewLoading,
    isDownloading,
    pending,
    runPreview,
    runDownloadXlsx,
    runDownloadDocx,
    handlePreviewOpenChange,
    downloadPreviewPdf,
  };
}
