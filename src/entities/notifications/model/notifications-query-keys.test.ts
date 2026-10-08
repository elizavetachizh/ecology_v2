import { describe, expect, it } from "vitest";
import { notificationsQueryKeys } from "./notifications-query-keys";

describe("notificationsQueryKeys", () => {
  it("builds summary and list keys with tenantId", () => {
    const params = {
      status: "open" as const,
      limit: 50,
      offset: 0,
    };

    expect(notificationsQueryKeys.all).toEqual(["notifications"]);
    expect(notificationsQueryKeys.summary("tenant-1")).toEqual([
      "notifications",
      "summary",
      "tenant-1",
    ]);
    expect(notificationsQueryKeys.list("tenant-1", params)).toEqual([
      "notifications",
      "list",
      "tenant-1",
      params,
    ]);
  });
});
