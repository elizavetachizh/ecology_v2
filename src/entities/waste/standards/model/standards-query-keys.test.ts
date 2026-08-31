import { describe, expect, it } from "vitest";
import { standardsQueryKeys } from "./standards-query-keys";

describe("standardsQueryKeys", () => {
  it("builds hierarchical list and detail keys", () => {
    const params = {
      limit: 50,
      offset: 0,
      sort: "start_date" as const,
      order: "desc" as const,
      status: "active" as const,
    };

    expect(standardsQueryKeys.all).toEqual(["mdm", "standards"]);
    expect(standardsQueryKeys.lists()).toEqual(["mdm", "standards", "list"]);
    expect(standardsQueryKeys.list("tenant-1", params)).toEqual([
      "mdm",
      "standards",
      "list",
      "tenant-1",
      params,
    ]);
    expect(standardsQueryKeys.details()).toEqual([
      "mdm",
      "standards",
      "detail",
    ]);
    expect(standardsQueryKeys.detail("tenant-1", "standard-1")).toEqual([
      "mdm",
      "standards",
      "detail",
      "tenant-1",
      "standard-1",
    ]);
  });
});
