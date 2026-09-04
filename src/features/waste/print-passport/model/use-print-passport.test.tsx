import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { downloadPassport } from "../../../../entities/waste/passports";
import { toast } from "../../../../shared/ui";
import { downloadBlob } from "../lib/download-blob";
import { usePrintPassport } from "./use-print-passport";

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

vi.mock("../lib/download-blob", () => ({
  downloadBlob: vi.fn(),
}));

vi.mock("../../../../shared/ui", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../../../../shared/ui")>();
  return {
    ...actual,
    toast: { ...actual.toast, error: vi.fn(), success: vi.fn() },
  };
});

const downloadMock = vi.mocked(downloadPassport);
const downloadBlobMock = vi.mocked(downloadBlob);
const toastError = vi.mocked(toast.error);

const file = {
  blob: new Blob(["pdf"], { type: "application/pdf" }),
  contentType: "application/pdf",
  fileName: "passport_SP-001.pdf",
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

describe("usePrintPassport", () => {
  beforeEach(() => {
    downloadMock.mockReset();
    downloadBlobMock.mockReset();
    toastError.mockReset();
    downloadMock.mockResolvedValue(file);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("downloads the passport in the chosen format", async () => {
    const { result } = renderHook(() => usePrintPassport(), { wrapper });

    act(() => {
      result.current.print("p-1", "SP-001", "docx");
    });

    await waitFor(() => {
      expect(downloadMock).toHaveBeenCalledWith("p-1", {
        format: "docx",
        number: "SP-001",
      });
    });
    expect(downloadBlobMock).toHaveBeenCalledWith(file.blob, file.fileName);
  });

  it("toasts a mapped error", async () => {
    downloadMock.mockRejectedValue(new Error("сеть"));
    const { result } = renderHook(() => usePrintPassport(), { wrapper });

    act(() => {
      result.current.print("p-1", "SP-001", "pdf");
    });

    await waitFor(() => {
      expect(toastError).toHaveBeenCalledWith("сеть");
    });
    expect(downloadBlobMock).not.toHaveBeenCalled();
  });
});
