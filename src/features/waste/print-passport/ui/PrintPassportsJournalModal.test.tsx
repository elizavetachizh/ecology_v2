import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { downloadPassports } from "../../../../entities/waste/passports";
import { downloadBlob } from "../../../../shared/lib/download-blob";
import { PrintPassportsJournalModal } from "./PrintPassportsJournalModal";

vi.mock("../../../../entities/waste/passports", async (importOriginal) => {
  const actual =
    await importOriginal<
      typeof import("../../../../entities/waste/passports")
    >();
  return {
    ...actual,
    downloadPassports: vi.fn(),
  };
});

vi.mock("../../../../shared/lib/download-blob", () => ({
  downloadBlob: vi.fn(),
}));

vi.mock("../../../generate-report/ui/PdfJsPreview", () => ({
  PdfJsPreview: () => <div data-testid="pdf-js-preview" />,
}));

const downloadMock = vi.mocked(downloadPassports);
const downloadBlobMock = vi.mocked(downloadBlob);

const pdfFile = {
  blob: new Blob(["%PDF-1.4"], { type: "application/pdf" }),
  contentType: "application/pdf",
  fileName: "passports_2026-02-01_2026-02-28.pdf",
};

const xlsxFile = {
  blob: new Blob(["xlsx"], { type: "application/vnd.ms-excel" }),
  contentType: "application/vnd.ms-excel",
  fileName: "passports_2026-02-01_2026-02-28.xlsx",
};

describe("PrintPassportsJournalModal", () => {
  afterEach(cleanup);

  beforeEach(() => {
    downloadMock.mockReset();
    downloadBlobMock.mockReset();
    downloadMock.mockResolvedValue(pdfFile);
  });

  it("prefills the period and opens a PDF preview on top", async () => {
    render(
      <PrintPassportsJournalModal
        open
        onOpenChange={vi.fn()}
        defaultStartDate="2026-02-01"
        defaultEndDate="2026-02-28"
      />,
    );

    expect(screen.getByRole("dialog")).toHaveTextContent(
      "Печать журнала паспортов",
    );
    expect(document.getElementById("start_date")).toHaveValue("2026-02-01");
    expect(document.getElementById("end_date")).toHaveValue("2026-02-28");

    fireEvent.click(screen.getByRole("button", { name: "Предпросмотр" }));

    await waitFor(() => {
      expect(downloadMock).toHaveBeenCalledWith(
        {
          start_date: "2026-02-01",
          end_date: "2026-02-28",
          format: "pdf",
        },
        expect.any(AbortSignal),
      );
    });

    expect(
      screen.getByRole("heading", { name: "Предпросмотр журнала паспортов" }),
    ).toBeInTheDocument();
    expect(screen.getByTestId("pdf-js-preview")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Скачать Excel" })).toBeEnabled();
    expect(screen.getByRole("button", { name: "Скачать PDF" })).toBeEnabled();
  });

  it("downloads excel from the preview without closing the period modal", async () => {
    const onOpenChange = vi.fn();
    downloadMock.mockResolvedValueOnce(pdfFile).mockResolvedValueOnce(xlsxFile);

    render(
      <PrintPassportsJournalModal
        open
        onOpenChange={onOpenChange}
        defaultStartDate="2026-02-01"
        defaultEndDate="2026-02-28"
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Предпросмотр" }));
    await waitFor(() => {
      expect(screen.getByTestId("pdf-js-preview")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("button", { name: "Скачать Excel" }));

    await waitFor(() => {
      expect(downloadMock).toHaveBeenCalledWith(
        {
          start_date: "2026-02-01",
          end_date: "2026-02-28",
          format: "xlsx",
        },
        expect.any(AbortSignal),
      );
    });
    expect(downloadBlobMock).toHaveBeenCalledWith(
      xlsxFile.blob,
      xlsxFile.fileName,
    );
    expect(onOpenChange).not.toHaveBeenCalled();
  });

  it("downloads the previewed pdf", async () => {
    render(
      <PrintPassportsJournalModal
        open
        onOpenChange={vi.fn()}
        defaultStartDate="2026-01-01"
        defaultEndDate="2026-12-31"
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Предпросмотр" }));
    await waitFor(() => {
      expect(screen.getByTestId("pdf-js-preview")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("button", { name: "Скачать PDF" }));

    expect(downloadBlobMock).toHaveBeenCalledWith(
      pdfFile.blob,
      pdfFile.fileName,
    );
  });
});
