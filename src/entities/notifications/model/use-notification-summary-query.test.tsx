import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { DEFAULT_STALE_TIME_MS } from "../../../shared/lib/query-client";
import { getNotificationSummary } from "../api/get-notification-summary";
import { notificationSummaryFixture } from "./notification.fixture";
import { notificationsQueryKeys } from "./notifications-query-keys";
import { useNotificationSummaryQuery } from "./use-notification-summary-query";

vi.mock("../api/get-notification-summary", () => ({
  getNotificationSummary: vi.fn(),
}));

const getSummaryMock = vi.mocked(getNotificationSummary);

function createClient() {
  const client = new QueryClient({
    defaultOptions: {
      queries: { retry: false, refetchOnWindowFocus: false },
    },
  });
  function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    );
  }
  return { client, Wrapper };
}

describe("useNotificationSummaryQuery", () => {
  beforeEach(() => {
    getSummaryMock.mockReset();
    getSummaryMock.mockResolvedValue(notificationSummaryFixture);
  });

  it("does not fetch without a tenant", () => {
    const { Wrapper } = createClient();
    const { result } = renderHook(
      () => useNotificationSummaryQuery({ tenantId: null }),
      { wrapper: Wrapper },
    );

    expect(getSummaryMock).not.toHaveBeenCalled();
    expect(result.current.summary).toBeNull();
    expect(result.current.loading).toBe(false);
  });

  it("loads the summary for the active tenant", async () => {
    const { client, Wrapper } = createClient();
    const { result } = renderHook(
      () => useNotificationSummaryQuery({ tenantId: "tenant-1" }),
      { wrapper: Wrapper },
    );

    await waitFor(() => {
      expect(result.current.summary).toEqual(notificationSummaryFixture);
    });
    expect(getSummaryMock).toHaveBeenCalledWith(expect.any(AbortSignal));

    const query = client.getQueryCache().find({
      queryKey: notificationsQueryKeys.summary("tenant-1"),
    });
    const options = query?.observers[0]?.options;
    expect(options?.staleTime).toBe(DEFAULT_STALE_TIME_MS);
    expect(options?.refetchInterval).toBe(5 * DEFAULT_STALE_TIME_MS);
    expect(options?.refetchOnWindowFocus).toBe(true);
  });
});
