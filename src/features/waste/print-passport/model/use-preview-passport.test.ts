import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { downloadPassport } from "../../../../entities/waste/passports";
import { ApiError } from "../../../../shared/api/api-client";
import { downloadBlob } from "../../../../shared/lib/download-blob";
import { usePreviewPassport } from "./use-preview-passport";

vi.mock("../../../../entities/waste/passports", async (importOriginal) => {
  const actual =
    await importOriginal<
      typeof import("../../../../entities/waste/passports")
    >();
  return {
    ...actual,
    downloadPassport: vi.fn(),
  };
});

vi.mock("../../../../shared/lib/download-blob", () => ({
  downloadBlob: vi.fn(),
}));

const downloadMock = vi.mocked(downloadPassport);
const downloadBlobMock = vi.mocked(downloadBlob);

const pdfFile = {
  blob: new Blob(["%PDF-1.4"], { type: "application/pdf" }),
  contentType: "application/pdf",
  fileName: "passport_СП-001.pdf",
};

const docxFile = {
  blob: new Blob(["docx"], {
    type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  }),
  contentType:
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  fileName: "passport_СП-001.docx",
};

describe("usePreviewPassport", () => {
  beforeEach(() => {
    downloadMock.mockReset();
    downloadBlobMock.mockReset();
  });

  it("opens a pdf preview for the passport", async () => {
    downloadMock.mockResolvedValue(pdfFile);

    const { result } = renderHook(() =>
      usePreviewPassport({ passportId: "p-1", number: "СП-001" }),
    );

    expect(result.current.previewOpen).toBe(false);
    expect(result.current.isLoading).toBe(false);

    act(() => {
      result.current.start();
    });

    expect(result.current.previewOpen).toBe(true);
    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.preview).toEqual(pdfFile);
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(downloadMock).toHaveBeenCalledWith(
      "p-1",
      { format: "pdf", number: "СП-001" },
      expect.any(AbortSignal),
    );
  });

  it("downloads word and the previewed pdf", async () => {
    downloadMock.mockImplementation(async (_id, options) =>
      options?.format === "docx" ? docxFile : pdfFile,
    );

    const { result } = renderHook(() =>
      usePreviewPassport({ passportId: "p-1", number: "СП-001" }),
    );

    act(() => {
      result.current.start();
    });
    await waitFor(() => {
      expect(result.current.preview?.fileName).toBe(pdfFile.fileName);
    });

    act(() => {
      result.current.onDownloadWord();
    });
    expect(result.current.isDownloading).toBe(true);

    await waitFor(() => {
      expect(downloadBlobMock).toHaveBeenCalledWith(
        docxFile.blob,
        docxFile.fileName,
      );
    });
    expect(downloadMock).toHaveBeenCalledWith(
      "p-1",
      { format: "docx", number: "СП-001" },
      expect.any(AbortSignal),
    );
    expect(result.current.isDownloading).toBe(false);

    act(() => {
      result.current.onDownloadPdf();
    });
    expect(downloadBlobMock).toHaveBeenCalledWith(
      pdfFile.blob,
      pdfFile.fileName,
    );
    expect(downloadMock).toHaveBeenCalledTimes(2);
  });

  it("maps preview and word download failures", async () => {
    downloadMock.mockRejectedValue(new ApiError("missing", 404, "http_error"));

    const { result } = renderHook(() =>
      usePreviewPassport({ passportId: "p-1", number: "СП-001" }),
    );

    act(() => {
      result.current.start();
    });
    await waitFor(() => {
      expect(result.current.error).toBe("Паспорт не найден.");
    });
    expect(result.current.preview).toBeNull();
    expect(result.current.isLoading).toBe(false);

    downloadMock.mockRejectedValue(new ApiError("bad", 422, "http_error"));
    act(() => {
      result.current.onDownloadWord();
    });
    await waitFor(() => {
      expect(result.current.downloadError).toBe(
        "Проверьте параметры печати.",
      );
    });
    expect(result.current.isDownloading).toBe(false);
  });

  it("clears the preview when the panel closes", async () => {
    downloadMock.mockResolvedValue(pdfFile);

    const { result } = renderHook(() =>
      usePreviewPassport({ passportId: "p-1", number: "СП-001" }),
    );

    act(() => {
      result.current.start();
    });
    await waitFor(() => {
      expect(result.current.preview).not.toBeNull();
    });

    act(() => {
      result.current.onOpenChange(false);
    });

    expect(result.current.previewOpen).toBe(false);
    expect(result.current.preview).toBeNull();
  });

  it("requests the passport from the latest render", async () => {
    downloadMock.mockResolvedValue(pdfFile);

    const { result, rerender } = renderHook(
      ({ passportId, number }) => usePreviewPassport({ passportId, number }),
      { initialProps: { passportId: "p-1", number: "СП-001" } },
    );

    rerender({ passportId: "p-2", number: "СП-002" });
    act(() => {
      result.current.start();
    });

    await waitFor(() => {
      expect(downloadMock).toHaveBeenCalledWith(
        "p-2",
        { format: "pdf", number: "СП-002" },
        expect.any(AbortSignal),
      );
    });
  });
});
