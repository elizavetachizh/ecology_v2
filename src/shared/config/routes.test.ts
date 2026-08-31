import { describe, expect, it } from "vitest";
import { routes } from "./routes";

describe("routes", () => {
  it("builds directory CRUD from a single slug", () => {
    expect(routes.directories.standards).toEqual({
      list: "/directories/standards",
      new: "/directories/standards/new",
      detail: "/directories/standards/$standardId",
    });
  });

  it("keeps domain key independent of URL slug shape", () => {
    expect(routes.directories.wasteSources.list).toBe(
      "/directories/waste-sources",
    );
    expect(routes.waste.operations.detail).toBe(
      "/waste/operations/$operationId",
    );
    expect(routes.reports.pod9).toBe("/reports/pod-9");
  });
});
