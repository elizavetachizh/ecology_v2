import { beforeEach, describe, expect, it, vi } from "vitest";
import { apiJson } from "../../../../shared/api/api-client";
import { getVehicle } from "./get-vehicle";
import { vehicleFixture } from "../model/vehicle.fixture";

vi.mock("../../../../shared/api/api-client", () => ({
  apiJson: vi.fn(),
}));

const apiJsonMock = vi.mocked(apiJson);

describe("getVehicle", () => {
  beforeEach(() => {
    apiJsonMock.mockResolvedValue(vehicleFixture);
  });

  it("requests detail by id, tenant-scoped", async () => {
    await expect(getVehicle("vehicle-1")).resolves.toEqual(vehicleFixture);

    expect(apiJsonMock).toHaveBeenCalledWith("/api/v1/mdm/vehicles/vehicle-1", {
      method: "GET",
      tenantScoped: true,
      signal: undefined,
    });
  });

  it("forwards abort signal", async () => {
    const signal = new AbortController().signal;
    await getVehicle("vehicle-1", signal);

    expect(apiJsonMock).toHaveBeenCalledWith("/api/v1/mdm/vehicles/vehicle-1", {
      method: "GET",
      tenantScoped: true,
      signal,
    });
  });
});
