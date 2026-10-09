import { userProfileFixture } from "../../persons";
import type { Vehicle, VehicleBrief } from "./vehicles.types";

export const vehicleFixture: Vehicle = {
  id: "vehicle-1",
  tenant_id: "tenant-1",
  make: "МАЗ",
  model: "5551",
  license_plate: "1234 AB-7",
  weight: 12000,
  status: "active",
  beltopgas_id: 1001,
  created_at: "2026-01-01T00:00:00Z",
  updated_at: "2026-01-02T00:00:00Z",
  created_by: userProfileFixture,
  updated_by: userProfileFixture,
};

export const vehicleBriefFixture: VehicleBrief = {
  id: vehicleFixture.id,
  make: vehicleFixture.make,
  model: vehicleFixture.model,
  license_plate: vehicleFixture.license_plate,
  weight: vehicleFixture.weight,
  status: vehicleFixture.status,
  beltopgas_id: vehicleFixture.beltopgas_id,
};
