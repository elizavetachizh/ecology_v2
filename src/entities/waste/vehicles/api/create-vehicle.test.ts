import { beforeEach, describe, expect, it, vi } from "vitest";
import { apiSendJson } from "../../../../shared/api/api-client";
import { createVehicle } from "./create-vehicle";
import { vehicleFixture } from "../model/vehicle.fixture";

vi.mock("../../../../shared/api/api-client", () => ({
  apiSendJson: vi.fn(),
}));

const apiSendJsonMock = vi.mocked(apiSendJson);

describe("createVehicle", () => {
  beforeEach(() => {
    apiSendJsonMock.mockResolvedValue(vehicleFixture);
  });

  it("posts create body, tenant-scoped", async () => {
    const body = {
      make: "МАЗ",
      model: "5551",
      license_plate: "1234 AB-7",
      weight: 12000,
      status: "active" as const,
      beltopgas_id: 1001,
    };
    await expect(createVehicle(body)).resolves.toEqual(vehicleFixture);

    expect(apiSendJsonMock).toHaveBeenCalledWith("/api/v1/mdm/vehicles", {
      method: "POST",
      body,
      tenantScoped: true,
      signal: undefined,
    });
  });

  it("forwards abort signal", async () => {
    const signal = new AbortController().signal;
    const body = {
      make: "МАЗ",
      model: "5551",
      license_plate: "1234 AB-7",
    };
    await createVehicle(body, signal);

    expect(apiSendJsonMock).toHaveBeenCalledWith("/api/v1/mdm/vehicles", {
      method: "POST",
      body,
      tenantScoped: true,
      signal,
    });
  });
});
