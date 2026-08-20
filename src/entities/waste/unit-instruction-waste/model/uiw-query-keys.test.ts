import { describe, expect, it } from "vitest";
import { uiwQueryKeys } from "./uiw-query-keys";

describe("uiwQueryKeys", () => {
  it("builds hierarchical list, unit-instruction and detail keys", () => {
    const scope = { unitId: "unit-1", instructionId: "ins-1" };
    const listParams = { limit: 50, offset: 0 };
    const instructionParams = {
      limit: 50,
      offset: 0,
      sort: "name" as const,
      order: "asc" as const,
    };

    expect(uiwQueryKeys.all).toEqual(["mdm", "uiw"]);
    expect(uiwQueryKeys.lists()).toEqual(["mdm", "uiw", "list"]);
    expect(uiwQueryKeys.list("tenant-1", scope, listParams)).toEqual([
      "mdm",
      "uiw",
      "list",
      "tenant-1",
      scope,
      listParams,
    ]);
    expect(uiwQueryKeys.unitInstructions()).toEqual([
      "mdm",
      "uiw",
      "unit-instructions",
    ]);
    expect(
      uiwQueryKeys.unitInstructionList("tenant-1", "unit-1", instructionParams),
    ).toEqual([
      "mdm",
      "uiw",
      "unit-instructions",
      "tenant-1",
      "unit-1",
      instructionParams,
    ]);
    expect(uiwQueryKeys.detail("tenant-1", scope, "bind-1")).toEqual([
      "mdm",
      "uiw",
      "detail",
      "tenant-1",
      scope,
      "bind-1",
    ]);
  });
});
