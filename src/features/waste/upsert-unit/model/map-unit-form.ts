import type { UnitCreate } from "../../../../entities/waste/units";
import type { UnitFormValues } from "./unit-form.schema";

export function toUnitWriteBody(values: UnitFormValues): UnitCreate {
  return {
    name: values.name.trim(),
    short_name: values.short_name.trim(),
    parent_id: values.parent_id.trim() || undefined,
    region_id: values.region_id ?? null,
    district_id: values.district_id ?? null,
  };
}
