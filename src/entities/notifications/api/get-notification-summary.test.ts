import { beforeEach, describe, expect, it, vi } from "vitest";
import { apiJson } from "../../../shared/api/api-client";
import { notificationSummaryFixture } from "../model/notification.fixture";
import { getNotificationSummary } from "./get-notification-summary";

vi.mock("../../../shared/api/api-client", () => ({
  apiJson: vi.fn(),
}));

const apiJsonMock = vi.mocked(apiJson);

describe("getNotificationSummary", () => {
  beforeEach(() => {
    apiJsonMock.mockResolvedValue(notificationSummaryFixture);
  });

  it("requests summary, tenant-scoped", async () => {
    await expect(getNotificationSummary()).resolves.toEqual(
      notificationSummaryFixture,
    );

    expect(apiJsonMock).toHaveBeenCalledWith("/api/v1/notifications/summary", {
      signal: undefined,
      tenantScoped: true,
    });
  });

  it("forwards abort signal", async () => {
    const signal = new AbortController().signal;
    await getNotificationSummary(signal);

    expect(apiJsonMock).toHaveBeenCalledWith("/api/v1/notifications/summary", {
      signal,
      tenantScoped: true,
    });
  });
});
