import { describe, expect, it } from "vitest";
import { vehicleFixture } from "../../../../entities/waste/vehicles/model/vehicle.fixture";
import {
  toVehicleFormValues,
  toVehicleUpdateBody,
  toVehicleWriteBody,
} from "./map-vehicle-form";

describe("toVehicleWriteBody", () => {
  it("sends empty weight and beltopgas_id as null", () => {
    expect(
      toVehicleWriteBody({
        make: " МАЗ ",
        model: " 5551 ",
        license_plate: " 1234 AB-7 ",
        weight: "",
        status: "active",
        beltopgas_id: "  ",
      }),
    ).toEqual({
      make: "МАЗ",
      model: "5551",
      license_plate: "1234 AB-7",
      weight: null,
      status: "active",
      beltopgas_id: null,
    });
  });

  it("sends filled weight and beltopgas_id as numbers", () => {
    expect(
      toVehicleWriteBody({
        make: "МАЗ",
        model: "5551",
        license_plate: "1234 AB-7",
        weight: "12000",
        status: "inactive",
        beltopgas_id: "0",
      }),
    ).toEqual({
      make: "МАЗ",
      model: "5551",
      license_plate: "1234 AB-7",
      weight: 12000,
      status: "inactive",
      beltopgas_id: 0,
    });
  });

  it("uses the same body for update", () => {
    const values = {
      make: "МАЗ",
      model: "5551",
      license_plate: "1234 AB-7",
      weight: "",
      status: "active" as const,
      beltopgas_id: "",
    };
    expect(toVehicleUpdateBody(values)).toEqual(toVehicleWriteBody(values));
  });
});

describe("toVehicleFormValues", () => {
  it("maps null weight and beltopgas_id to empty strings", () => {
    expect(
      toVehicleFormValues({
        ...vehicleFixture,
        weight: null,
        beltopgas_id: null,
        status: "inactive",
      }),
    ).toEqual({
      make: vehicleFixture.make,
      model: vehicleFixture.model,
      license_plate: vehicleFixture.license_plate,
      weight: "",
      status: "inactive",
      beltopgas_id: "",
    });
  });

  it("maps numbers to strings", () => {
    expect(toVehicleFormValues(vehicleFixture)).toMatchObject({
      weight: "12000",
      beltopgas_id: "1001",
      status: "active",
    });
  });
});
