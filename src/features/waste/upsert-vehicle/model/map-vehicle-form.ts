import type {
  Vehicle,
  VehicleCreate,
  VehicleUpdate,
} from "../../../../entities/waste/vehicles";
import type { VehicleFormValues } from "./vehicle-form.schema";

function emptyToInt(value: string): number | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  return Number(trimmed);
}

export function toVehicleFormValues(vehicle: Vehicle): VehicleFormValues {
  return {
    make: vehicle.make,
    model: vehicle.model,
    license_plate: vehicle.license_plate,
    weight: vehicle.weight == null ? "" : String(vehicle.weight),
    status: vehicle.status,
    beltopgas_id:
      vehicle.beltopgas_id == null ? "" : String(vehicle.beltopgas_id),
  };
}

export function toVehicleWriteBody(values: VehicleFormValues): VehicleCreate {
  return {
    make: values.make.trim(),
    model: values.model.trim(),
    license_plate: values.license_plate.trim(),
    weight: emptyToInt(values.weight),
    status: values.status,
    beltopgas_id: emptyToInt(values.beltopgas_id),
  };
}

export function toVehicleUpdateBody(values: VehicleFormValues): VehicleUpdate {
  return toVehicleWriteBody(values);
}
