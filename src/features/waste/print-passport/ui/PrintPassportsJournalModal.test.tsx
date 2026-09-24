import { useState } from "react";
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

vi.mock("../../../../shared/ui/pdf-preview/PdfJsPreview", () => ({
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

function renderJournal(
  dates: { start: string; end: string } = {
    start: "2026-02-01",
    end: "2026-02-28",
  },
) {
  const onOpenChange = vi.fn();

  function Harness() {
    const [open, setOpen] = useState(true);
    return (
      <PrintPassportsJournalModal
        open={open}
        onOpenChange={(next) => {
          onOpenChange(next);
          setOpen(next);
        }}
        defaultStartDate={dates.start}
        defaultEndDate={dates.end}
      />
    );
  }

  render(<Harness />);
  return { onOpenChange };
}

describe("PrintPassportsJournalModal", () => {
  afterEach(cleanup);

  beforeEach(() => {
    downloadMock.mockReset();
    downloadBlobMock.mockReset();
    downloadMock.mockResolvedValue(pdfFile);
  });

  it("closes the period dialog and opens a PDF preview", async () => {
    const { onOpenChange } = renderJournal();

    expect(screen.getByRole("dialog")).toHaveTextContent(
      "Печать журнала паспортов",
    );
    expect(document.getElementById("start_date")).toHaveValue("2026-02-01");
    expect(document.getElementById("end_date")).toHaveValue("2026-02-28");

    fireEvent.click(screen.getByRole("button", { name: "Сформировать" }));

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

    expect(onOpenChange).toHaveBeenCalledWith(false);
    expect(
      screen.queryByText("Печать журнала паспортов"),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Предпросмотр журнала паспортов" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Период: 01\.02\.2026 — 28\.02\.2026/),
    ).toBeInTheDocument();
    expect(screen.getByTestId("pdf-js-preview")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Скачать Excel" })).toBeEnabled();
    expect(screen.getByRole("button", { name: "Скачать PDF" })).toBeEnabled();
  });

  it("downloads excel from the preview after the period dialog closes", async () => {
    const { onOpenChange } = renderJournal();
    downloadMock.mockResolvedValueOnce(pdfFile).mockResolvedValueOnce(xlsxFile);

    fireEvent.click(screen.getByRole("button", { name: "Сформировать" }));
    await waitFor(() => {
      expect(screen.getByTestId("pdf-js-preview")).toBeInTheDocument();
    });
    expect(onOpenChange).toHaveBeenCalledTimes(1);

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
    expect(onOpenChange).toHaveBeenCalledTimes(1);
  });

  it("downloads the previewed pdf", async () => {
    renderJournal({ start: "2026-01-01", end: "2026-12-31" });

    fireEvent.click(screen.getByRole("button", { name: "Сформировать" }));
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
