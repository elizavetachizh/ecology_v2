import { beforeEach, describe, expect, it, vi } from "vitest";
import { apiSendJson } from "../../../../shared/api/api-client";
import { updateVehicle } from "./update-vehicle";
import { vehicleFixture } from "../model/vehicle.fixture";

vi.mock("../../../../shared/api/api-client", () => ({
  apiSendJson: vi.fn(),
}));

const apiSendJsonMock = vi.mocked(apiSendJson);

describe("updateVehicle", () => {
  beforeEach(() => {
    apiSendJsonMock.mockResolvedValue(vehicleFixture);
  });

  it("patches by id, tenant-scoped", async () => {
    const body = { license_plate: "5678 CD-7", weight: null };
    await expect(updateVehicle("vehicle-1", body)).resolves.toEqual(
      vehicleFixture,
    );

    expect(apiSendJsonMock).toHaveBeenCalledWith(
      "/api/v1/mdm/vehicles/vehicle-1",
      {
        method: "PATCH",
        body,
        tenantScoped: true,
        signal: undefined,
      },
    );
  });

  it("forwards abort signal", async () => {
    const signal = new AbortController().signal;
    await updateVehicle("vehicle-1", { make: "КАМАЗ" }, signal);

    expect(apiSendJsonMock).toHaveBeenCalledWith(
      "/api/v1/mdm/vehicles/vehicle-1",
      {
        method: "PATCH",
        body: { make: "КАМАЗ" },
        tenantScoped: true,
        signal,
      },
    );
  });
});
