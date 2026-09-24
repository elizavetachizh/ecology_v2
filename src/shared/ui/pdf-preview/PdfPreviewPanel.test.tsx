import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { PdfPreviewPanel } from "./PdfPreviewPanel";

vi.mock("./PdfJsPreview", () => ({
  PdfJsPreview: ({ label }: { label: string }) => (
    <div data-testid="pdf-js-preview">{label}</div>
  ),
}));

const preview = {
  fileName: "pod-9_2026-01-01_2026-03-01.pdf",
  blob: new Blob(["%PDF-1.4"], { type: "application/pdf" }),
};

const panelProps = {
  open: true,
  onOpenChange: vi.fn(),
  title: "ПОД-9",
  preview,
  previewKey: 1,
  error: null,
  format: "xlsx" as const,
  isLoading: false,
  isDownloading: false,
  onRetry: vi.fn(),
  onDownload: vi.fn(),
  onDownloadPdf: vi.fn(),
};

describe("PdfPreviewPanel", () => {
  afterEach(cleanup);

  it("shows PDF.js preview and download actions", () => {
    render(
      <PdfPreviewPanel {...panelProps} periodLabel="01.01.2026 — 01.03.2026" />,
    );

    expect(screen.getByTestId("pdf-js-preview")).toHaveTextContent(
      "Предпросмотр ПОД-9",
    );
    expect(
      screen.getByText(/Период: 01\.01\.2026 — 01\.03\.2026/),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Скачать Excel" })).toBeEnabled();
    expect(screen.getByRole("button", { name: "Скачать PDF" })).toBeEnabled();
    expect(
      screen.getAllByRole("button", { name: "Закрыть" }).length,
    ).toBeGreaterThan(0);
  });

  it("omits the period line when no period is passed", () => {
    render(<PdfPreviewPanel {...panelProps} subtitle="СП-001" />);

    expect(screen.queryByText(/Период:/)).not.toBeInTheDocument();
    expect(screen.getByText(/СП-001/)).toBeInTheDocument();
  });

  it("disables downloads while the preview is loading", () => {
    render(
      <PdfPreviewPanel
        {...panelProps}
        preview={null}
        isLoading
        periodLabel="01.01.2026 — 01.03.2026"
      />,
    );

    expect(
      screen.getByRole("button", { name: "Скачать Excel" }),
    ).toBeDisabled();
    expect(screen.getByRole("button", { name: "Скачать PDF" })).toBeDisabled();
  });
});
