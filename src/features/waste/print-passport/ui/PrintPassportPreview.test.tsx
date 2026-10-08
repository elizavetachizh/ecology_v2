import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { downloadPassport } from "../../../../entities/waste/passports";
import { downloadBlob } from "../../../../shared/lib/download-blob";
import { PrintPassportPreview } from "./PrintPassportPreview";

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

describe("PrintPassportPreview", () => {
  afterEach(cleanup);

  beforeEach(() => {
    downloadMock.mockReset();
    downloadBlobMock.mockReset();
  });

  it("opens a pdf preview for the selected passport", async () => {
    downloadMock.mockImplementation(async (_id, options) =>
      options?.format === "docx" ? docxFile : pdfFile,
    );
    const onClose = vi.fn();

    render(
      <PrintPassportPreview
        passport={{ id: "p-1", number: "СП-001" }}
        onClose={onClose}
      />,
    );

    await waitFor(() => {
      expect(screen.getByTestId("pdf-js-preview")).toBeInTheDocument();
    });

    expect(
      screen.getByRole("heading", { name: "Предпросмотр паспорта" }),
    ).toBeInTheDocument();
    expect(downloadMock).toHaveBeenCalledWith(
      "p-1",
      { format: "pdf", number: "СП-001" },
      expect.any(AbortSignal),
    );

    const footer = document.querySelector("[data-slot=modal-footer]");
    expect(footer).not.toBeNull();
    fireEvent.click(
      within(footer as HTMLElement).getByRole("button", { name: "Закрыть" }),
    );
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("does not request a file until a passport is selected", () => {
    render(<PrintPassportPreview passport={null} onClose={vi.fn()} />);

    expect(downloadMock).not.toHaveBeenCalled();
    expect(
      screen.queryByRole("heading", { name: "Предпросмотр паспорта" }),
    ).not.toBeInTheDocument();
  });
});
