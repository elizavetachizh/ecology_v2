import { describe, expect, it } from "vitest";
import { ttnsQueryKeys } from "./ttns-query-keys";

describe("ttnsQueryKeys", () => {
  it("builds hierarchical list and detail keys", () => {
    const params = {
      limit: 50,
      offset: 0,
      sort: "date" as const,
      order: "desc" as const,
      status: "active" as const,
    };

    expect(ttnsQueryKeys.all).toEqual(["operations", "ttns"]);
    expect(ttnsQueryKeys.lists()).toEqual(["operations", "ttns", "list"]);
    expect(ttnsQueryKeys.list("tenant-1", params)).toEqual([
      "operations",
      "ttns",
      "list",
      "tenant-1",
      params,
    ]);
    expect(ttnsQueryKeys.details()).toEqual(["operations", "ttns", "detail"]);
    expect(ttnsQueryKeys.detail("tenant-1", "t-1")).toEqual([
      "operations",
      "ttns",
      "detail",
      "tenant-1",
      "t-1",
    ]);
  });
});
