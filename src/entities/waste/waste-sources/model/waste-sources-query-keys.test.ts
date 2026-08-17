import { describe, expect, it } from "vitest";
import { wasteSourcesQueryKeys } from "./waste-sources-query-keys";

describe("wasteSourcesQueryKeys", () => {
  it("builds hierarchical list and detail keys", () => {
    const params = { limit: 50, offset: 0, sort: "name" as const, order: "asc" as const };

    expect(wasteSourcesQueryKeys.all).toEqual(["mdm", "waste-sources"]);
    expect(wasteSourcesQueryKeys.lists()).toEqual([
      "mdm",
      "waste-sources",
      "list",
    ]);
    expect(wasteSourcesQueryKeys.list("tenant-1", params)).toEqual([
      "mdm",
      "waste-sources",
      "list",
      "tenant-1",
      params,
    ]);
    expect(wasteSourcesQueryKeys.details()).toEqual([
      "mdm",
      "waste-sources",
      "detail",
    ]);
    expect(wasteSourcesQueryKeys.detail("tenant-1", "ws-1")).toEqual([
      "mdm",
      "waste-sources",
      "detail",
      "tenant-1",
      "ws-1",
    ]);
  });
});
