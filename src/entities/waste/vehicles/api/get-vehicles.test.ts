import { beforeEach, describe, expect, it, vi } from "vitest";
import { apiJson } from "../../../../shared/api/api-client";
import { getVehicles } from "./get-vehicles";
import { vehicleFixture } from "../model/vehicle.fixture";
import type { VehicleListResponse } from "../model/vehicles.types";

vi.mock("../../../../shared/api/api-client", () => ({
  apiJson: vi.fn(),
}));

const apiJsonMock = vi.mocked(apiJson);

const response: VehicleListResponse = {
  total: 1,
  limit: 50,
  offset: 0,
  items: [vehicleFixture],
};

describe("getVehicles", () => {
  beforeEach(() => {
    apiJsonMock.mockResolvedValue(response);
  });

  it("requests list with limit and offset, tenant-scoped", async () => {
    await expect(getVehicles({ limit: 50, offset: 0 })).resolves.toEqual(
      response,
    );

    expect(apiJsonMock).toHaveBeenCalledWith(
      "/api/v1/mdm/vehicles?limit=50&offset=0",
      { signal: undefined, tenantScoped: true },
    );
  });

  it("includes search, status, sort and order when provided", async () => {
    await getVehicles({
      search: "маз",
      status: "active",
      sort: "make",
      order: "asc",
      limit: 20,
      offset: 10,
    });

    expect(apiJsonMock).toHaveBeenCalledWith(
      "/api/v1/mdm/vehicles?limit=20&offset=10&search=%D0%BC%D0%B0%D0%B7&status=active&sort=make&order=asc",
      { signal: undefined, tenantScoped: true },
    );
  });

  it("omits empty search from query string", async () => {
    await getVehicles({
      search: "",
      limit: 50,
      offset: 0,
    });

    expect(apiJsonMock).toHaveBeenCalledWith(
      "/api/v1/mdm/vehicles?limit=50&offset=0",
      { signal: undefined, tenantScoped: true },
    );
  });

  it("forwards abort signal", async () => {
    const signal = new AbortController().signal;
    await getVehicles({ limit: 50, offset: 0 }, signal);

    expect(apiJsonMock).toHaveBeenCalledWith(
      "/api/v1/mdm/vehicles?limit=50&offset=0",
      { signal, tenantScoped: true },
    );
  });
});
