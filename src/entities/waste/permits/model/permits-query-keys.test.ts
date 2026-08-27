import { describe, expect, it } from "vitest";
import { permitsQueryKeys } from "./permits-query-keys";

describe("permitsQueryKeys", () => {
  it("builds hierarchical list and detail keys", () => {
    const params = {
      limit: 50,
      offset: 0,
      sort: "start_date" as const,
      order: "desc" as const,
      status: "active" as const,
    };

    expect(permitsQueryKeys.all).toEqual(["mdm", "permits"]);
    expect(permitsQueryKeys.lists()).toEqual(["mdm", "permits", "list"]);
    expect(permitsQueryKeys.list("tenant-1", params)).toEqual([
      "mdm",
      "permits",
      "list",
      "tenant-1",
      params,
    ]);
    expect(permitsQueryKeys.details()).toEqual(["mdm", "permits", "detail"]);
    expect(permitsQueryKeys.detail("tenant-1", "permit-1")).toEqual([
      "mdm",
      "permits",
      "detail",
      "tenant-1",
      "permit-1",
    ]);
  });
});
