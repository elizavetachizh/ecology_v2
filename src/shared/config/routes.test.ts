import { describe, expect, it } from "vitest";
import { routes } from "./routes";

describe("routes", () => {
  it("builds directory CRUD from a single slug", () => {
    expect(routes.directories.standards).toEqual({
      list: "/directories/standards",
      new: "/directories/standards/new",
      detail: "/directories/standards/$standardId",
    });
    expect(routes.directories.orders).toEqual({
      list: "/directories/orders",
      new: "/directories/orders/new",
      detail: "/directories/orders/$orderId",
    });
    expect(routes.directories.persons).toEqual({
      list: "/directories/persons",
      new: "/directories/persons/new",
      detail: "/directories/persons/$personId",
    });
    expect(routes.directories.vehicles).toEqual({
      list: "/directories/vehicles",
      new: "/directories/vehicles/new",
      detail: "/directories/vehicles/$vehicleId",
    });
  });

  it("keeps domain key independent of URL slug shape", () => {
    expect(routes.directories.wasteSources.list).toBe(
      "/directories/waste-sources",
    );
    expect(routes.operations.detail).toBe("/waste/operations/$operationId");
    expect(routes.reports.pod9).toBe("/reports/pod-9");
    expect(routes.reports.stat1Waste).toBe("/reports/1-waste");
  });
});
