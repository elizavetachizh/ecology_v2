import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { PdfPreviewPanel } from "./PdfPreviewPanel";

vi.mock("./PdfJsPreview", () => ({
  PdfJsPreview: () => <div data-testid="pdf-js-preview" />,
}));

const preview = {
  fileName: "pod-9_2026-01-01_2026-03-01.pdf",
  contentType: "application/pdf",
  blob: new Blob(["%PDF-1.4"], { type: "application/pdf" }),
};

describe("PdfPreviewPanel", () => {
  afterEach(cleanup);

  it("shows PDF.js preview and download actions", () => {
    render(
      <PdfPreviewPanel
        open
        onOpenChange={vi.fn()}
        periodLabel="01.01.2026 — 01.03.2026"
        preview={preview}
        error={null}
        isLoading={false}
        isDownloading={false}
        onRetry={vi.fn()}
        onDownloadExcel={vi.fn()}
        onDownloadPdf={vi.fn()}
      />,
    );

    expect(screen.getByTestId("pdf-js-preview")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Скачать Excel" })).toBeEnabled();
    expect(screen.getByRole("button", { name: "Скачать PDF" })).toBeEnabled();
    expect(screen.getAllByRole("button", { name: "Закрыть" }).length).toBeGreaterThan(
      0,
    );
  });
});
