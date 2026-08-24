import { describe, expect, it } from "vitest";
import { passportsQueryKeys } from "./passports-query-keys";

describe("passportsQueryKeys", () => {
  it("builds hierarchical list and detail keys", () => {
    const params = {
      limit: 50,
      offset: 0,
      sort: "date" as const,
      order: "desc" as const,
      status: "active" as const,
    };

    expect(passportsQueryKeys.all).toEqual(["operations", "passports"]);
    expect(passportsQueryKeys.lists()).toEqual([
      "operations",
      "passports",
      "list",
    ]);
    expect(passportsQueryKeys.list("tenant-1", params)).toEqual([
      "operations",
      "passports",
      "list",
      "tenant-1",
      params,
    ]);
    expect(passportsQueryKeys.details()).toEqual([
      "operations",
      "passports",
      "detail",
    ]);
    expect(passportsQueryKeys.detail("tenant-1", "p-1")).toEqual([
      "operations",
      "passports",
      "detail",
      "tenant-1",
      "p-1",
    ]);
  });
});
