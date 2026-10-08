import { beforeEach, describe, expect, it, vi } from "vitest";
import { apiJson } from "../../../shared/api/api-client";
import { notificationFixture } from "../model/notification.fixture";
import type { NotificationListResponse } from "../model/notifications.types";
import { getNotifications } from "./get-notifications";

vi.mock("../../../shared/api/api-client", () => ({
  apiJson: vi.fn(),
}));

const apiJsonMock = vi.mocked(apiJson);

const response: NotificationListResponse = {
  total: 1,
  limit: 50,
  offset: 0,
  items: [notificationFixture],
};

describe("getNotifications", () => {
  beforeEach(() => {
    apiJsonMock.mockResolvedValue(response);
  });

  it("requests the open list with limit and offset, tenant-scoped", async () => {
    await expect(
      getNotifications({ status: "open", limit: 50, offset: 0 }),
    ).resolves.toEqual(response);

    expect(apiJsonMock).toHaveBeenCalledWith(
      "/api/v1/notifications?limit=50&offset=0&status=open",
      { signal: undefined, tenantScoped: true },
    );
  });

  it("includes optional filters when provided", async () => {
    await getNotifications({
      status: "resolved",
      severity: "critical",
      code: "transport_unit_threshold",
      limit: 20,
      offset: 10,
    });

    expect(apiJsonMock).toHaveBeenCalledWith(
      "/api/v1/notifications?limit=20&offset=10&status=resolved&severity=critical&code=transport_unit_threshold",
      { signal: undefined, tenantScoped: true },
    );
  });

  it("omits empty optional filters from query string", async () => {
    await getNotifications({
      code: "",
      limit: 50,
      offset: 0,
    });

    expect(apiJsonMock).toHaveBeenCalledWith(
      "/api/v1/notifications?limit=50&offset=0",
      { signal: undefined, tenantScoped: true },
    );
  });

  it("forwards abort signal", async () => {
    const signal = new AbortController().signal;
    await getNotifications({ status: "open", limit: 50, offset: 0 }, signal);

    expect(apiJsonMock).toHaveBeenCalledWith(
      "/api/v1/notifications?limit=50&offset=0&status=open",
      { signal, tenantScoped: true },
    );
  });
});
