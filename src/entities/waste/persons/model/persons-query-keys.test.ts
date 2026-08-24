import { describe, expect, it } from "vitest";
import { personsQueryKeys } from "./persons-query-keys";

describe("personsQueryKeys", () => {
  it("builds hierarchical list, detail and assignment keys", () => {
    const params = {
      limit: 50,
      offset: 0,
      sort: "name" as const,
      order: "asc" as const,
    };

    expect(personsQueryKeys.all).toEqual(["mdm", "persons"]);
    expect(personsQueryKeys.lists()).toEqual(["mdm", "persons", "list"]);
    expect(personsQueryKeys.list("tenant-1", params)).toEqual([
      "mdm",
      "persons",
      "list",
      "tenant-1",
      params,
    ]);
    expect(personsQueryKeys.details()).toEqual(["mdm", "persons", "detail"]);
    expect(personsQueryKeys.detail("tenant-1", "person-1")).toEqual([
      "mdm",
      "persons",
      "detail",
      "tenant-1",
      "person-1",
    ]);
    expect(
      personsQueryKeys.assignmentList("tenant-1", {
        personId: "person-1",
        on: "2024-06-01",
      }),
    ).toEqual([
      "mdm",
      "persons",
      "assignments",
      "tenant-1",
      "person-1",
      "2024-06-01",
    ]);
    expect(
      personsQueryKeys.assignmentList("tenant-1", { personId: "person-1" }),
    ).toEqual(["mdm", "persons", "assignments", "tenant-1", "person-1", null]);
  });
});
