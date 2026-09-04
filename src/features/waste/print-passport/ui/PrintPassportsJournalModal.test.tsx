import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { downloadPassports } from "../../../../entities/waste/passports";
import { downloadBlob } from "../lib/download-blob";
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

vi.mock("../lib/download-blob", () => ({
  downloadBlob: vi.fn(),
}));

const downloadMock = vi.mocked(downloadPassports);
const downloadBlobMock = vi.mocked(downloadBlob);

const file = {
  blob: new Blob(["xlsx"], { type: "application/vnd.ms-excel" }),
  contentType: "application/vnd.ms-excel",
  fileName: "passports_2026-02-01_2026-02-28.xlsx",
};

function wrapper({ children }: { children: ReactNode }) {
  const client = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

describe("PrintPassportsJournalModal", () => {
  afterEach(cleanup);

  beforeEach(() => {
    downloadMock.mockReset();
    downloadBlobMock.mockReset();
    downloadMock.mockResolvedValue(file);
  });

  it("prefills the period and downloads xlsx", async () => {
    const onOpenChange = vi.fn();
    render(
      <PrintPassportsJournalModal
        open
        onOpenChange={onOpenChange}
        defaultStartDate="2026-02-01"
        defaultEndDate="2026-02-28"
      />,
      { wrapper },
    );

    expect(screen.getByRole("dialog")).toHaveTextContent(
      "Печать журнала паспортов",
    );
    expect(document.getElementById("start_date")).toHaveValue("2026-02-01");
    expect(document.getElementById("end_date")).toHaveValue("2026-02-28");

    fireEvent.click(screen.getByRole("button", { name: "Скачать Excel" }));

    await waitFor(() => {
      expect(downloadMock).toHaveBeenCalledWith({
        start_date: "2026-02-01",
        end_date: "2026-02-28",
        format: "xlsx",
      });
    });
    expect(downloadBlobMock).toHaveBeenCalledWith(file.blob, file.fileName);
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("downloads pdf for the same period", async () => {
    render(
      <PrintPassportsJournalModal
        open
        onOpenChange={vi.fn()}
        defaultStartDate="2026-01-01"
        defaultEndDate="2026-12-31"
      />,
      { wrapper },
    );

    fireEvent.click(screen.getByRole("button", { name: "Скачать PDF" }));

    await waitFor(() => {
      expect(downloadMock).toHaveBeenCalledWith({
        start_date: "2026-01-01",
        end_date: "2026-12-31",
        format: "pdf",
      });
    });
  });
});
