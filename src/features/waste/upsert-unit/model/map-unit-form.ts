import type { Unit, UnitCreate } from "../../../../entities/waste/units";
import type { UnitFormValues } from "./unit-form.schema";

export function toUnitFormValues(unit: Unit): UnitFormValues {
  return {
    name: unit.name,
    short_name: unit.short_name ?? "",
    parent_id: unit.parent_id ?? "",
    region_id: unit.region?.id,
    district_id: unit.district?.id,
    is_pod9: unit.is_pod9 ?? false,
  };
}

export function toUnitWriteBody(values: UnitFormValues): UnitCreate {
  return {
    name: values.name.trim(),
    short_name: values.short_name.trim() || null,
    parent_id: values.parent_id.trim() || null,
    region_id: values.region_id ?? null,
    district_id: values.district_id ?? null,
    is_pod9: values.is_pod9,
  };
}
