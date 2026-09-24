import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { downloadPassport } from "../../../../entities/waste/passports";
import { downloadBlob } from "../../../../shared/lib/download-blob";
import { PrintPassportButton } from "./PrintPassportButton";

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

vi.mock("../../../../shared/ui/pdf-preview/PdfJsPreview", () => ({
  PdfJsPreview: () => <div data-testid="pdf-js-preview" />,
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

describe("PrintPassportButton", () => {
  afterEach(cleanup);

  beforeEach(() => {
    downloadMock.mockReset();
    downloadBlobMock.mockReset();
  });

  it("opens a pdf preview and downloads word and pdf from it", async () => {
    downloadMock.mockImplementation(async (_id, options) =>
      options?.format === "docx" ? docxFile : pdfFile,
    );

    render(<PrintPassportButton passportId="p-1" number="СП-001" />);

    fireEvent.click(
      screen.getByRole("button", { name: "Сформировать паспорт" }),
    );

    await waitFor(() => {
      expect(screen.getByTestId("pdf-js-preview")).toBeInTheDocument();
    });

    expect(
      screen.getByRole("heading", { name: "Предпросмотр паспорта" }),
    ).toBeInTheDocument();
    expect(screen.getByText(/СП-001/)).toBeInTheDocument();
    expect(screen.queryByText(/Период:/)).not.toBeInTheDocument();
    expect(downloadMock).toHaveBeenCalledWith(
      "p-1",
      { format: "pdf", number: "СП-001" },
      expect.any(AbortSignal),
    );

    fireEvent.click(screen.getByRole("button", { name: "Скачать Word" }));
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

    fireEvent.click(screen.getByRole("button", { name: "Скачать PDF" }));
    expect(downloadBlobMock).toHaveBeenCalledWith(
      pdfFile.blob,
      pdfFile.fileName,
    );
  });

  it("keeps download actions disabled until the preview finishes", () => {
    downloadMock.mockReturnValue(new Promise(() => {}));

    render(<PrintPassportButton passportId="p-1" number="СП-001" />);
    fireEvent.click(
      screen.getByRole("button", { name: "Сформировать паспорт" }),
    );

    expect(screen.getByRole("button", { name: "Скачать Word" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Скачать PDF" })).toBeDisabled();
  });
});
