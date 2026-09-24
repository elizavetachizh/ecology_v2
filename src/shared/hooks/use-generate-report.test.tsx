import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useGenerateReport, type PreviewFile } from "./use-generate-report";

const pdfFile: PreviewFile = {
  blob: new Blob(["%PDF-1.4"], { type: "application/pdf" }),
  fileName: "report.pdf",
};

const docxFile: PreviewFile = {
  blob: new Blob(["docx"], { type: "application/vnd.openxmlformats" }),
  fileName: "report.docx",
};

function abortError() {
  return new DOMException("The operation was aborted.", "AbortError");
}

describe("useGenerateReport", () => {
  it("does not start a docx download while preview is in flight", async () => {
    let resolvePreview: (file: PreviewFile) => void = () => {};
    const fetchFile = vi.fn(
      (_values: { id: string }, format: string, signal: AbortSignal) =>
        new Promise<PreviewFile>((resolve, reject) => {
          signal.addEventListener("abort", () => reject(abortError()), {
            once: true,
          });
          if (format === "pdf") resolvePreview = resolve;
          else resolve(docxFile);
        }),
    );

    const { result } = renderHook(() =>
      useGenerateReport({
        fetchFile,
        mapError: () => "Ошибка",
      }),
    );

    act(() => {
      void result.current.runPreview({ id: "1" });
    });
    expect(result.current.isPreviewLoading).toBe(true);

    await act(async () => {
      await result.current.runDownloadDocx({ id: "1" });
    });

    expect(fetchFile).toHaveBeenCalledTimes(1);
    expect(fetchFile.mock.calls[0]?.[1]).toBe("pdf");

    await act(async () => {
      resolvePreview(pdfFile);
    });

    expect(result.current.preview).toEqual(pdfFile);
    expect(result.current.previewKey).toBe(1);
    expect(result.current.isPreviewLoading).toBe(false);
  });

  it("aborts an in-flight docx download and drops the preview when the panel closes", async () => {
    const fetchFile = vi.fn(
      (_values: { id: string }, format: string, signal: AbortSignal) => {
        if (format === "pdf") return Promise.resolve(pdfFile);
        return new Promise<PreviewFile>((_resolve, reject) => {
          signal.addEventListener("abort", () => reject(abortError()), {
            once: true,
          });
        });
      },
    );

    const { result } = renderHook(() =>
      useGenerateReport({
        fetchFile,
        mapError: () => "Ошибка",
      }),
    );

    await act(async () => {
      await result.current.runPreview({ id: "1" });
    });
    expect(result.current.preview).toEqual(pdfFile);

    let download: Promise<void> = Promise.resolve();
    act(() => {
      download = result.current.runDownloadDocx({ id: "1" });
    });
    expect(result.current.isDownloading).toBe(true);

    const signal = fetchFile.mock.calls.at(-1)?.[2] as AbortSignal;
    act(() => {
      result.current.handlePreviewOpenChange(false);
    });

    expect(signal.aborted).toBe(true);
    await act(async () => {
      await download;
    });
    expect(result.current.previewOpen).toBe(false);
    expect(result.current.preview).toBeNull();
    expect(result.current.isDownloading).toBe(false);
  });

  it("aborts the request when the hook unmounts", () => {
    const fetchFile = vi.fn(
      (_values: { id: string }, _format: string, signal: AbortSignal) =>
        new Promise<PreviewFile>((_resolve, reject) => {
          signal.addEventListener("abort", () => reject(abortError()), {
            once: true,
          });
        }),
    );

    const { result, unmount } = renderHook(() =>
      useGenerateReport({
        fetchFile,
        mapError: () => "Ошибка",
      }),
    );

    act(() => {
      void result.current.runPreview({ id: "1" });
    });

    const signal = fetchFile.mock.calls[0]?.[2] as AbortSignal;
    unmount();
    expect(signal.aborted).toBe(true);
  });
});
