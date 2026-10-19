import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { DEFAULT_STALE_TIME_MS } from "../../../shared/lib/query-client";
import { getNotifications } from "../api/get-notifications";
import { notificationFixture } from "./notification.fixture";
import { notificationsQueryKeys } from "./notifications-query-keys";
import {
  DEFAULT_NOTIFICATIONS_LIST_PARAMS,
  type NotificationListResponse,
} from "./notifications.types";
import { useNotificationsListQuery } from "./use-notifications-list-query";

vi.mock("../api/get-notifications", () => ({
  getNotifications: vi.fn(),
}));

const getNotificationsMock = vi.mocked(getNotifications);

const response: NotificationListResponse = {
  total: 1,
  limit: 50,
  offset: 0,
  items: [notificationFixture],
};

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

describe("useNotificationsListQuery", () => {
  beforeEach(() => {
    getNotificationsMock.mockReset();
    getNotificationsMock.mockResolvedValue(response);
  });

  it("does not fetch without a tenant", () => {
    const { Wrapper } = createClient();
    const { result } = renderHook(
      () =>
        useNotificationsListQuery({
          tenantId: null,
          params: DEFAULT_NOTIFICATIONS_LIST_PARAMS,
        }),
      { wrapper: Wrapper },
    );

    expect(getNotificationsMock).not.toHaveBeenCalled();
    expect(result.current.items).toEqual([]);
    expect(result.current.loading).toBe(false);
  });

  it("stays idle while the panel is closed", () => {
    const { Wrapper } = createClient();
    renderHook(
      () =>
        useNotificationsListQuery({
          tenantId: "tenant-1",
          params: DEFAULT_NOTIFICATIONS_LIST_PARAMS,
          enabled: false,
        }),
      { wrapper: Wrapper },
    );

    expect(getNotificationsMock).not.toHaveBeenCalled();
  });

  it("loads the open list and refetches on interval and window focus", async () => {
    const { client, Wrapper } = createClient();
    const { result } = renderHook(
      () =>
        useNotificationsListQuery({
          tenantId: "tenant-1",
          params: DEFAULT_NOTIFICATIONS_LIST_PARAMS,
        }),
      { wrapper: Wrapper },
    );

    await waitFor(() => {
      expect(result.current.items).toEqual([notificationFixture]);
    });
    expect(result.current.total).toBe(1);
    expect(getNotificationsMock).toHaveBeenCalledWith(
      DEFAULT_NOTIFICATIONS_LIST_PARAMS,
      expect.any(AbortSignal),
    );

    const query = client.getQueryCache().find({
      queryKey: notificationsQueryKeys.list(
        "tenant-1",
        DEFAULT_NOTIFICATIONS_LIST_PARAMS,
      ),
    });
    const options = query?.observers[0]?.options;
    expect(options?.staleTime).toBe(DEFAULT_STALE_TIME_MS);
    expect(options?.refetchInterval).toBe(5 * DEFAULT_STALE_TIME_MS);
    expect(options?.refetchOnWindowFocus).toBe(true);
  });
});
