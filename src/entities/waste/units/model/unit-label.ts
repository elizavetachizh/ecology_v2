import type { Unit } from "./units.types";

export function unitLabel(unit: Pick<Unit, "name" | "short_name">): string {
  return unit.short_name || unit.name;
}
