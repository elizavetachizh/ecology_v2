import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  operationsQueryKeys,
  updatePeriodLock,
  type PeriodLock,
} from "../../../../entities/waste/operations";
import { userProfileFixture } from "../../../../entities/waste/persons";
import { queryClient } from "../../../../shared/lib/query-client";
import { toast } from "../../../../shared/ui";
import { useUpdatePeriodLock } from "./use-update-period-lock";

vi.mock("../../../../entities/tenant", () => ({
  useTenant: () => ({ activeTenantId: "tenant-1" }),
}));

vi.mock("../../../../entities/waste/operations", async (importOriginal) => {
  const actual =
    await importOriginal<
      typeof import("../../../../entities/waste/operations")
    >();
  return {
    ...actual,
    updatePeriodLock: vi.fn(),
  };
});

const updatePeriodLockMock = vi.mocked(updatePeriodLock);

const closedLock: PeriodLock = {
  lock_date: "2026-01-31",
  created_at: "2026-02-01T08:00:00Z",
  updated_at: "2026-02-01T08:00:00Z",
  created_by: userProfileFixture,
  updated_by: userProfileFixture,
};

const openLock: PeriodLock = {
  lock_date: null,
  created_at: "2026-02-01T08:00:00Z",
  updated_at: "2026-02-02T08:00:00Z",
  created_by: userProfileFixture,
  updated_by: userProfileFixture,
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

describe("useUpdatePeriodLock", () => {
  beforeEach(() => {
    updatePeriodLockMock.mockReset();
    vi.spyOn(queryClient, "invalidateQueries").mockResolvedValue(undefined);
    vi.spyOn(toast, "success").mockReturnValue(
      "00000000-0000-0000-0000-000000000000",
    );
    vi.spyOn(toast, "error").mockReturnValue(
      "00000000-0000-0000-0000-000000000000",
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("puts the lock date, invalidates only the period lock and toasts the closed date", async () => {
    updatePeriodLockMock.mockResolvedValue(closedLock);
    const { result } = renderHook(() => useUpdatePeriodLock(), { wrapper });

    act(() => {
      result.current.mutate({ lock_date: "2026-01-31" });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(updatePeriodLockMock).toHaveBeenCalledWith({
      lock_date: "2026-01-31",
    });
    expect(queryClient.invalidateQueries).toHaveBeenCalledTimes(1);
    expect(queryClient.invalidateQueries).toHaveBeenCalledWith({
      queryKey: operationsQueryKeys.periodLock("tenant-1"),
    });
    expect(toast.success).toHaveBeenCalledWith("Период закрыт по 31.01.2026");
  });

  it("puts null to open the period", async () => {
    updatePeriodLockMock.mockResolvedValue(openLock);
    const { result } = renderHook(() => useUpdatePeriodLock(), { wrapper });

    act(() => {
      result.current.mutate({ lock_date: null });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(updatePeriodLockMock).toHaveBeenCalledWith({ lock_date: null });
    expect(toast.success).toHaveBeenCalledWith("Период открыт");
    expect(queryClient.invalidateQueries).toHaveBeenCalledWith({
      queryKey: operationsQueryKeys.periodLock("tenant-1"),
    });
  });

  it("toasts the mutation error and does not invalidate", async () => {
    updatePeriodLockMock.mockRejectedValue(
      new Error("Сервер вернул ошибку 400"),
    );
    const { result } = renderHook(() => useUpdatePeriodLock(), { wrapper });

    act(() => {
      result.current.mutate({ lock_date: "2026-01-31" });
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(toast.error).toHaveBeenCalledWith("Сервер вернул ошибку 400");
    expect(queryClient.invalidateQueries).not.toHaveBeenCalled();
  });
});
