import { describe, expect, it } from "vitest";
import { instructionsQueryKeys } from "./instruction-query-keys";

describe("instructionsQueryKeys", () => {
  it("builds hierarchical list and detail keys", () => {
    const params = {
      limit: 50,
      offset: 0,
      status: "active" as const,
      sort: "name" as const,
      order: "asc" as const,
    };

    expect(instructionsQueryKeys.all).toEqual(["mdm", "instructions"]);
    expect(instructionsQueryKeys.lists()).toEqual([
      "mdm",
      "instructions",
      "list",
    ]);
    expect(instructionsQueryKeys.list("tenant-1", params)).toEqual([
      "mdm",
      "instructions",
      "list",
      "tenant-1",
      params,
    ]);
    expect(instructionsQueryKeys.details()).toEqual([
      "mdm",
      "instructions",
      "detail",
    ]);
    expect(instructionsQueryKeys.detail("tenant-1", "ins-1")).toEqual([
      "mdm",
      "instructions",
      "detail",
      "tenant-1",
      "ins-1",
    ]);
  });
});
