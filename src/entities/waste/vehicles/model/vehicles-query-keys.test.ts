import { describe, expect, it } from "vitest";
import { vehiclesQueryKeys } from "./vehicles-query-keys";

describe("vehiclesQueryKeys", () => {
  it("builds hierarchical list and detail keys", () => {
    const params = {
      limit: 50,
      offset: 0,
      sort: "make" as const,
      order: "asc" as const,
      status: "active" as const,
    };

    expect(vehiclesQueryKeys.all).toEqual(["mdm", "vehicles"]);
    expect(vehiclesQueryKeys.lists()).toEqual(["mdm", "vehicles", "list"]);
    expect(vehiclesQueryKeys.list("tenant-1", params)).toEqual([
      "mdm",
      "vehicles",
      "list",
      "tenant-1",
      params,
    ]);
    expect(vehiclesQueryKeys.details()).toEqual(["mdm", "vehicles", "detail"]);
    expect(vehiclesQueryKeys.detail("tenant-1", "vehicle-1")).toEqual([
      "mdm",
      "vehicles",
      "detail",
      "tenant-1",
      "vehicle-1",
    ]);
  });
});
